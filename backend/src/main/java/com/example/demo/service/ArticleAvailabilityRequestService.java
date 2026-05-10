package com.example.demo.service;

import com.example.demo.model.Article;
import com.example.demo.model.ArticleAvailabilityRequest;
import com.example.demo.model.ArticleStatus;
import com.example.demo.model.Item;
import com.example.demo.model.NotificationType;
import com.example.demo.model.ServiceItem;
import com.example.demo.model.ServiceStatus;
import com.example.demo.model.User;
import com.example.demo.model.Kit;
import com.example.demo.model.KitStatus;
import com.example.demo.repository.ArticleAvailabilityRequestRepository;
import com.example.demo.repository.ArticleRepository;
import com.example.demo.repository.ItemRepository;
import com.example.demo.repository.KitRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class ArticleAvailabilityRequestService {

    @Autowired
    private ArticleAvailabilityRequestRepository requestRepository;

    @Autowired
    private ArticleRepository articleRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private KitRepository kitRepository;

    @Transactional
    public ArticleAvailabilityRequest requestAvailabilityNotification(Long itemId, Long requesterId) {
        return requestAvailabilityNotification(itemId, requesterId, null, null);
    }

    @Transactional
    public ArticleAvailabilityRequest requestAvailabilityNotification(Long itemId, Long requesterId, LocalDate startDate, LocalDate endDate) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Elemento con id " + itemId + " no encontrado"));

        if (isCurrentlyAvailable(item, startDate, endDate)) {
            throw new IllegalStateException(buildAlreadyAvailableMessage(item));
        }

        User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + requesterId));

        if (item.getOwner() == null) {
            throw new IllegalStateException(buildMissingOwnerMessage(item));
        }

        if (item.getOwner().getId().equals(requesterId)) {
            throw new IllegalStateException(buildOwnItemRequestMessage(item));
        }

        if (requestRepository.findByItemIdAndRequesterId(itemId, requesterId).isPresent()) {
            throw new IllegalStateException(buildDuplicateRequestMessage(item));
        }

        ArticleAvailabilityRequest request = new ArticleAvailabilityRequest();
        request.setItem(item);
        request.setRequester(requester);
        return requestRepository.save(request);
    }

    @Transactional
    public void notifyWatchersWhenAvailable(Item item) {
        if (item == null || item.getId() == null || !isCurrentlyAvailable(item)) {
            return;
        }

        List<ArticleAvailabilityRequest> requests = requestRepository.findByItemId(item.getId());
        if (requests.isEmpty()) {
            return;
        }

        for (ArticleAvailabilityRequest request : requests) {
            User requester = request.getRequester();
            if (requester == null) {
                continue;
            }
            String message = buildAvailableMessage(item);
            notificationService.createNotification(
                    requester,
                    message,
                    NotificationType.ARTICLE_AVAILABLE,
                    null,
                    item instanceof Article ? item.getId() : null
            );
        }

        requestRepository.deleteByItemId(item.getId());
    }

    private boolean isCurrentlyAvailable(Item item) {
        return isCurrentlyAvailable(item, null, null);
    }

    private boolean isCurrentlyAvailable(Item item, LocalDate startDate, LocalDate endDate) {
        if (item instanceof Article article) {
            if (article.getStatus() != ArticleStatus.AVAILABLE) return false;
            if (startDate != null && endDate != null) {
                // Si las fechas están fuera del rango de disponibilidad, no está disponible
                LocalDate availableFrom = article.getAvailableFrom();
                LocalDate availableUntil = article.getAvailableUntil();
                if (availableFrom != null && availableUntil != null) {
                    if (startDate.isBefore(availableFrom) || endDate.isAfter(availableUntil)) {
                        return false;
                    }
                }
                List<Kit> overlappingKits = kitRepository.findOverlappingKitsForItem(
                        item.getId(), startDate, endDate,
                        List.of(KitStatus.PAID, KitStatus.ACTIVE));
                if (!overlappingKits.isEmpty()) {
                    int totalUnits = article.getTotalUnits() != null ? article.getTotalUnits() : 1;
                    int maxRented = computeMaxRented(item.getId(), overlappingKits, startDate, endDate);
                    return (totalUnits - maxRented) > 0;
                }
            }
            return true;
        }
        if (item instanceof ServiceItem serviceItem) {
            if (serviceItem.getStatus() != ServiceStatus.ACTIVE) {
                return false;
            }
            int totalUnits = serviceItem.getTotalUnits() != null ? serviceItem.getTotalUnits() : 1;
            if (totalUnits <= 0) {
                return false;
            }
            if (startDate != null && endDate != null) {
                // Si las fechas están fuera del rango de disponibilidad, no está disponible
                LocalDate availableFrom = serviceItem.getAvailableFrom();
                LocalDate availableUntil = serviceItem.getAvailableUntil();
                if (availableFrom != null && availableUntil != null) {
                    if (startDate.isBefore(availableFrom) || endDate.isAfter(availableUntil)) {
                        return false;
                    }
                }
                List<Kit> overlappingKits = kitRepository.findOverlappingKitsForItem(
                        item.getId(), startDate, endDate,
                        List.of(KitStatus.PAID, KitStatus.ACTIVE));
                if (!overlappingKits.isEmpty()) {
                    int maxRented = computeMaxRented(item.getId(), overlappingKits, startDate, endDate);
                    return (totalUnits - maxRented) > 0;
                }
            }
            return true;
        }
        return false;
    }

    private int computeMaxRented(Long itemId, List<Kit> overlappingKits, LocalDate startDate, LocalDate endDate) {
        int maxRented = 0;
        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            int rentedToday = 0;
            for (Kit kit : overlappingKits) {
                if (!date.isBefore(kit.getStartDate()) && !date.isAfter(kit.getEndDate())) {
                    rentedToday += kit.getSnapshots().stream()
                            .filter(snap -> snap.getOriginalItemId().equals(itemId))
                            .mapToInt(snap -> snap.getSelectedUnits())
                            .sum();
                }
            }
            if (rentedToday > maxRented) maxRented = rentedToday;
        }
        return maxRented;
    }

    private String buildAlreadyAvailableMessage(Item item) {
        if (item instanceof ServiceItem) {
            return "El servicio ya está disponible. No es necesario crear un aviso.";
        }
        return "El artículo ya está disponible. No es necesario crear un aviso.";
    }

    private String buildMissingOwnerMessage(Item item) {
        if (item instanceof ServiceItem) {
            return "El servicio no tiene propietario asignado";
        }
        return "El artículo no tiene propietario asignado";
    }

    private String buildOwnItemRequestMessage(Item item) {
        if (item instanceof ServiceItem) {
            return "El propietario no puede solicitar el aviso para su propio servicio";
        }
        return "El propietario no puede solicitar el aviso para su propio artículo";
    }

    private String buildDuplicateRequestMessage(Item item) {
        if (item instanceof ServiceItem) {
            return "Ya has solicitado un aviso para este servicio";
        }
        return "Ya has solicitado un aviso para este artículo";
    }

    private String buildAvailableMessage(Item item) {
        if (item instanceof ServiceItem) {
            return "El servicio '" + item.getTitle() + "' ya está disponible.";
        }
        return "El artículo '" + item.getTitle() + "' ya está disponible.";
    }

}
