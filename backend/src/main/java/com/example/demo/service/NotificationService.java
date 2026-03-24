package com.example.demo.service;

import com.example.demo.model.*;
import com.example.demo.repository.KitRepository;
import com.example.demo.repository.NotificationRepository;
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

    // Método general para crear notificaciones
    public void createNotification(User user, String message, NotificationType type, Long kitId) {
        Notification notification = new Notification(user, message, type, kitId);
        notificationRepository.save(notification);
    }

    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setRead(true);
        notificationRepository.save(notification);
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
}
