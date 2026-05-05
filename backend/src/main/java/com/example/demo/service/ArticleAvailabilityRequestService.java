package com.example.demo.service;

import com.example.demo.model.Article;
import com.example.demo.model.ArticleAvailabilityRequest;
import com.example.demo.model.ArticleStatus;
import com.example.demo.model.Item;
import com.example.demo.model.NotificationType;
import com.example.demo.model.ServiceItem;
import com.example.demo.model.ServiceStatus;
import com.example.demo.model.User;
import com.example.demo.repository.ArticleAvailabilityRequestRepository;
import com.example.demo.repository.ArticleRepository;
import com.example.demo.repository.ItemRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    @Transactional
    public ArticleAvailabilityRequest requestAvailabilityNotification(Long itemId, Long requesterId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Elemento con id " + itemId + " no encontrado"));

        if (isCurrentlyAvailable(item)) {
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
        if (item instanceof Article article) {
            return article.getStatus() == ArticleStatus.AVAILABLE;
        }
        if (item instanceof ServiceItem serviceItem) {
            return serviceItem.getStatus() == ServiceStatus.ACTIVE;
        }
        return false;
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
