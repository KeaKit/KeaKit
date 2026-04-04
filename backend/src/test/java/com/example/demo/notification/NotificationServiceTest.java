package com.example.demo.notification;

import com.example.demo.model.*;
import com.example.demo.repository.ArticleRepository;
import com.example.demo.repository.KitRepository;
import com.example.demo.repository.NotificationRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private KitRepository kitRepository;

    @Mock
    private ArticleRepository articleRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private NotificationService notificationService;

    private User landlord1;
    private User landlord2;
    private Kit activeKit;
    private Notification sampleNotification;

    @BeforeEach
    void setUp() {
        landlord1 = new User();
        landlord1.setId(1L);
        landlord1.setName("Dueño 1");

        landlord2 = new User();
        landlord2.setId(2L);
        landlord2.setName("Dueño 2");

        // Simulamos un Snapshot para que el sistema detecte de quién es el objeto alquilado
        ItemMemento memento1 = new ItemMemento();
        memento1.setOwnerAtRental(landlord1);
        
        ItemMemento memento2 = new ItemMemento();
        memento2.setOwnerAtRental(landlord2);

        activeKit = new Kit();
        activeKit.setId(100L);
        activeKit.setName("Kit de Prueba");
        activeKit.setStatus(KitStatus.ACTIVE);
        // CORRECCIÓN: Usamos List.of en lugar de Set.of
        activeKit.setSnapshots(List.of(memento1, memento2));

        sampleNotification = new Notification(landlord1, "Mensaje", NotificationType.ITEM_RENTED, 100L);
        sampleNotification.setId(1L);
    }

    // ── CREATE NOTIFICATION ──────────────────────────────────────────────────

    @Test
    void createNotification_savesCorrectly() {
        notificationService.createNotification(landlord1, "Prueba", NotificationType.ITEM_RENTED, 100L);

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository).save(captor.capture());

        Notification saved = captor.getValue();
        assertThat(saved.getUser()).isEqualTo(landlord1);
        assertThat(saved.getMessage()).isEqualTo("Prueba");
        assertThat(saved.getType()).isEqualTo(NotificationType.ITEM_RENTED);
        assertThat(saved.getRelatedKitId()).isEqualTo(100L);
        assertThat(saved.isRead()).isFalse();
    }

    // ── GET USER NOTIFICATIONS ──────────────────────────────────────────────

    @Test
    void getUserNotifications_returnsList() {
        when(notificationRepository.findByUserIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(sampleNotification));

        List<Notification> result = notificationService.getUserNotifications(1L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(1L);
        verify(notificationRepository).findByUserIdOrderByCreatedAtDesc(1L);
    }

    // ── MARK AS READ ────────────────────────────────────────────────────────

    @Test
    void markAsRead_success() {
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(sampleNotification));

        notificationService.markAsRead(1L);

        assertThat(sampleNotification.isRead()).isTrue();
        verify(notificationRepository).save(sampleNotification);
    }

    @Test
    void markAsRead_notFound_throwsException() {
        when(notificationRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> notificationService.markAsRead(99L));
        assertThat(ex.getMessage()).isEqualTo("Notification not found");
        verify(notificationRepository, never()).save(any());
    }

    // ── RN-NOT-05: OBJETO ALQUILADO ────────────────────────────────────────

    @Test
    void notifyLandlordsOnKitActive_createsNotificationForEveryLandlord() {
        notificationService.notifyLandlordsOnKitActive(activeKit);

        // Como el kit tiene objetos de dos dueños distintos, debe crearse una notificación para cada uno
        verify(notificationRepository, times(2)).save(any(Notification.class));
    }

    @Test
    void notifyLandlordsOnKitActive_noSnapshots_doesNothing() {
        Kit emptyKit = new Kit();
        emptyKit.setSnapshots(null);

        notificationService.notifyLandlordsOnKitActive(emptyKit);

        verify(notificationRepository, never()).save(any());
    }

    // ── RN-NOT-06: RECORDATORIO DE DEVOLUCIÓN (CRON JOB) ───────────────────

    // ── CU-ARRENDADOR-06: ALERTA DE DEMANDA ────────────────────────────────

    @Test
    void createDemandAlert_createsNotificationForOwner() {
        User owner = new User();
        owner.setId(10L);
        owner.setName("Owner");

        User requester = new User();
        requester.setId(20L);
        requester.setName("Requester");

        Article article = new Article();
        article.setId(5L);
        article.setTitle("Taladro");
        article.setStatus(ArticleStatus.RENTED);
        article.setOwner(owner);

        when(articleRepository.findById(5L)).thenReturn(Optional.of(article));
        when(userRepository.findById(20L)).thenReturn(Optional.of(requester));
        when(notificationRepository.save(any(Notification.class))).thenAnswer(i -> i.getArgument(0));

        Notification result = notificationService.createDemandAlert(5L, 20L);

        assertThat(result.getUser()).isEqualTo(owner);
        assertThat(result.getType()).isEqualTo(NotificationType.DEMAND_ALERT);
        assertThat(result.getMessage()).contains("Requester");
        assertThat(result.getMessage()).contains("Taladro");
        assertThat(result.getRelatedArticleId()).isEqualTo(5L);
        assertThat(result.isRead()).isFalse();
        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    void createDemandAlert_articleAvailable_throwsIllegalState() {
        Article article = new Article();
        article.setId(5L);
        article.setStatus(ArticleStatus.AVAILABLE);

        when(articleRepository.findById(5L)).thenReturn(Optional.of(article));

        assertThrows(IllegalStateException.class, () -> notificationService.createDemandAlert(5L, 20L));
        verify(notificationRepository, never()).save(any());
    }

    @Test
    void createDemandAlert_articleNotFound_throwsRuntimeException() {
        when(articleRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> notificationService.createDemandAlert(99L, 20L));
        verify(notificationRepository, never()).save(any());
    }

    @Test
    void createDemandAlert_ownerIsRequester_throwsIllegalState() {
        User owner = new User();
        owner.setId(10L);
        owner.setName("Owner");

        Article article = new Article();
        article.setId(5L);
        article.setStatus(ArticleStatus.RENTED);
        article.setOwner(owner);

        when(articleRepository.findById(5L)).thenReturn(Optional.of(article));
        when(userRepository.findById(10L)).thenReturn(Optional.of(owner));

        assertThrows(IllegalStateException.class, () -> notificationService.createDemandAlert(5L, 10L));
        verify(notificationRepository, never()).save(any());
    }

    @Test
    void checkUpcomingReturns_createsRemindersForCorrectKits() {
        LocalDate targetDate = LocalDate.now().plusDays(2);
        when(kitRepository.findByStatusAndEndDate(KitStatus.ACTIVE, targetDate)).thenReturn(List.of(activeKit));

        notificationService.checkUpcomingReturns();

        // Debe crear 2 notificaciones (una para cada dueño del kit)
        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository, times(2)).save(captor.capture());

        List<Notification> savedNotifications = captor.getAllValues();
        assertThat(savedNotifications.get(0).getType()).isEqualTo(NotificationType.RETURN_REMINDER);
        assertThat(savedNotifications.get(0).getMessage()).contains("están a punto de ser devueltos");
    }
}