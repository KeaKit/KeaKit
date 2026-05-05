package com.example.demo.service;

import com.example.demo.model.*;
import com.example.demo.repository.ArticleRepository;
import com.example.demo.repository.ItemRepository;
import com.example.demo.repository.KitRepository;
import com.example.demo.repository.NotificationRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private KitRepository kitRepository;

    @Autowired
    private ArticleRepository articleRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private UserRepository userRepository;

    // Método general para crear notificaciones
    public void createNotification(User user, String message, NotificationType type, Long kitId) {
        createNotification(user, message, type, kitId, null);
    }

    public void createNotification(User user, String message, NotificationType type, Long kitId, Long relatedArticleId) {
        Notification notification = new Notification(user, message, type, kitId);
        notification.setRelatedArticleId(relatedArticleId);
        notificationRepository.save(notification);
    }

    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notificación no encontrada"));
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    // CU-ARRENDADOR-06: Alerta de demanda
    @Transactional
    public Notification createDemandAlert(Long itemId, Long requesterId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Elemento no encontrado con id: " + itemId));

        if (isAvailableForDemandAlert(item)) {
            throw new IllegalStateException(buildAvailableForDemandAlertMessage(item));
        }

        User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + requesterId));

        User owner = item.getOwner();
        if (owner == null) {
            throw new IllegalStateException(buildMissingOwnerMessage(item));
        }

        if (owner.getId().equals(requesterId)) {
            throw new IllegalStateException(buildOwnItemInterestMessage(item));
        }

        String message = requester.getName() + buildDemandAlertMessageSuffix(item);
        Notification notification = new Notification(owner, message, NotificationType.DEMAND_ALERT, null);
        if (item instanceof Article) {
            notification.setRelatedArticleId(itemId);
        }
        return notificationRepository.save(notification);
    }

    private boolean isAvailableForDemandAlert(Item item) {
        if (item instanceof Article article) {
            return article.getStatus() == ArticleStatus.AVAILABLE;
        }
        if (item instanceof ServiceItem serviceItem) {
            return serviceItem.getStatus() == ServiceStatus.ACTIVE;
        }
        return false;
    }

    private String buildAvailableForDemandAlertMessage(Item item) {
        if (item instanceof ServiceItem) {
            return "El servicio ya está disponible para alquilar";
        }
        return "El artículo ya está disponible para alquilar";
    }

    private String buildMissingOwnerMessage(Item item) {
        if (item instanceof ServiceItem) {
            return "El servicio no tiene propietario asignado";
        }
        return "El artículo no tiene propietario asignado";
    }

    private String buildOwnItemInterestMessage(Item item) {
        if (item instanceof ServiceItem) {
            return "El propietario no puede solicitar su propio servicio";
        }
        return "El propietario no puede solicitar su propio artículo";
    }

    private String buildDemandAlertMessageSuffix(Item item) {
        if (item instanceof ServiceItem) {
            return " está interesado en contratar tu servicio \"" + item.getTitle() + "\", que actualmente no está disponible.";
        }
        return " está interesado en alquilar tu artículo \"" + item.getTitle() + "\", que actualmente no está disponible.";
    }

    // Lógica de RN-NOT-05: Objeto alquilado
    @Transactional
    public void notifyLandlordsOnKitActive(Kit kit) {
        if (kit.getSnapshots() == null) return;

        Set<User> landlords = kit.getSnapshots().stream()
                .map(ItemMemento::getOwnerAtRental)
                .filter(owner -> owner != null)
                .collect(Collectors.toSet());

        for (User landlord : landlords) {
            String message = "¡Enhorabuena! Uno o más de tus objetos han sido alquilados en el Kit: " + kit.getName();
            createNotification(landlord, message, NotificationType.ITEM_RENTED, kit.getId());
        }
    }

    // Lógica de RN-NOT-06: Próximo a devolución
    @Scheduled(cron = "0 0 8 * * ?")
    @Transactional
    public void checkUpcomingReturns() {
        LocalDate targetDate = LocalDate.now().plusDays(2);
        
        List<Kit> kitsEndingSoon = kitRepository.findByStatusAndEndDate(KitStatus.ACTIVE, targetDate);

        for (Kit kit : kitsEndingSoon) {
            if (kit.getSnapshots() == null) continue;

            Set<User> landlords = kit.getSnapshots().stream()
                    .map(ItemMemento::getOwnerAtRental)
                    .filter(owner -> owner != null)
                    .collect(Collectors.toSet());

            for (User landlord : landlords) {
                String message = "Recordatorio: Los objetos que tienes alquilados en el Kit '" + kit.getName() + "' están a punto de ser devueltos (" + targetDate + ").";
                createNotification(landlord, message, NotificationType.RETURN_REMINDER, kit.getId());
            }
        }
    }

    public void deleteNotification(Long id) {
        if (!notificationRepository.existsById(id)) {
            throw new RuntimeException("La notificación no existe");
        }
        notificationRepository.deleteById(id);
    }
}
