package com.example.demo.article;

import com.example.demo.dto.ReturnRequest;
import com.example.demo.dto.ReturnResponse;
import com.example.demo.model.*;
import com.example.demo.repository.ArticleRepository;
import com.example.demo.repository.CategoryRepository;
import com.example.demo.repository.KitRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.*; // Importamos todos los servicios

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ArticleReturnExtendedTest {

    @Mock private ArticleRepository articleRepository;
    @Mock private UserRepository userRepository;
    @Mock private CategoryRepository categoryRepository;
    @Mock private KitRepository kitRepository;
    @Mock private CloudinaryService cloudinaryService;
    @Mock private DefaultKitService defaultKitService;
    @Mock private PaymentService paymentService;
    
    // --- MOCK FALTANTE ---
    @Mock private ArticleAvailabilityRequestService availabilityRequestService; 

    @InjectMocks
    private ArticleService articleService;

    private User owner;
    private User tenant;
    private User otherUser;

    @BeforeEach
    void setUp() {
        owner = new User();
        owner.setId(1L);
        owner.setName("Owner");
        owner.setEmail("owner@example.com");
        owner.setRole(UserRole.USER);

        tenant = new User();
        tenant.setId(2L);
        tenant.setName("Tenant");
        tenant.setEmail("tenant@example.com");
        tenant.setRole(UserRole.USER);

        otherUser = new User();
        otherUser.setId(3L);
        otherUser.setName("Other");
        otherUser.setEmail("other@example.com");
        otherUser.setRole(UserRole.USER);
    }

    private Article makeRentedArticle(Long id, double pricePerMonth) {
        Article a = new Article();
        a.setId(id);
        a.setTitle("Rented Article");
        a.setDescription("Description");
        a.setCity("Madrid");
        a.setPricePerMonth(pricePerMonth);
        a.setStatus(ArticleStatus.RENTED);
        a.setOwner(owner);
        a.setAvailableUntil(LocalDate.now().plusDays(10));
        return a;
    }

    private Kit makeActiveKit() {
        Kit kit = new Kit();
        kit.setId(1L);
        kit.setName("Test Kit");
        kit.setStatus(KitStatus.ACTIVE);
        kit.setTenant(tenant);
        kit.setStartDate(LocalDate.now().minusDays(30));
        kit.setEndDate(LocalDate.now());
        return kit;
    }

    // ═══════════════ RN-DEV-01: Only owner can confirm return ═══════════════

    @Test
    void processReturn_notOwner_throwsException() {
        Article article = makeRentedArticle(1L, 100.0);
        when(articleRepository.findById(1L)).thenReturn(Optional.of(article));

        ReturnRequest request = new ReturnRequest("GOOD", "All fine");

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> articleService.processReturn(1L, otherUser.getId(), request));
    assertThat(ex.getMessage()).contains("Solo el propietario puede confirmar la devolución");
    }

// ═══════════════ RN-DEV-02: Only RENTED articles can be returned ═══════════════

    @Test
    void processReturn_articleNotRented_throwsException() {
        Article article = new Article();
        article.setId(1L);
        article.setStatus(ArticleStatus.AVAILABLE);
        article.setOwner(owner);
        when(articleRepository.findById(1L)).thenReturn(Optional.of(article));
        when(kitRepository.findActiveKitByItemId(1L, KitStatus.ACTIVE)).thenReturn(Optional.empty());

        ReturnRequest request = new ReturnRequest("GOOD", "");

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> articleService.processReturn(1L, owner.getId(), request));
        // FIX: Cambiamos el mensaje esperado por el nuevo de nuestra validación
        assertThat(ex.getMessage()).contains("El artículo ya ha sido devuelto o no está alquilado.");
    }

    @Test
    void processReturn_articleInactive_throwsException() {
        Article article = new Article();
        article.setId(1L);
        article.setStatus(ArticleStatus.INACTIVE);
        article.setOwner(owner);
        when(articleRepository.findById(1L)).thenReturn(Optional.of(article));
        when(kitRepository.findActiveKitByItemId(1L, KitStatus.ACTIVE)).thenReturn(Optional.empty());

        ReturnRequest request = new ReturnRequest("GOOD", "");

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> articleService.processReturn(1L, owner.getId(), request));
        // FIX: Cambiamos el mensaje esperado por el nuevo de nuestra validación
        assertThat(ex.getMessage()).contains("El artículo ya ha sido devuelto o no está alquilado.");
    }

    // ═══════════════ Article not found ═══════════════

    @Test
    void processReturn_articleNotFound_throwsException() {
        when(articleRepository.findById(999L)).thenReturn(Optional.empty());

        ReturnRequest request = new ReturnRequest("GOOD", "");

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> articleService.processReturn(999L, owner.getId(), request));
    assertThat(ex.getMessage()).contains("Artículo no encontrado");
    }

    // ═══════════════ RN-DEV-03: Must have active kit ═══════════════

    @Test
    void processReturn_noActiveKit_throwsException() {
        Article article = makeRentedArticle(1L, 100.0);
        when(articleRepository.findById(1L)).thenReturn(Optional.of(article));
        when(kitRepository.findActiveKitByItemId(1L, KitStatus.ACTIVE)).thenReturn(Optional.empty());

        ReturnRequest request = new ReturnRequest("GOOD", "");

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> articleService.processReturn(1L, owner.getId(), request));
    assertThat(ex.getMessage()).contains("No se encontró un Kit activo para este artículo");
    }

    @Test
    void processReturn_activeKitBeforeEndDate_throwsAndDoesNotChangeState() {
        Article article = makeRentedArticle(1L, 100.0);
        Kit activeKit = makeActiveKit();
        activeKit.setEndDate(LocalDate.now().plusDays(1));

        when(articleRepository.findById(1L)).thenReturn(Optional.of(article));
        when(kitRepository.findActiveKitByItemId(1L, KitStatus.ACTIVE)).thenReturn(Optional.of(activeKit));

        ReturnRequest request = new ReturnRequest("GOOD", "");

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> articleService.processReturn(1L, owner.getId(), request));

        assertThat(ex.getMessage()).contains("No se puede procesar la devolución antes de la fecha de fin del contrato");
        assertThat(article.getStatus()).isEqualTo(ArticleStatus.RENTED);
        assertThat(activeKit.getStatus()).isEqualTo(KitStatus.ACTIVE);
        verify(articleRepository, never()).save(any(Article.class));
        verify(kitRepository, never()).save(any(Kit.class));
        verifyNoInteractions(paymentService);
    }

    // ═══════════════ RN-DEV-05 / HU-ARRENDATARIO-40: GOOD → deposit returned ═══════════════

    @Test
    void processReturn_goodCondition_depositsReturnedToTenant() throws Exception {
        Article article = makeRentedArticle(1L, 100.0);
        Kit activeKit = makeActiveKit();

        when(articleRepository.findById(1L)).thenReturn(Optional.of(article));
        when(kitRepository.findActiveKitByItemId(1L, KitStatus.ACTIVE)).thenReturn(Optional.of(activeKit));
        when(articleRepository.save(any(Article.class))).thenAnswer(i -> i.getArgument(0));
        when(paymentService.processGuaranteeReturn(1L, owner.getId(), tenant.getId(), "GOOD")).thenReturn(20.0);

        ReturnRequest request = new ReturnRequest("GOOD", "Perfect condition");
        ReturnResponse response = articleService.processReturn(1L, owner.getId(), request);

        assertThat(response.resolution()).isEqualTo("DEPOSIT_RETURNED");
        
        // Verificación adicional para asegurar que se intentó notificar
        verify(availabilityRequestService).notifyWatchersWhenAvailable(article);
    }

    // ═══════════════ RN-DEV-06 / HU-ARRENDADOR-34: DAMAGED → deposit retained ═══════════════

    @Test
    void processReturn_damagedCondition_depositRetainedByOwner() throws Exception {
        Article article = makeRentedArticle(2L, 200.0);
        Kit activeKit = makeActiveKit();

        // NUEVO: Añadimos el snapshot al kit simulado
        ItemMemento memento = new ItemMemento();
        memento.setOriginalItemId(2L);
        activeKit.setSnapshots(List.of(memento));

        when(articleRepository.findById(2L)).thenReturn(Optional.of(article));
        when(kitRepository.findActiveKitByItemId(2L, KitStatus.ACTIVE)).thenReturn(Optional.of(activeKit));
        when(articleRepository.save(any(Article.class))).thenAnswer(i -> i.getArgument(0));
        when(paymentService.processGuaranteeReturn(1L, owner.getId(), tenant.getId(), "DAMAGED")).thenReturn(40.0);

        ReturnRequest request = new ReturnRequest("DAMAGED", "Has scratches");
        ReturnResponse response = articleService.processReturn(2L, owner.getId(), request);

        assertThat(response.resolution()).isEqualTo("DEPOSIT_RETAINED");
        assertThat(response.amountProcessed()).isEqualTo(40.0);
        assertThat(response.message()).contains("daños");
        verify(paymentService).processGuaranteeReturn(1L, owner.getId(), tenant.getId(), "DAMAGED");
    }

    // ═══════════════ RN-DEV-07: After return, article status → AVAILABLE ═══════════════

    @Test
    void processReturn_goodCondition_setsArticleToAvailable() throws Exception {
        Article article = makeRentedArticle(1L, 100.0);
        Kit activeKit = makeActiveKit();

        when(articleRepository.findById(1L)).thenReturn(Optional.of(article));
        when(kitRepository.findActiveKitByItemId(1L, KitStatus.ACTIVE)).thenReturn(Optional.of(activeKit));
        when(articleRepository.save(any(Article.class))).thenAnswer(i -> i.getArgument(0));
        when(paymentService.processGuaranteeReturn(1L, owner.getId(), tenant.getId(), "GOOD")).thenReturn(20.0);

        articleService.processReturn(1L, owner.getId(), new ReturnRequest("GOOD", ""));

        assertThat(article.getStatus()).isEqualTo(ArticleStatus.AVAILABLE);
        verify(articleRepository).save(article);
    }

    @Test
    void processReturn_damagedCondition_setsArticleToDamaged() throws Exception {
        Article article = makeRentedArticle(1L, 100.0);
        Kit activeKit = makeActiveKit();

        // NUEVO: Añadimos el snapshot al kit simulado
        ItemMemento memento = new ItemMemento();
        memento.setOriginalItemId(1L);
        activeKit.setSnapshots(List.of(memento));

        when(articleRepository.findById(1L)).thenReturn(Optional.of(article));
        when(kitRepository.findActiveKitByItemId(1L, KitStatus.ACTIVE)).thenReturn(Optional.of(activeKit));
        when(articleRepository.save(any(Article.class))).thenAnswer(i -> i.getArgument(0));
        when(paymentService.processGuaranteeReturn(1L, owner.getId(), tenant.getId(), "DAMAGED")).thenReturn(20.0);

        articleService.processReturn(1L, owner.getId(), new ReturnRequest("DAMAGED", "Broken"));

        // CORRECCIÓN: Ahora el estado esperado es DAMAGED
        assertEquals(ArticleStatus.DAMAGED, article.getStatus());
    }

    // ═══════════════ RN-DEV-08: availableUntil is cleared ═══════════════

    @Test
    void processReturn_clearsAvailableUntilDate() throws Exception {
        Article article = makeRentedArticle(1L, 50.0);
        assertThat(article.getAvailableUntil()).isNotNull(); // Pre-condition

        Kit activeKit = makeActiveKit();
        when(articleRepository.findById(1L)).thenReturn(Optional.of(article));
        when(kitRepository.findActiveKitByItemId(1L, KitStatus.ACTIVE)).thenReturn(Optional.of(activeKit));
        when(articleRepository.save(any(Article.class))).thenAnswer(i -> i.getArgument(0));
        when(paymentService.processGuaranteeReturn(1L, owner.getId(), tenant.getId(), "GOOD")).thenReturn(10.0);

        articleService.processReturn(1L, owner.getId(), new ReturnRequest("GOOD", ""));

        assertThat(article.getAvailableUntil()).isNull();
    }

    // ═══════════════ RN-DEV-09: Only GOOD or DAMAGED accepted ═══════════════

    @Test
    void processReturn_invalidCondition_throwsViaPaymentService() throws Exception {
        // Al tener el "Fail-Fast" en la línea 1, ya no hace falta preparar los mocks
        ReturnRequest request = new ReturnRequest("UNKNOWN", "");

        // CORRECCIÓN: Capturamos directamente el IllegalArgumentException de nuestra validación
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> articleService.processReturn(1L, owner.getId(), request));
                
        assertThat(ex.getMessage()).isEqualTo("Condición no válida. Usa GOOD o DAMAGED.");
    }

    // ═══════════════ PaymentService failure is wrapped ═══════════════

    @Test
    void processReturn_paymentServiceFails_wrapsException() throws Exception {
        Article article = makeRentedArticle(1L, 100.0);
        Kit activeKit = makeActiveKit();

        when(articleRepository.findById(1L)).thenReturn(Optional.of(article));
        when(kitRepository.findActiveKitByItemId(1L, KitStatus.ACTIVE)).thenReturn(Optional.of(activeKit));
        when(paymentService.processGuaranteeReturn(1L, owner.getId(), tenant.getId(), "GOOD"))
                .thenThrow(new RuntimeException("Wallet not found"));

        ReturnRequest request = new ReturnRequest("GOOD", "");

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> articleService.processReturn(1L, owner.getId(), request));
        assertThat(ex.getMessage()).contains("Error procesando la devolución de la garantía");
        assertThat(ex.getMessage()).contains("Wallet not found");
    }

    // ═══════════════ Response fields verification ═══════════════

    @Test
    void processReturn_goodCondition_responseContainsCorrectArticleId() throws Exception {
        Article article = makeRentedArticle(42L, 150.0);
        Kit activeKit = makeActiveKit();

        when(articleRepository.findById(42L)).thenReturn(Optional.of(article));
        when(kitRepository.findActiveKitByItemId(42L, KitStatus.ACTIVE)).thenReturn(Optional.of(activeKit));
        when(articleRepository.save(any(Article.class))).thenAnswer(i -> i.getArgument(0));
        when(paymentService.processGuaranteeReturn(1L, owner.getId(), tenant.getId(), "GOOD")).thenReturn(30.0);

        ReturnResponse response = articleService.processReturn(42L, owner.getId(), new ReturnRequest("GOOD", ""));

        assertThat(response.articleId()).isEqualTo(42L);
        assertThat(response.tenantEmail()).isEqualTo("tenant@example.com");
        assertThat(response.amountProcessed()).isEqualTo(0.0);
    }

    @Test
    void processReturn_damagedCondition_messageContainsAmount() throws Exception {
        Article article = makeRentedArticle(5L, 300.0);
        Kit activeKit = makeActiveKit();

        // NUEVO: Añadimos el snapshot al kit simulado
        ItemMemento memento = new ItemMemento();
        memento.setOriginalItemId(5L);
        activeKit.setSnapshots(List.of(memento));

        when(articleRepository.findById(5L)).thenReturn(Optional.of(article));
        when(kitRepository.findActiveKitByItemId(5L, KitStatus.ACTIVE)).thenReturn(Optional.of(activeKit));
        when(articleRepository.save(any(Article.class))).thenAnswer(i -> i.getArgument(0));
        when(paymentService.processGuaranteeReturn(1L, owner.getId(), tenant.getId(), "DAMAGED")).thenReturn(60.0);

        ReturnResponse response = articleService.processReturn(5L, owner.getId(), new ReturnRequest("DAMAGED", "Broken handle"));

        assertThat(response.message()).contains("60.0");
        assertThat(response.message()).contains("propietario");
    }

    @Test
    void processReturn_partialDamage_messageMentionsPartialRefund() throws Exception {
        Article damagedArticle = makeRentedArticle(6L, 50.0);
        Article returnedGoodArticle = makeRentedArticle(7L, 100.0);
        returnedGoodArticle.setStatus(ArticleStatus.AVAILABLE);

        Kit activeKit = makeActiveKit();

        ItemMemento damagedSnapshot = new ItemMemento();
        damagedSnapshot.setOriginalItemId(6L);

        ItemMemento goodSnapshot = new ItemMemento();
        goodSnapshot.setOriginalItemId(7L);

        activeKit.setSnapshots(List.of(damagedSnapshot, goodSnapshot));

        when(articleRepository.findById(6L)).thenReturn(Optional.of(damagedArticle));
        when(articleRepository.findById(7L)).thenReturn(Optional.of(returnedGoodArticle));
        when(kitRepository.findActiveKitByItemId(6L, KitStatus.ACTIVE)).thenReturn(Optional.of(activeKit));
        when(articleRepository.save(any(Article.class))).thenAnswer(i -> i.getArgument(0));
        when(paymentService.processGuaranteeReturn(1L, owner.getId(), tenant.getId(), "DAMAGED")).thenReturn(20.0);

        ReturnResponse response = articleService.processReturn(6L, owner.getId(), new ReturnRequest("DAMAGED", "Only one item broken"));

        assertThat(response.resolution()).isEqualTo("DEPOSIT_RETAINED");
        assertThat(response.amountProcessed()).isEqualTo(20.0);
        assertThat(response.message()).contains("resto se ha devuelto al arrendatario");
    }

    @Test
    void processReturn_firstOwnerWhenAnotherArticleIsStillRented_keepsGuaranteePending() throws Exception {
        User lucia = new User();
        lucia.setId(4L);
        lucia.setName("Lucia");
        lucia.setEmail("lucia@example.com");
        lucia.setRole(UserRole.USER);

        Article ownerArticle = makeRentedArticle(8L, 50.0);

        Article luciaPendingArticle = makeRentedArticle(9L, 50.0);
        luciaPendingArticle.setOwner(lucia);

        Kit activeKit = makeActiveKit();

        ItemMemento ownerSnapshot = new ItemMemento();
        ownerSnapshot.setOriginalItemId(8L);

        ItemMemento luciaSnapshot = new ItemMemento();
        luciaSnapshot.setOriginalItemId(9L);

        activeKit.setSnapshots(List.of(ownerSnapshot, luciaSnapshot));

        when(articleRepository.findById(8L)).thenReturn(Optional.of(ownerArticle));
        when(articleRepository.findById(9L)).thenReturn(Optional.of(luciaPendingArticle));
        when(kitRepository.findActiveKitByItemId(8L, KitStatus.ACTIVE)).thenReturn(Optional.of(activeKit));
        when(articleRepository.save(any(Article.class))).thenAnswer(i -> i.getArgument(0));

        ReturnResponse response = articleService.processReturn(
                8L,
                owner.getId(),
                new ReturnRequest("GOOD", "El articulo llego bien")
        );

        assertThat(response.resolution()).isEqualTo("PENDING_KITS_ITEMS");
        assertThat(response.amountProcessed()).isEqualTo(0.0);
        assertThat(response.message()).contains("cuando se devuelvan todos los artículos del kit");
        verifyNoInteractions(paymentService);
        verify(kitRepository, never()).save(any(Kit.class));
    }

    @Test
    void processReturn_lastGoodEvaluatorForDifferentOwnerDamage_doesNotExposeRetainedGuaranteeAmount() throws Exception {
        User lucia = new User();
        lucia.setId(4L);
        lucia.setName("Lucia");
        lucia.setEmail("lucia@example.com");
        lucia.setRole(UserRole.USER);

        Article ownerDamagedArticle = makeRentedArticle(6L, 50.0);
        ownerDamagedArticle.setStatus(ArticleStatus.DAMAGED);

        Article luciaReturnedArticle = makeRentedArticle(7L, 50.0);
        luciaReturnedArticle.setOwner(lucia);

        Kit activeKit = makeActiveKit();

        ItemMemento ownerSnapshot = new ItemMemento();
        ownerSnapshot.setOriginalItemId(6L);
        ownerSnapshot.setPriceAtRental(50.0);
        ownerSnapshot.setSelectedUnits(1);
        ownerSnapshot.setOwnerAtRental(owner);

        ItemMemento luciaSnapshot = new ItemMemento();
        luciaSnapshot.setOriginalItemId(7L);
        luciaSnapshot.setPriceAtRental(50.0);
        luciaSnapshot.setSelectedUnits(1);
        luciaSnapshot.setOwnerAtRental(lucia);

        activeKit.setSnapshots(List.of(ownerSnapshot, luciaSnapshot));

        when(articleRepository.findById(6L)).thenReturn(Optional.of(ownerDamagedArticle));
        when(articleRepository.findById(7L)).thenReturn(Optional.of(luciaReturnedArticle));
        when(kitRepository.findActiveKitByItemId(7L, KitStatus.ACTIVE)).thenReturn(Optional.of(activeKit));
        when(articleRepository.save(any(Article.class))).thenAnswer(i -> i.getArgument(0));
        when(paymentService.processGuaranteeReturn(1L, lucia.getId(), tenant.getId(), "DAMAGED")).thenReturn(8.0);

        ReturnResponse response = articleService.processReturn(
                7L,
                lucia.getId(),
                new ReturnRequest("GOOD", "El articulo llego bien")
        );

        assertThat(response.resolution()).isEqualTo("DEPOSIT_RETAINED");
        assertThat(response.amountProcessed()).isEqualTo(0.0);
        assertThat(response.message())
                .doesNotContain("8.0€")
                .doesNotContain("retenido")
                .doesNotContain("retenidos");
    }

    // ═══════════════ Case-insensitive condition ═══════════════

    @Test
    void processReturn_lowercaseGood_works() throws Exception {
        Article article = makeRentedArticle(1L, 100.0);
        Kit activeKit = makeActiveKit();

        when(articleRepository.findById(1L)).thenReturn(Optional.of(article));
        when(kitRepository.findActiveKitByItemId(1L, KitStatus.ACTIVE)).thenReturn(Optional.of(activeKit));
        when(articleRepository.save(any(Article.class))).thenAnswer(i -> i.getArgument(0));
        when(paymentService.processGuaranteeReturn(1L, owner.getId(), tenant.getId(), "good")).thenReturn(20.0);

        ReturnResponse response = articleService.processReturn(1L, owner.getId(), new ReturnRequest("good", ""));
        assertThat(response.resolution()).isEqualTo("DEPOSIT_RETURNED");
    }

    @Test
    void processReturn_lowercaseDamaged_works() throws Exception {
        Article article = makeRentedArticle(1L, 100.0);
        Kit activeKit = makeActiveKit();

        // NUEVO: Añadimos el snapshot al kit simulado
        ItemMemento memento = new ItemMemento();
        memento.setOriginalItemId(1L);
        activeKit.setSnapshots(List.of(memento));

        when(articleRepository.findById(1L)).thenReturn(Optional.of(article));
        when(kitRepository.findActiveKitByItemId(1L, KitStatus.ACTIVE)).thenReturn(Optional.of(activeKit));
        when(articleRepository.save(any(Article.class))).thenAnswer(i -> i.getArgument(0));
        
        // CORRECCIÓN: Nuestra nueva lógica siempre envía "DAMAGED" en mayúsculas al paymentService
        when(paymentService.processGuaranteeReturn(1L, owner.getId(), tenant.getId(), "DAMAGED")).thenReturn(20.0);

        ReturnResponse response = articleService.processReturn(1L, owner.getId(), new ReturnRequest("damaged", "Scratches"));
        assertThat(response.resolution()).isEqualTo("DEPOSIT_RETAINED");
    }

    // ═══════════════ Article save is called exactly once ═══════════════

    @Test
    void processReturn_savesArticleExactlyOnce() throws Exception {
        Article article = makeRentedArticle(1L, 100.0);
        Kit activeKit = makeActiveKit();

        when(articleRepository.findById(1L)).thenReturn(Optional.of(article));
        when(kitRepository.findActiveKitByItemId(1L, KitStatus.ACTIVE)).thenReturn(Optional.of(activeKit));
        when(articleRepository.save(any(Article.class))).thenAnswer(i -> i.getArgument(0));
        when(paymentService.processGuaranteeReturn(1L, owner.getId(), tenant.getId(), "GOOD")).thenReturn(20.0);

        articleService.processReturn(1L, owner.getId(), new ReturnRequest("GOOD", ""));

        verify(articleRepository, times(1)).save(article);
    }
}

