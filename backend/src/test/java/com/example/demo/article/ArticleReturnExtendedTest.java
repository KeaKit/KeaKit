package com.example.demo.article;

import com.example.demo.dto.ReturnRequest;
import com.example.demo.dto.ReturnResponse;
import com.example.demo.model.*;
import com.example.demo.repository.ArticleRepository;
import com.example.demo.repository.CategoryRepository;
import com.example.demo.repository.KitRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.ArticleService;
import com.example.demo.service.CloudinaryService;
import com.example.demo.service.DefaultKitService;
import com.example.demo.service.PaymentService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Extended tests for ArticleService.processReturn covering CU-ARRENDADOR-04:
 * HU-ARRENDADOR-33 (Confirm good return), HU-ARRENDADOR-34 (Report damage),
 * HU-ARRENDATARIO-40 (Automatic deposit refund).
 * Business rules: RN-DEV-01..RN-DEV-09, RN-PAG-13
 */
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
        assertThat(ex.getMessage()).contains("Only the owner can confirm the return");
    }

    // ═══════════════ RN-DEV-02: Only RENTED articles can be returned ═══════════════

    @Test
    void processReturn_articleNotRented_throwsException() {
        Article article = new Article();
        article.setId(1L);
        article.setStatus(ArticleStatus.AVAILABLE);
        article.setOwner(owner);
        when(articleRepository.findById(1L)).thenReturn(Optional.of(article));

        ReturnRequest request = new ReturnRequest("GOOD", "");

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> articleService.processReturn(1L, owner.getId(), request));
        assertThat(ex.getMessage()).contains("not currently rented");
    }

    @Test
    void processReturn_articleInactive_throwsException() {
        Article article = new Article();
        article.setId(1L);
        article.setStatus(ArticleStatus.INACTIVE);
        article.setOwner(owner);
        when(articleRepository.findById(1L)).thenReturn(Optional.of(article));

        ReturnRequest request = new ReturnRequest("GOOD", "");

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> articleService.processReturn(1L, owner.getId(), request));
        assertThat(ex.getMessage()).contains("not currently rented");
    }

    // ═══════════════ Article not found ═══════════════

    @Test
    void processReturn_articleNotFound_throwsException() {
        when(articleRepository.findById(999L)).thenReturn(Optional.empty());

        ReturnRequest request = new ReturnRequest("GOOD", "");

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> articleService.processReturn(999L, owner.getId(), request));
        assertThat(ex.getMessage()).contains("Article not found");
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
        assertThat(ex.getMessage()).contains("No active Kit found");
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
        assertThat(response.amountProcessed()).isEqualTo(20.0);
        assertThat(response.tenantEmail()).isEqualTo("tenant@example.com");
        assertThat(response.message()).contains("buen estado");
        verify(paymentService).processGuaranteeReturn(1L, owner.getId(), tenant.getId(), "GOOD");
    }

    // ═══════════════ RN-DEV-06 / HU-ARRENDADOR-34: DAMAGED → deposit retained ═══════════════

    @Test
    void processReturn_damagedCondition_depositRetainedByOwner() throws Exception {
        Article article = makeRentedArticle(2L, 200.0);
        Kit activeKit = makeActiveKit();

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
    void processReturn_damagedCondition_alsoSetsArticleToAvailable() throws Exception {
        Article article = makeRentedArticle(1L, 100.0);
        Kit activeKit = makeActiveKit();

        when(articleRepository.findById(1L)).thenReturn(Optional.of(article));
        when(kitRepository.findActiveKitByItemId(1L, KitStatus.ACTIVE)).thenReturn(Optional.of(activeKit));
        when(articleRepository.save(any(Article.class))).thenAnswer(i -> i.getArgument(0));
        when(paymentService.processGuaranteeReturn(1L, owner.getId(), tenant.getId(), "DAMAGED")).thenReturn(20.0);

        articleService.processReturn(1L, owner.getId(), new ReturnRequest("DAMAGED", "Broken"));

        assertThat(article.getStatus()).isEqualTo(ArticleStatus.AVAILABLE);
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
        Article article = makeRentedArticle(1L, 100.0);
        Kit activeKit = makeActiveKit();

        when(articleRepository.findById(1L)).thenReturn(Optional.of(article));
        when(kitRepository.findActiveKitByItemId(1L, KitStatus.ACTIVE)).thenReturn(Optional.of(activeKit));
        when(paymentService.processGuaranteeReturn(1L, owner.getId(), tenant.getId(), "UNKNOWN"))
                .thenThrow(new IllegalArgumentException("Condición no válida. Usa GOOD o DAMAGED."));

        ReturnRequest request = new ReturnRequest("UNKNOWN", "");

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> articleService.processReturn(1L, owner.getId(), request));
        assertThat(ex.getMessage()).contains("Error procesando la devolución de la garantía");
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
        assertThat(response.amountProcessed()).isEqualTo(30.0);
    }

    @Test
    void processReturn_damagedCondition_messageContainsAmount() throws Exception {
        Article article = makeRentedArticle(5L, 300.0);
        Kit activeKit = makeActiveKit();

        when(articleRepository.findById(5L)).thenReturn(Optional.of(article));
        when(kitRepository.findActiveKitByItemId(5L, KitStatus.ACTIVE)).thenReturn(Optional.of(activeKit));
        when(articleRepository.save(any(Article.class))).thenAnswer(i -> i.getArgument(0));
        when(paymentService.processGuaranteeReturn(1L, owner.getId(), tenant.getId(), "DAMAGED")).thenReturn(60.0);

        ReturnResponse response = articleService.processReturn(5L, owner.getId(), new ReturnRequest("DAMAGED", "Broken handle"));

        assertThat(response.message()).contains("60.0");
        assertThat(response.message()).contains("propietario");
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

        when(articleRepository.findById(1L)).thenReturn(Optional.of(article));
        when(kitRepository.findActiveKitByItemId(1L, KitStatus.ACTIVE)).thenReturn(Optional.of(activeKit));
        when(articleRepository.save(any(Article.class))).thenAnswer(i -> i.getArgument(0));
        when(paymentService.processGuaranteeReturn(1L, owner.getId(), tenant.getId(), "damaged")).thenReturn(20.0);

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
