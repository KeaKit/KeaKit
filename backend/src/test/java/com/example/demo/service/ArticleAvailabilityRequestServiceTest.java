package com.example.demo.service;

import com.example.demo.model.Article;
import com.example.demo.model.ArticleAvailabilityRequest;
import com.example.demo.model.ArticleStatus;
import com.example.demo.model.ItemMemento;
import com.example.demo.model.Kit;
import com.example.demo.model.KitStatus;
import com.example.demo.model.ServiceItem;
import com.example.demo.model.ServiceStatus;
import com.example.demo.model.User;
import com.example.demo.repository.ArticleAvailabilityRequestRepository;
import com.example.demo.repository.ArticleRepository;
import com.example.demo.repository.ItemRepository;
import com.example.demo.repository.KitRepository;
import com.example.demo.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ArticleAvailabilityRequestServiceTest {

    @Mock
    private ArticleAvailabilityRequestRepository requestRepository;

    @Mock
    private ArticleRepository articleRepository;

    @Mock
    private ItemRepository itemRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private KitRepository kitRepository;

    @InjectMocks
    private ArticleAvailabilityRequestService availabilityRequestService;

    private Article unavailableArticle;
    private User requester;

    @BeforeEach
    void setUp() {
        unavailableArticle = new Article();
        unavailableArticle.setId(100L);
        unavailableArticle.setTitle("Sofá cama");
        unavailableArticle.setStatus(ArticleStatus.RENTED);
        User owner = new User();
        owner.setId(200L);
        unavailableArticle.setOwner(owner);

        requester = new User();
        requester.setId(300L);
        requester.setName("Arrendatario prueba");
    }

    @Test
    void requestAvailabilityNotification_success() {
        when(itemRepository.findById(100L)).thenReturn(Optional.of(unavailableArticle));
        when(userRepository.findById(300L)).thenReturn(Optional.of(requester));
        when(requestRepository.findByItemIdAndRequesterId(100L, 300L)).thenReturn(Optional.empty());
        when(requestRepository.save(any(ArticleAvailabilityRequest.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ArticleAvailabilityRequest result = availabilityRequestService.requestAvailabilityNotification(100L, 300L);

        assertNotNull(result);
        assertEquals(100L, result.getItem().getId());
        assertEquals(300L, result.getRequester().getId());
        verify(requestRepository).save(any(ArticleAvailabilityRequest.class));
    }

    @Test
    void requestAvailabilityNotification_articleAvailable_throws() {
        unavailableArticle.setStatus(ArticleStatus.AVAILABLE);
        when(itemRepository.findById(100L)).thenReturn(Optional.of(unavailableArticle));

        IllegalStateException exception = assertThrows(IllegalStateException.class,
                () -> availabilityRequestService.requestAvailabilityNotification(100L, 300L));

        assertEquals("El artículo ya está disponible. No es necesario crear un aviso.", exception.getMessage());
        verify(requestRepository, never()).save(any());
    }

    @Test
    void requestAvailabilityNotification_serviceSuccess() {
        ServiceItem unavailableService = new ServiceItem();
        unavailableService.setId(101L);
        unavailableService.setTitle("Montaje de muebles");
        unavailableService.setStatus(ServiceStatus.UNAVAILABLE);
        User owner = new User();
        owner.setId(201L);
        unavailableService.setOwner(owner);

        when(itemRepository.findById(101L)).thenReturn(Optional.of(unavailableService));
        when(userRepository.findById(300L)).thenReturn(Optional.of(requester));
        when(requestRepository.findByItemIdAndRequesterId(101L, 300L)).thenReturn(Optional.empty());
        when(requestRepository.save(any(ArticleAvailabilityRequest.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ArticleAvailabilityRequest result = availabilityRequestService.requestAvailabilityNotification(101L, 300L);

        assertNotNull(result);
        assertEquals(101L, result.getItem().getId());
        verify(requestRepository).save(any(ArticleAvailabilityRequest.class));
    }

    // -----------------------------------------------------------------------
    // Tests para el nuevo overload con startDate / endDate
    // -----------------------------------------------------------------------

    /**
     * Artículo AVAILABLE pero todas sus unidades están alquiladas en las fechas
     * solicitadas → el aviso debe registrarse (no es "disponible" para esas fechas).
     */
    @Test
    void requestAvailabilityNotification_withDates_allUnitsRented_success() {
        Article article = new Article();
        article.setId(100L);
        article.setTitle("MacBook Pro");
        article.setStatus(ArticleStatus.AVAILABLE);
        article.setTotalUnits(1);
        User owner = new User();
        owner.setId(200L);
        article.setOwner(owner);

        LocalDate start = LocalDate.of(2026, 6, 1);
        LocalDate end   = LocalDate.of(2026, 6, 10);

        // Kit que ocupa la única unidad durante esas fechas
        ItemMemento snap = new ItemMemento();
        snap.setOriginalItemId(100L);
        snap.setSelectedUnits(1);

        Kit kit = new Kit();
        kit.setId(1L);
        kit.setStatus(KitStatus.ACTIVE);
        kit.setStartDate(start);
        kit.setEndDate(end);
        kit.setSnapshots(List.of(snap));

        when(itemRepository.findById(100L)).thenReturn(Optional.of(article));
        when(kitRepository.findOverlappingKitsForItem(100L, start, end,
                List.of(KitStatus.PAID, KitStatus.ACTIVE))).thenReturn(List.of(kit));
        when(userRepository.findById(300L)).thenReturn(Optional.of(requester));
        when(requestRepository.findByItemIdAndRequesterId(100L, 300L)).thenReturn(Optional.empty());
        when(requestRepository.save(any(ArticleAvailabilityRequest.class))).thenAnswer(i -> i.getArgument(0));

        ArticleAvailabilityRequest result =
                availabilityRequestService.requestAvailabilityNotification(100L, 300L, start, end);

        assertNotNull(result);
        verify(requestRepository).save(any(ArticleAvailabilityRequest.class));
    }

    /**
     * Artículo AVAILABLE con unidades libres en las fechas solicitadas
     * → debe lanzar excepción (ya está disponible para esas fechas).
     */
    @Test
    void requestAvailabilityNotification_withDates_unitsAvailable_throws() {
        Article article = new Article();
        article.setId(100L);
        article.setTitle("MacBook Pro");
        article.setStatus(ArticleStatus.AVAILABLE);
        article.setTotalUnits(2);
        User owner = new User();
        owner.setId(200L);
        article.setOwner(owner);

        LocalDate start = LocalDate.of(2026, 6, 1);
        LocalDate end   = LocalDate.of(2026, 6, 10);

        // Kit que ocupa solo 1 de las 2 unidades → queda 1 libre
        ItemMemento snap = new ItemMemento();
        snap.setOriginalItemId(100L);
        snap.setSelectedUnits(1);

        Kit kit = new Kit();
        kit.setId(1L);
        kit.setStatus(KitStatus.ACTIVE);
        kit.setStartDate(start);
        kit.setEndDate(end);
        kit.setSnapshots(List.of(snap));

        when(itemRepository.findById(100L)).thenReturn(Optional.of(article));
        when(kitRepository.findOverlappingKitsForItem(100L, start, end,
                List.of(KitStatus.PAID, KitStatus.ACTIVE))).thenReturn(List.of(kit));

        IllegalStateException ex = assertThrows(IllegalStateException.class,
                () -> availabilityRequestService.requestAvailabilityNotification(100L, 300L, start, end));

        assertEquals("El artículo ya está disponible. No es necesario crear un aviso.", ex.getMessage());
        verify(requestRepository, never()).save(any());
    }

    /**
     * Artículo AVAILABLE con fechas fuera de su rango availableFrom/availableUntil
     * → debe permitir el aviso (no está disponible para esas fechas).
     */
    @Test
    void requestAvailabilityNotification_withDatesOutsideRange_article_success() {
        Article article = new Article();
        article.setId(100L);
        article.setTitle("MacBook Pro");
        article.setStatus(ArticleStatus.AVAILABLE);
        article.setTotalUnits(1);
        article.setAvailableFrom(LocalDate.of(2026, 1, 1));
        article.setAvailableUntil(LocalDate.of(2026, 12, 31));
        User owner = new User();
        owner.setId(200L);
        article.setOwner(owner);

        // Fechas fuera del rango configurado (2030)
        LocalDate start = LocalDate.of(2030, 3, 1);
        LocalDate end   = LocalDate.of(2030, 3, 15);

        when(itemRepository.findById(100L)).thenReturn(Optional.of(article));
        when(userRepository.findById(300L)).thenReturn(Optional.of(requester));
        when(requestRepository.findByItemIdAndRequesterId(100L, 300L)).thenReturn(Optional.empty());
        when(requestRepository.save(any(ArticleAvailabilityRequest.class))).thenAnswer(i -> i.getArgument(0));

        ArticleAvailabilityRequest result =
                availabilityRequestService.requestAvailabilityNotification(100L, 300L, start, end);

        assertNotNull(result);
        verify(requestRepository).save(any(ArticleAvailabilityRequest.class));
    }

    /**
     * Servicio ACTIVE con fechas fuera de su rango availableFrom/availableUntil
     * → debe permitir el aviso.
     */
    @Test
    void requestAvailabilityNotification_withDatesOutsideRange_service_success() {
        ServiceItem service = new ServiceItem();
        service.setId(101L);
        service.setTitle("Montaje de muebles");
        service.setStatus(ServiceStatus.ACTIVE);
        service.setTotalUnits(2);
        service.setAvailableFrom(LocalDate.of(2026, 1, 1));
        service.setAvailableUntil(LocalDate.of(2026, 12, 31));
        User owner = new User();
        owner.setId(201L);
        service.setOwner(owner);

        // Fechas fuera del rango configurado (2030)
        LocalDate start = LocalDate.of(2030, 6, 1);
        LocalDate end   = LocalDate.of(2030, 6, 10);

        when(itemRepository.findById(101L)).thenReturn(Optional.of(service));
        when(userRepository.findById(300L)).thenReturn(Optional.of(requester));
        when(requestRepository.findByItemIdAndRequesterId(101L, 300L)).thenReturn(Optional.empty());
        when(requestRepository.save(any(ArticleAvailabilityRequest.class))).thenAnswer(i -> i.getArgument(0));

        ArticleAvailabilityRequest result =
                availabilityRequestService.requestAvailabilityNotification(101L, 300L, start, end);

        assertNotNull(result);
        verify(requestRepository).save(any(ArticleAvailabilityRequest.class));
    }

    /**
     * Artículo AVAILABLE sin kits solapados en las fechas → sigue lanzando excepción.
     */
    @Test
    void requestAvailabilityNotification_withDates_noOverlappingKits_throws() {
        Article article = new Article();
        article.setId(100L);
        article.setTitle("MacBook Pro");
        article.setStatus(ArticleStatus.AVAILABLE);
        article.setTotalUnits(1);
        User owner = new User();
        owner.setId(200L);
        article.setOwner(owner);

        LocalDate start = LocalDate.of(2026, 6, 1);
        LocalDate end   = LocalDate.of(2026, 6, 10);

        when(itemRepository.findById(100L)).thenReturn(Optional.of(article));
        when(kitRepository.findOverlappingKitsForItem(100L, start, end,
                List.of(KitStatus.PAID, KitStatus.ACTIVE))).thenReturn(List.of());

        assertThrows(IllegalStateException.class,
                () -> availabilityRequestService.requestAvailabilityNotification(100L, 300L, start, end));

        verify(requestRepository, never()).save(any());
    }
}
