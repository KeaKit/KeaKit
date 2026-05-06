package com.example.demo.notification;

import com.example.demo.model.*;
import com.example.demo.repository.ArticleAvailabilityRequestRepository;
import com.example.demo.repository.ArticleRepository;
import com.example.demo.repository.ItemRepository;
import com.example.demo.repository.KitRepository;
import com.example.demo.repository.NotificationRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.ArticleAvailabilityRequestService;
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
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
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
    private ItemRepository itemRepository;

    @Mock
    private UserRepository userRepository;
    @Mock
    private ArticleAvailabilityRequestRepository requestRepository;

    @InjectMocks
    private NotificationService notificationService;

    private User landlord1;
    private User landlord2;
    private Kit activeKit;
    private Notification sampleNotification;

    
 

    @InjectMocks
    private ArticleAvailabilityRequestService service;

    private Article article;
    private User owner;
    private User requester;

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
        assertThat(ex.getMessage()).isEqualTo("Notificación no encontrada");
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

        when(itemRepository.findById(5L)).thenReturn(Optional.of(article));
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

    @Test    void createDemandAlert_serviceActiveFullyRentedForDates_createsNotification() {
        ServiceItem serviceItem = new ServiceItem();
        serviceItem.setId(6L);
        serviceItem.setTitle("Instalación Software");
        serviceItem.setStatus(ServiceStatus.ACTIVE);
        serviceItem.setTotalUnits(1);
        serviceItem.setOwner(owner);

        requester = new User();
        requester.setId(20L);
        requester.setName("Requester");

        LocalDate start = LocalDate.of(2026, 5, 7);
        LocalDate end = LocalDate.of(2026, 5, 20);

        ItemMemento snapshot = new ItemMemento();
        snapshot.setOriginalItemId(6L);
        snapshot.setSelectedUnits(1);

        Kit overlappingKit = new Kit();
        overlappingKit.setStatus(KitStatus.ACTIVE);
        overlappingKit.setStartDate(start);
        overlappingKit.setEndDate(end);
        overlappingKit.setSnapshots(List.of(snapshot));

        when(itemRepository.findById(6L)).thenReturn(Optional.of(serviceItem));
        when(kitRepository.findOverlappingKitsForItem(6L, start, end,
                List.of(KitStatus.PAID, KitStatus.ACTIVE))).thenReturn(List.of(overlappingKit));
        when(userRepository.findById(20L)).thenReturn(Optional.of(requester));
        when(notificationRepository.save(any(Notification.class))).thenAnswer(i -> i.getArgument(0));

        Notification result = notificationService.createDemandAlert(6L, 20L, start, end);

        assertThat(result.getUser()).isEqualTo(owner);
        assertThat(result.getType()).isEqualTo(NotificationType.DEMAND_ALERT);
        assertThat(result.getRelatedArticleId()).isNull();
        verify(notificationRepository).save(any(Notification.class));
    }

    @Test    void createDemandAlert_articleAvailable_throwsIllegalState() {
        Article article = new Article();
        article.setId(5L);
        article.setStatus(ArticleStatus.AVAILABLE);

        when(itemRepository.findById(5L)).thenReturn(Optional.of(article));

        assertThrows(IllegalStateException.class, () -> notificationService.createDemandAlert(5L, 20L));
        verify(notificationRepository, never()).save(any());
    }

    @Test
    void createDemandAlert_articleNotFound_throwsRuntimeException() {
        when(itemRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> notificationService.createDemandAlert(99L, 20L));
        verify(notificationRepository, never()).save(any());
    }

    @Test
    void createDemandAlert_serviceCreatesNotificationForOwner() {
        ServiceItem serviceItem = new ServiceItem();
        serviceItem.setId(6L);
        serviceItem.setTitle("Servicio de limpieza");
        serviceItem.setStatus(ServiceStatus.UNAVAILABLE);
        serviceItem.setOwner(owner);

        requester = new User();
        requester.setId(20L);
        requester.setName("Requester");

        when(itemRepository.findById(6L)).thenReturn(Optional.of(serviceItem));
        when(userRepository.findById(20L)).thenReturn(Optional.of(requester));
        when(notificationRepository.save(any(Notification.class))).thenAnswer(i -> i.getArgument(0));

        Notification result = notificationService.createDemandAlert(6L, 20L);

        assertThat(result.getUser()).isEqualTo(owner);
        assertThat(result.getType()).isEqualTo(NotificationType.DEMAND_ALERT);
        assertThat(result.getMessage()).contains("contratar tu servicio");
        assertThat(result.getMessage()).contains("Servicio de limpieza");
        assertThat(result.getRelatedArticleId()).isNull();
    }

    @Test
    void createDemandAlert_serviceActiveWithZeroUnits_createsNotificationForOwner() {
        ServiceItem serviceItem = new ServiceItem();
        serviceItem.setId(6L);
        serviceItem.setTitle("Instalación Software");
        serviceItem.setStatus(ServiceStatus.ACTIVE);
        serviceItem.setTotalUnits(0);
        serviceItem.setOwner(owner);

        requester = new User();
        requester.setId(20L);
        requester.setName("Requester");

        when(itemRepository.findById(6L)).thenReturn(Optional.of(serviceItem));
        when(userRepository.findById(20L)).thenReturn(Optional.of(requester));
        when(notificationRepository.save(any(Notification.class))).thenAnswer(i -> i.getArgument(0));

        Notification result = notificationService.createDemandAlert(6L, 20L);

        assertThat(result.getUser()).isEqualTo(owner);
        assertThat(result.getType()).isEqualTo(NotificationType.DEMAND_ALERT);
        assertThat(result.getRelatedArticleId()).isNull();
        verify(notificationRepository).save(any(Notification.class));
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

        when(itemRepository.findById(5L)).thenReturn(Optional.of(article));
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


    @BeforeEach
    void setUp2() {
        owner = new User();
        owner.setId(1L);

        requester = new User();
        requester.setId(2L);

        article = new Article();
        article.setId(10L);
        article.setOwner(owner);
        article.setStatus(ArticleStatus.RENTED);
    }

    @Test
    void requestAvailability_Success() {
        when(itemRepository.findById(10L)).thenReturn(Optional.of(article));
        when(userRepository.findById(2L)).thenReturn(Optional.of(requester));
        when(requestRepository.findByItemIdAndRequesterId(10L, 2L)).thenReturn(Optional.empty());

        service.requestAvailabilityNotification(10L, 2L);

        verify(requestRepository, times(1)).save(any(ArticleAvailabilityRequest.class));
    }

    @Test
    void requestAvailability_ThrowsIfArticleAlreadyAvailable() {
        article.setStatus(ArticleStatus.AVAILABLE);
        when(itemRepository.findById(10L)).thenReturn(Optional.of(article));

        Exception exception = assertThrows(IllegalStateException.class, () -> {
            service.requestAvailabilityNotification(10L, 2L);
        });

        assertEquals("El artículo ya está disponible. No es necesario crear un aviso.", exception.getMessage());
    }

    @Test
    void requestAvailability_ThrowsIfRequesterIsOwner() {
        when(itemRepository.findById(10L)).thenReturn(Optional.of(article));
        when(userRepository.findById(1L)).thenReturn(Optional.of(owner));

        Exception exception = assertThrows(IllegalStateException.class, () -> {
            service.requestAvailabilityNotification(10L, 1L);
        });

        assertTrue(exception.getMessage().contains("propietario no puede solicitar el aviso"));
    }


    @Test
    void createDemandAlert_forArticle_relatedArticleIdShouldNotBeNull() {
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

        when(itemRepository.findById(5L)).thenReturn(Optional.of(article));
        when(userRepository.findById(20L)).thenReturn(Optional.of(requester));
        when(notificationRepository.save(any(Notification.class))).thenAnswer(i -> i.getArgument(0));

        Notification result = notificationService.createDemandAlert(5L, 20L);

        // Verificar que para artículos, relatedArticleId debe ser el ID del artículo
        assertThat(result.getRelatedArticleId()).isEqualTo(5L);
        assertThat(result.getMessage()).contains("Taladro");
        assertThat(result.getMessage()).contains("Requester");
        verify(notificationRepository).save(any(Notification.class));
    }

    // ── Fechas fuera del rango de disponibilidad ─────────────────────────

    @Test
    void createDemandAlert_articleAvailableButDatesOutOfRange_createsAlert() {
        User owner = new User();
        owner.setId(10L);
        owner.setName("Owner");

        User requester = new User();
        requester.setId(20L);
        requester.setName("Requester");

        Article article = new Article();
        article.setId(5L);
        article.setTitle("Taladro");
        article.setStatus(ArticleStatus.AVAILABLE);
        article.setAvailableFrom(LocalDate.of(2026, 1, 1));
        article.setAvailableUntil(LocalDate.of(2026, 12, 31));
        article.setOwner(owner);

        // Fechas fuera del rango (2030)
        LocalDate start = LocalDate.of(2030, 3, 1);
        LocalDate end   = LocalDate.of(2030, 3, 15);

        when(itemRepository.findById(5L)).thenReturn(Optional.of(article));
        when(userRepository.findById(20L)).thenReturn(Optional.of(requester));
        when(notificationRepository.save(any(Notification.class))).thenAnswer(i -> i.getArgument(0));

        Notification result = notificationService.createDemandAlert(5L, 20L, start, end);

        assertThat(result.getType()).isEqualTo(NotificationType.DEMAND_ALERT);
        assertThat(result.getRelatedArticleId()).isEqualTo(5L);
        assertThat(result.getMessage()).contains("Taladro");
        assertThat(result.getMessage()).contains("2030");
        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    void createDemandAlert_serviceActiveButDatesOutOfRange_createsAlert() {
        User owner = new User();
        owner.setId(10L);
        owner.setName("Owner");

        User requester = new User();
        requester.setId(20L);
        requester.setName("Requester");

        ServiceItem serviceItem = new ServiceItem();
        serviceItem.setId(7L);
        serviceItem.setTitle("Servicio de fontanería");
        serviceItem.setStatus(ServiceStatus.ACTIVE);
        serviceItem.setTotalUnits(2);
        serviceItem.setAvailableFrom(LocalDate.of(2026, 1, 1));
        serviceItem.setAvailableUntil(LocalDate.of(2026, 12, 31));
        serviceItem.setOwner(owner);

        // Fechas fuera del rango (2030)
        LocalDate start = LocalDate.of(2030, 6, 1);
        LocalDate end   = LocalDate.of(2030, 6, 10);

        when(itemRepository.findById(7L)).thenReturn(Optional.of(serviceItem));
        when(userRepository.findById(20L)).thenReturn(Optional.of(requester));
        when(notificationRepository.save(any(Notification.class))).thenAnswer(i -> i.getArgument(0));

        Notification result = notificationService.createDemandAlert(7L, 20L, start, end);

        assertThat(result.getType()).isEqualTo(NotificationType.DEMAND_ALERT);
        assertThat(result.getRelatedArticleId()).isNull();
        assertThat(result.getMessage()).contains("fontanería");
        assertThat(result.getMessage()).contains("2030");
        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    void createDemandAlert_forService_relatedArticleIdShouldBeNull() {
        User owner = new User();
        owner.setId(10L);
        owner.setName("Owner");

        User requester = new User();
        requester.setId(20L);
        requester.setName("Requester");

        ServiceItem serviceItem = new ServiceItem();
        serviceItem.setId(6L);
        serviceItem.setTitle("Servicio de limpieza");
        serviceItem.setStatus(ServiceStatus.UNAVAILABLE);
        serviceItem.setOwner(owner);

        when(itemRepository.findById(6L)).thenReturn(Optional.of(serviceItem));
        when(userRepository.findById(20L)).thenReturn(Optional.of(requester));
        when(notificationRepository.save(any(Notification.class))).thenAnswer(i -> i.getArgument(0));

        Notification result = notificationService.createDemandAlert(6L, 20L);

        // Verificar que para servicios, relatedArticleId debe ser null
        assertThat(result.getRelatedArticleId()).isNull();
        assertThat(result.getMessage()).contains("contratar tu servicio");
        assertThat(result.getMessage()).contains("Servicio de limpieza");
        verify(notificationRepository).save(any(Notification.class));
    }

    
}