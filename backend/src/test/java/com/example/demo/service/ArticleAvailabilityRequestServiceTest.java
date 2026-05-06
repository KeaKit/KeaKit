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

    private static final LocalDate TEST_START = LocalDate.of(2026, 6, 1);
    private static final LocalDate TEST_END   = LocalDate.of(2026, 6, 10);

    private Article buildAvailableArticle(int totalUnits) {
        Article article = new Article();
        article.setId(100L);
        article.setTitle("MacBook Pro");
        article.setStatus(ArticleStatus.AVAILABLE);
        article.setTotalUnits(totalUnits);
        User owner = new User();
        owner.setId(200L);
        article.setOwner(owner);
        return article;
    }

    private Kit buildKit(Long articleId, int selectedUnits) {
        ItemMemento snap = new ItemMemento();
        snap.setOriginalItemId(articleId);
        snap.setSelectedUnits(selectedUnits);

        Kit kit = new Kit();
        kit.setId(1L);
        kit.setStatus(KitStatus.ACTIVE);
        kit.setStartDate(TEST_START);
        kit.setEndDate(TEST_END);
        kit.setSnapshots(List.of(snap));
        return kit;
    }

    /**
     * Artículo AVAILABLE pero todas sus unidades están alquiladas en las fechas
     * solicitadas → el aviso debe registrarse (no es "disponible" para esas fechas).
     */
    @Test
    void requestAvailabilityNotification_withDates_allUnitsRented_success() {
        Article article = buildAvailableArticle(1);
        Kit kit = buildKit(100L, 1);

        when(itemRepository.findById(100L)).thenReturn(Optional.of(article));
        when(kitRepository.findOverlappingKitsForItem(100L, TEST_START, TEST_END,
                List.of(KitStatus.PAID, KitStatus.ACTIVE))).thenReturn(List.of(kit));
        when(userRepository.findById(300L)).thenReturn(Optional.of(requester));
        when(requestRepository.findByItemIdAndRequesterId(100L, 300L)).thenReturn(Optional.empty());
        when(requestRepository.save(any(ArticleAvailabilityRequest.class))).thenAnswer(i -> i.getArgument(0));

        ArticleAvailabilityRequest result =
                availabilityRequestService.requestAvailabilityNotification(100L, 300L, TEST_START, TEST_END);

        assertNotNull(result);
        verify(requestRepository).save(any(ArticleAvailabilityRequest.class));
    }

    /**
     * Artículo AVAILABLE con unidades libres en las fechas solicitadas
     * → debe lanzar excepción (ya está disponible para esas fechas).
     */
    @Test
    void requestAvailabilityNotification_withDates_unitsAvailable_throws() {
        Article article = buildAvailableArticle(2);
        Kit kit = buildKit(100L, 1); // ocupa solo 1 de las 2 unidades → queda 1 libre

        when(itemRepository.findById(100L)).thenReturn(Optional.of(article));
        when(kitRepository.findOverlappingKitsForItem(100L, TEST_START, TEST_END,
                List.of(KitStatus.PAID, KitStatus.ACTIVE))).thenReturn(List.of(kit));

        IllegalStateException ex = assertThrows(IllegalStateException.class,
                () -> availabilityRequestService.requestAvailabilityNotification(100L, 300L, TEST_START, TEST_END));

        assertEquals("El artículo ya está disponible. No es necesario crear un aviso.", ex.getMessage());
        verify(requestRepository, never()).save(any());
    }

    /**
     * Artículo AVAILABLE sin kits solapados en las fechas → sigue lanzando excepción.
     */
    @Test
    void requestAvailabilityNotification_withDates_noOverlappingKits_throws() {
        Article article = buildAvailableArticle(1);

        when(itemRepository.findById(100L)).thenReturn(Optional.of(article));
        when(kitRepository.findOverlappingKitsForItem(100L, TEST_START, TEST_END,
                List.of(KitStatus.PAID, KitStatus.ACTIVE))).thenReturn(List.of());

        assertThrows(IllegalStateException.class,
                () -> availabilityRequestService.requestAvailabilityNotification(100L, 300L, TEST_START, TEST_END));

        verify(requestRepository, never()).save(any());
    }
}
