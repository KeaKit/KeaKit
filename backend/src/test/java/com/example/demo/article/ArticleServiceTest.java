package com.example.demo.article;

import com.example.demo.dto.PromoCodeValidationResponse;
import com.example.demo.dto.ReturnRequest;
import com.example.demo.dto.ReturnResponse;
import com.example.demo.dto.UserArticle;
import com.example.demo.model.*;
import com.example.demo.repository.ArticleRepository;
import com.example.demo.repository.CategoryRepository;
import com.example.demo.repository.KitRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.ArticleAvailabilityRequestService;
import com.example.demo.service.ArticleService;
import com.example.demo.service.CloudinaryService;
import com.example.demo.service.DefaultKitService;
import com.example.demo.service.PaymentService;
import com.example.demo.service.PromoCodeService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ArticleServiceTest {

    private static final String FUTURE_PURCHASE_DATE_MESSAGE = "La fecha de compra no puede ser posterior a hoy";

    @Mock private ArticleRepository articleRepository;
    @Mock private UserRepository userRepository;
    @Mock private CategoryRepository categoryRepository;
    @Mock private KitRepository kitRepository;
    @Mock private CloudinaryService cloudinaryService;
    @Mock private DefaultKitService defaultKitService;
    @Mock private PaymentService paymentService;
    @Mock private ArticleAvailabilityRequestService availabilityRequestService; 
    @Mock private PromoCodeService promoCodeService;

    @InjectMocks
    private ArticleService articleService;

    private User owner;
    private Category category;
    private Article article;

    private static final LocalDate FROM = LocalDate.now().plusDays(1);
    private static final LocalDate UNTIL = LocalDate.now().plusDays(30);

    @BeforeEach
    void setUp() {
        owner = new User();
        owner.setId(1L);
        owner.setName("Owner");
        owner.setEmail("owner@example.com");
        owner.setPassword("pwdpwd");
        owner.setRole(UserRole.USER);

        category = new Category("Bricolaje", "Desc", 5.0, 500.0);
        category.setId(1L);
        category.setStatus(CategoryStatus.ACTIVE);

        article = new Article();
        article.setId(1L);
        article.setTitle("Taladro");
        article.setDescription("Un taladro potente");
        article.setCity("Madrid");
        article.setPricePerMonth(50.0);
        article.setStatus(ArticleStatus.AVAILABLE);
        article.setAvailableFrom(FROM);
        article.setAvailableUntil(UNTIL);
        article.setOwner(owner);
        article.setCategory(category);

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(userRepository.findById(1L)).thenReturn(Optional.of(owner));
    }

    // Helper: crea un artículo simple sin categoría (para tests que no usen rango
    // de precio)
    private Article makeArticle(Long id, ArticleStatus status) {
        Article a = new Article();
        a.setId(id);
        a.setTitle("title");
        a.setDescription("desc");
        a.setCity("city");
        a.setPricePerMonth(100.0);
        a.setStatus(status);
        a.setOwner(owner);
        return a;
    }

    private Kit makeActiveKit(User tenant) {
        Kit kit = new Kit();
        kit.setId(1L);
        kit.setName("Kit Test");
        kit.setStatus(KitStatus.ACTIVE);
        kit.setTenant(tenant);
        kit.setStartDate(LocalDate.now().minusDays(30));
        kit.setEndDate(LocalDate.now());
        return kit;
    }

    // ------------ GET findAll ------------

    @Test
    void findAll_returnsAllArticles() {
        List<Article> articles = List.of(makeArticle(1L, ArticleStatus.AVAILABLE),
                makeArticle(2L, ArticleStatus.RENTED));
        when(articleRepository.findAll()).thenReturn(articles);

        List<Article> result = articleService.findAll();

        assertThat(result).hasSize(2);
        verify(articleRepository).findAll();
    }

    // ------------ GET findById ------------

    @Test
    void findById_found() {
        Article a = makeArticle(1L, ArticleStatus.AVAILABLE);
        when(articleRepository.findById(1L)).thenReturn(Optional.of(a));
        Article result = articleService.findById(1L);
        assertThat(result.getId()).isEqualTo(1L);
    }

    @Test
    void findById_notFound_throws() {
        when(articleRepository.findById(99L)).thenReturn(Optional.empty());
        RuntimeException ex = assertThrows(RuntimeException.class, () -> articleService.findById(99L));
        assertThat(ex.getMessage()).contains("Artículo no encontrado");
    }

    // ------------ SAVE /api/article/upload ------------

    @Test
    void save_nullArticle_throws() {
        RuntimeException ex = assertThrows(RuntimeException.class, () -> articleService.save(null));
        assertThat(ex.getMessage()).contains("Payload del artículo requerido");
    }

    @Test
    void save_missingTitle_throws() {
        article.setTitle(null);
        assertThatThrownBy(() -> articleService.save(article))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Título requerido");
    }

    @Test
    void save_emptyTitle_throws() {
        article.setTitle("   ");
        assertThatThrownBy(() -> articleService.save(article))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Título requerido");
    }

    @Test
    void save_missingDescription_throws() {
        article.setDescription(null);
        assertThatThrownBy(() -> articleService.save(article))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Descripción requerida");
    }

    @Test
    void save_blankDescription_throws() {
        article.setDescription("  ");
        assertThatThrownBy(() -> articleService.save(article))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Descripción requerida");
    }

    @Test
    void save_descriptionTooLong_throws() {
        article.setDescription("a".repeat(1001));
        assertThatThrownBy(() -> articleService.save(article))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("La descripción no puede exceder los 1000 caracteres");
    }

    @Test
    void save_descriptionExactly1000_ok() {
        article.setDescription("a".repeat(1000));
        when(articleRepository.save(any())).thenReturn(article);
        assertThatCode(() -> articleService.save(article)).doesNotThrowAnyException();
    }

    @Test
    void save_missingCity_throws() {
        article.setCity(null);
        assertThatThrownBy(() -> articleService.save(article))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Ciudad requerida");
    }

    @Test
    void save_blankCity_throws() {
        article.setCity(" ");
        assertThatThrownBy(() -> articleService.save(article))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Ciudad requerida");
    }

    @Test
    void save_nullPricePerMonth_throws() {
        article.setPricePerMonth(null);
        assertThatThrownBy(() -> articleService.save(article))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("El precio por mes debe ser un valor positivo");
    }

    @Test
    void save_negativePrice_throws() {
        article.setPricePerMonth(-1.0);
        assertThatThrownBy(() -> articleService.save(article))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("El precio por mes debe ser un valor positivo");
    }

    @Test
    void save_zeroPricePerMonth_succeeds() {
        article.setPricePerMonth(0.0);
        article.setCategory(null); // sin categoría, no hay rango mínimo que validar
        when(articleRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        Article result = articleService.save(article);
        assertThat(result.getPricePerMonth()).isEqualTo(0.0);
    }

    @Test
    void save_priceBelowCategoryMin_throws() {
        article.setPricePerMonth(1.0); // < minPrice 5.0
        assertThatThrownBy(() -> articleService.save(article))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("El precio por mes debe estar entre");
    }

    @Test
    void save_priceAboveCategoryMax_throws() {
        article.setPricePerMonth(9999.0); // > maxPrice 500.0
        assertThatThrownBy(() -> articleService.save(article))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("El precio por mes debe estar entre");
    }

    @Test
    void save_priceWithinCategoryRange_ok() {
        article.setPricePerMonth(100.0);
        when(articleRepository.save(any())).thenReturn(article);
        assertThatCode(() -> articleService.save(article)).doesNotThrowAnyException();
    }

    @Test
    void save_availableFromInPast_throws() {
        article.setAvailableFrom(LocalDate.now().minusDays(1));
        assertThatThrownBy(() -> articleService.save(article))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("La fecha de inicio de disponibilidad no puede ser pasada a la actual");
    }

    @Test
    void save_availableFromAfterUntil_throws() {
        article.setAvailableFrom(LocalDate.now().plusDays(10));
        article.setAvailableUntil(LocalDate.now().plusDays(5));
        assertThatThrownBy(() -> articleService.save(article))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("La fecha de inicio de disponibilidad debe ser posterior o igual a la fecha de finalización");
    }

    @Test
    void save_purchaseDateInFuture_throws() {
        article.setPurchaseDate(LocalDate.now().plusDays(1));
        assertThatThrownBy(() -> articleService.save(article))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage(FUTURE_PURCHASE_DATE_MESSAGE);
        verify(articleRepository, never()).save(any());
    }

    @Test
    void save_purchaseDateToday_succeeds() {
        LocalDate today = LocalDate.now();
        article.setPurchaseDate(today);
        when(articleRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Article result = articleService.save(article);

        assertThat(result.getPurchaseDate()).isEqualTo(today);
    }

    @Test
    void save_availableFromEqualsUntil_succeeds() {
        LocalDate today = LocalDate.now();
        article.setAvailableFrom(today);
        article.setAvailableUntil(today);
        when(articleRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        Article result = articleService.save(article);
        assertThat(result).isNotNull();
    }

    @Test
    void save_nullOwner_throws() {
        article.setOwner(null);
        assertThatThrownBy(() -> articleService.save(article))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Propietario con id válido es requerido");
    }

    @Test
    void save_ownerWithNullId_throws() {
        User noIdOwner = new User();
        noIdOwner.setId(null);
        article.setOwner(noIdOwner);
        assertThatThrownBy(() -> articleService.save(article))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Propietario con id válido es requerido");
    }

    @Test
    void save_ownerNotFound_throws() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> articleService.save(article))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Propietario no encontrado");
    }

    @Test
    void save_nullTotalUnits_normalizesTo1() {
        article.setTotalUnits(null);
        when(articleRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        Article saved = articleService.save(article);
        assertThat(saved.getTotalUnits()).isEqualTo(1);
    }

    @Test
    void save_zeroTotalUnits_normalizesTo1() {
        article.setTotalUnits(0);
        when(articleRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        Article saved = articleService.save(article);
        assertThat(saved.getTotalUnits()).isEqualTo(1);
    }

    @Test
    void save_success_returnsArticle() {
        when(articleRepository.save(any())).thenReturn(article);
        Article result = articleService.save(article);
        assertThat(result).isNotNull();
        assertThat(result.getTitle()).isEqualTo("Taladro");
        verify(articleRepository).save(article);
    }

    @Test
    void save_withOwnerCommissionPromoCode_normalizesValidatesAndPersists() {
        article.setOwnerCommissionPromoCode(" owner10 ");
        when(promoCodeService.validateForOwnerCommissionReductionAllowReservedByUser("OWNER10", "owner@example.com"))
                .thenReturn(new PromoCodeValidationResponse(true, 0.10, "Código aplicado correctamente"));
        when(articleRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Article result = articleService.save(article);

        assertThat(result.getOwnerCommissionPromoCode()).isEqualTo("OWNER10");
        verify(promoCodeService).validateForOwnerCommissionReductionAllowReservedByUser("OWNER10", "owner@example.com");
        verify(promoCodeService).reserveOwnerSingleUseIfNeeded("OWNER10", "owner@example.com");
        verify(articleRepository).save(argThat(saved -> "OWNER10".equals(saved.getOwnerCommissionPromoCode())));
    }

    // ------------ UPDATE /api/article/{id} ------------

    @Test
    void update_success_returnsUpdatedArticle() {
        when(articleRepository.findById(1L)).thenReturn(Optional.of(article));
        when(articleRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Article updateData = new Article();
        updateData.setTitle("Taladro Percutor");

        Article result = articleService.update(1L, 1L, updateData);
        assertThat(result.getTitle()).isEqualTo("Taladro Percutor");
    }

    @Test
    void update_allOptionalFields() {
        Article existing = makeArticle(2L, ArticleStatus.AVAILABLE);
        existing.setCategory(category);
        when(articleRepository.findById(2L)).thenReturn(Optional.of(existing));
        when(articleRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Article updateData = new Article();
        updateData.setTitle("t2");
        updateData.setDescription("d2");
        updateData.setCity("c2");
        updateData.setPricePerMonth(200.0);
        updateData.setAvailableFrom(LocalDate.now().plusDays(1));
        updateData.setAvailableUntil(LocalDate.now().plusDays(10));
        updateData.setImageUrl("http://img.com");
        updateData.setPurchaseDate(LocalDate.of(2023, 1, 1));

        Article result = articleService.update(2L, owner.getId(), updateData);
        assertThat(result.getTitle()).isEqualTo("t2");
        assertThat(result.getDescription()).isEqualTo("d2");
        assertThat(result.getCity()).isEqualTo("c2");
        assertThat(result.getPricePerMonth()).isEqualTo(200.0);
        assertThat(result.getImageUrl()).isEqualTo("http://img.com");
    }

    @Test
    void update_notFound_throws() {
        when(articleRepository.findById(99L)).thenReturn(Optional.empty());
        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> articleService.update(99L, owner.getId(), new Article()));
    assertThat(ex.getMessage()).contains("Artículo no encontrado");
    }

    @Test
    void update_articleRented_throws() {
        article.setStatus(ArticleStatus.RENTED);
        when(articleRepository.findById(1L)).thenReturn(Optional.of(article));

        assertThatThrownBy(() -> articleService.update(1L, 1L, new Article()))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("El artículo está actualmente alquilado y no puede ser editado");
    }

    @Test
    void update_notOwner_throws() {
        Article a = makeArticle(4L, ArticleStatus.AVAILABLE);
        User other = new User();
        other.setId(99L);
        a.setOwner(other);
        when(articleRepository.findById(4L)).thenReturn(Optional.of(a));

        assertThatThrownBy(() -> articleService.update(4L, 1L, new Article()))
                .isInstanceOf(RuntimeException.class)
        .hasMessage("Solo el propietario puede modificar este artículo");
    }

    @Test
    void update_cannotChangeStatus_throws() {
        when(articleRepository.findById(1L)).thenReturn(Optional.of(article));

        Article updateData = new Article();
        updateData.setStatus(ArticleStatus.RENTED);

        assertThatThrownBy(() -> articleService.update(1L, 1L, updateData))
                .isInstanceOf(RuntimeException.class)
        .hasMessage("No se puede cambiar el estado a través de la actualización; use el endpoint toggleRent");
    }

    @Test
    void update_descriptionTooLong_throws() {
        when(articleRepository.findById(1L)).thenReturn(Optional.of(article));

        Article updateData = new Article();
        updateData.setDescription("a".repeat(1001));

        assertThatThrownBy(() -> articleService.update(1L, 1L, updateData))
                .isInstanceOf(RuntimeException.class)
        .hasMessage("La descripción no puede exceder 1000 caracteres");
    }

    @Test
    void update_priceOutOfCategoryRange_throws() {
        when(articleRepository.findById(1L)).thenReturn(Optional.of(article));

        Article updateData = new Article();
        updateData.setPricePerMonth(9999.0);

        assertThatThrownBy(() -> articleService.update(1L, 1L, updateData))
                .isInstanceOf(RuntimeException.class)
        .hasMessageContaining("El precio por mes debe estar entre");
    }

    @Test
    void update_availableFromInPast_throws() {
        when(articleRepository.findById(1L)).thenReturn(Optional.of(article));

        Article updateData = new Article();
        updateData.setAvailableFrom(LocalDate.now().minusDays(1));

        assertThatThrownBy(() -> articleService.update(1L, 1L, updateData))
                .isInstanceOf(RuntimeException.class)
        .hasMessage("La fecha de inicio de disponibilidad no puede ser pasada a la actual");
    }

    @Test
    void update_availableFromAfterUntil_throws() {
        when(articleRepository.findById(1L)).thenReturn(Optional.of(article));

        Article updateData = new Article();
        updateData.setAvailableFrom(LocalDate.now().plusDays(20));
        updateData.setAvailableUntil(LocalDate.now().plusDays(5));

        assertThatThrownBy(() -> articleService.update(1L, 1L, updateData))
                .isInstanceOf(RuntimeException.class)
        .hasMessage("La fecha de inicio de disponibilidad debe ser posterior o igual a la fecha de finalización");
    }

    @Test
    void update_purchaseDateInFuture_throws() {
        when(articleRepository.findById(1L)).thenReturn(Optional.of(article));

        Article updateData = new Article();
        updateData.setPurchaseDate(LocalDate.now().plusDays(1));

        assertThatThrownBy(() -> articleService.update(1L, 1L, updateData))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage(FUTURE_PURCHASE_DATE_MESSAGE);
        verify(articleRepository, never()).save(any());
    }

    @Test
    void update_condition_isApplied() {
        when(articleRepository.findById(1L)).thenReturn(Optional.of(article));
        when(articleRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Article updateData = new Article();
        updateData.setCondition(ArticleCondition.NEW);

        Article result = articleService.update(1L, 1L, updateData);
        assertThat(result.getCondition()).isEqualTo(ArticleCondition.NEW);
    }

    @Test
    void update_dates_areUpdated() {
        when(articleRepository.findById(1L)).thenReturn(Optional.of(article));
        when(articleRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        LocalDate newFrom = LocalDate.now().plusDays(5);
        LocalDate newUntil = LocalDate.now().plusDays(60);

        Article updateData = new Article();
        updateData.setAvailableFrom(newFrom);
        updateData.setAvailableUntil(newUntil);

        Article result = articleService.update(1L, 1L, updateData);
        assertThat(result.getAvailableFrom()).isEqualTo(newFrom);
        assertThat(result.getAvailableUntil()).isEqualTo(newUntil);
    }

    // ------------ DELETE /api/article/{id} ------------

    @Test
    void delete_success_callsRepository() throws Exception {
        article.setImageUrl(null);
        when(articleRepository.findById(1L)).thenReturn(Optional.of(article));
        doNothing().when(articleRepository).deleteById(1L);

        articleService.deleteById(1L, 1L);

        verify(articleRepository).deleteById(1L);
    }

    @Test
    void delete_withImage_deletesFromCloudinary() throws Exception {
        article.setImageUrl("https://cloudinary.com/img.jpg");
        when(articleRepository.findById(1L)).thenReturn(Optional.of(article));

        articleService.deleteById(1L, 1L);

        verify(cloudinaryService).deleteImage("https://cloudinary.com/img.jpg");
        verify(articleRepository).deleteById(1L);
    }

    @Test
    void delete_articleNotFound_throws() {
        when(articleRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> articleService.deleteById(99L, 1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Artículo no encontrado");
    }

    @Test
    void delete_articleRented_throws() {
        article.setStatus(ArticleStatus.RENTED);
        when(articleRepository.findById(1L)).thenReturn(Optional.of(article));

        assertThatThrownBy(() -> articleService.deleteById(1L, 1L))
                .isInstanceOf(RuntimeException.class)
        .hasMessage("El artículo está actualmente alquilado y no puede ser eliminado");
    }

    @Test
    void delete_notOwner_throws() {
        Article a = makeArticle(10L, ArticleStatus.AVAILABLE);
        User other = new User();
        other.setId(123L);
        a.setOwner(other);
        when(articleRepository.findById(10L)).thenReturn(Optional.of(a));

        assertThatThrownBy(() -> articleService.deleteById(10L, 1L))
                .isInstanceOf(RuntimeException.class)
        .hasMessage("Solo el propietario puede eliminar este artículo");
    }

    // ------------ toggleRent ------------

    @Test
    void toggleRent_availableBecomesRented() {
        when(articleRepository.findById(1L)).thenReturn(Optional.of(article));
        when(articleRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Article result = articleService.toggleRent(1L, 1L);
        assertThat(result.getStatus()).isEqualTo(ArticleStatus.RENTED);
    }

    @Test
    void toggleRent_rentedBecomesAvailable() {
        article.setStatus(ArticleStatus.RENTED);
        when(articleRepository.findById(1L)).thenReturn(Optional.of(article));
        when(articleRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Article result = articleService.toggleRent(1L, 1L);
        assertThat(result.getStatus()).isEqualTo(ArticleStatus.AVAILABLE);
    }

    @Test
    void toggleRent_inactiveArticle_throws() {
        article.setStatus(ArticleStatus.INACTIVE);
        when(articleRepository.findById(1L)).thenReturn(Optional.of(article));

        assertThatThrownBy(() -> articleService.toggleRent(1L, 1L))
                .isInstanceOf(RuntimeException.class)
        .hasMessage("Los artículos inactivos no pueden ser alquilados");
    }

    @Test
    void toggleRent_notOwner_throws() {
        Article a = makeArticle(14L, ArticleStatus.AVAILABLE);
        User other = new User();
        other.setId(555L);
        a.setOwner(other);
        when(articleRepository.findById(14L)).thenReturn(Optional.of(a));

        assertThatThrownBy(() -> articleService.toggleRent(14L, 1L))
                .isInstanceOf(RuntimeException.class)
        .hasMessage("Solo el propietario puede cambiar el estado de alquiler");
    }

    @Test
    void toggleRent_articleNotFound_throws() {
        when(articleRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> articleService.toggleRent(99L, 1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Artículo no encontrado");
    }

    // ------------ findArticlesByUserId ------------

    @SuppressWarnings("unchecked")
    @Test
    void findArticlesByUserId_returnsUserArticleDtos() {
        Article rented = new Article();
        rented.setId(2L);
        rented.setTitle("Sierra");
        rented.setImageUrl("url");
        rented.setPricePerMonth(30.0);
        rented.setStatus(ArticleStatus.RENTED);
        rented.setAvailableUntil(UNTIL);

        when(articleRepository.findAll(any(Specification.class)))
                .thenReturn(List.of(article, rented));

        var result = articleService.findArticlesByUserId(1L, null, null, null, null);

        assertThat(result).hasSize(2);

        var rentedDto = result.stream().filter(a -> "RENTED".equals(a.status())).findFirst().orElseThrow();
        assertThat(rentedDto.rentedUntil()).isEqualTo(UNTIL);

        var availableDto = result.stream().filter(a -> "AVAILABLE".equals(a.status())).findFirst().orElseThrow();
        assertThat(availableDto.rentedUntil()).isNull();
    }

    @SuppressWarnings("unchecked")
    @Test
    void findArticlesByUserId_detailedDtoMapping() {
        Article articleAvailable = makeArticle(10L, ArticleStatus.AVAILABLE);
        articleAvailable.setTitle("Taladro");
        articleAvailable.setAvailableUntil(LocalDate.now().plusDays(5));

        Article articleRented = makeArticle(11L, ArticleStatus.RENTED);
        articleRented.setTitle("Bicicleta");
        LocalDate rentalEndDate = LocalDate.now().plusDays(10);
        articleRented.setAvailableUntil(rentalEndDate);

        when(articleRepository.findAll(any(Specification.class)))
                .thenReturn(List.of(articleAvailable, articleRented));

        List<UserArticle> result = articleService.findArticlesByUserId(owner.getId(), null, null, null, null);

        assertThat(result).hasSize(2);

        UserArticle dtoAvailable = result.get(0);
        assertThat(dtoAvailable.title()).isEqualTo("Taladro");
        assertThat(dtoAvailable.status()).isEqualTo("AVAILABLE");
        assertThat(dtoAvailable.rentedUntil()).isNull();

        UserArticle dtoRented = result.get(1);
        assertThat(dtoRented.title()).isEqualTo("Bicicleta");
        assertThat(dtoRented.status()).isEqualTo("RENTED");
        assertThat(dtoRented.rentedUntil()).isEqualTo(rentalEndDate);
    }

    @SuppressWarnings("unchecked")
    @Test
    void findArticlesByUserId_activeKitKeepsArticleShownAsRented() {
        Article articleReturnedEarly = makeArticle(12L, ArticleStatus.AVAILABLE);
        LocalDate rentalEndDate = LocalDate.now().plusDays(3);
        Kit activeKit = makeActiveKit(owner);
        activeKit.setEndDate(rentalEndDate);

        when(articleRepository.findAll(any(Specification.class)))
                .thenReturn(List.of(articleReturnedEarly));
        when(articleRepository.findAllKitsWhereArticleHasBeen(12L)).thenReturn(List.of(activeKit));

        List<UserArticle> result = articleService.findArticlesByUserId(owner.getId(), null, null, null, null);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).status()).isEqualTo("RENTED");
        assertThat(result.get(0).rentedUntil()).isEqualTo(rentalEndDate);
    }

    @SuppressWarnings("unchecked")
    @Test
    void findArticlesByUserId_emptyList_returnsEmpty() {
        when(articleRepository.findAll(any(Specification.class))).thenReturn(List.of());

        var result = articleService.findArticlesByUserId(99L, null, null, null, null);
        assertThat(result).isEmpty();
    }

    @SuppressWarnings("unchecked")
    @Test
    void findArticlesByUserId_whenUserHasNoArticles_returnsEmptyAndNotNull() {
        when(articleRepository.findAll(any(Specification.class))).thenReturn(List.of());

        List<UserArticle> result = articleService.findArticlesByUserId(owner.getId(), null, null, null, null);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    // ------------ countArticlesByCategory / findLatestArticlesByCategory
    // ------------

    @Test
    void countArticlesByCategory_returnsCount() {
        when(articleRepository.countByCategoryId(1L)).thenReturn(12L);

        long count = articleService.countArticlesByCategory(1L);
        assertThat(count).isEqualTo(12L);
        verify(articleRepository).countByCategoryId(1L);
    }

    @Test
    void findLatestArticlesByCategory_returnsMappedDTOs() {
        Article a1 = makeArticle(100L, ArticleStatus.AVAILABLE);
        a1.setTitle("Artículo Reciente");

        when(articleRepository.findTop10ByCategoryIdOrderByIdDesc(1L)).thenReturn(List.of(a1));

        List<UserArticle> result = articleService.findLatestArticlesByCategory(1L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).title()).isEqualTo("Artículo Reciente");
        assertThat(result.get(0).status()).isEqualTo("AVAILABLE");
        verify(articleRepository).findTop10ByCategoryIdOrderByIdDesc(1L);
    }

    // ------------ processReturn ------------

    @Test
    void processReturn_goodCondition_returnsDepositReturned() throws Exception {
        Article a = makeArticle(20L, ArticleStatus.RENTED);
        a.setPricePerMonth(100.0);
        User tenant = new User();
        tenant.setId(2L);
        tenant.setEmail("tenant@example.com");
        Kit activeKit = makeActiveKit(tenant); // Su ID interno es 1L por defecto

        when(articleRepository.findById(20L)).thenReturn(Optional.of(a));
        when(kitRepository.findActiveKitByItemId(20L, KitStatus.ACTIVE)).thenReturn(Optional.of(activeKit));
        when(articleRepository.save(any(Article.class))).thenAnswer(i -> i.getArgument(0));

        // Simulamos que el PaymentService procesa todo bien y nos devuelve que la
        // fianza eran 20.0€
        when(paymentService.processGuaranteeReturn(1L, owner.getId(), 2L, "GOOD")).thenReturn(20.0);

        ReturnRequest request = new ReturnRequest("GOOD", "Todo perfecto");
        ReturnResponse response = articleService.processReturn(20L, owner.getId(), request);

        assertThat(response.resolution()).isEqualTo("DEPOSIT_RETURNED");
        assertThat(response.amountProcessed()).isEqualTo(0.0);
        assertThat(response.articleId()).isEqualTo(20L);
        assertThat(response.tenantEmail()).isEqualTo("tenant@example.com");
        assertThat(response.message()).contains("buen estado");
        verify(articleRepository).save(a);
        assertThat(a.getStatus()).isEqualTo(ArticleStatus.AVAILABLE);
    }

    @Test
    void processReturn_damagedCondition_retainsDeposit() throws Exception {
        Article a = makeArticle(21L, ArticleStatus.RENTED);
        a.setPricePerMonth(200.0);
        User tenant = new User();
        tenant.setId(3L);
        tenant.setEmail("damaged@example.com");
        Kit activeKit = makeActiveKit(tenant);

        // NUEVO: Añadimos el snapshot al kit simulado
        ItemMemento memento = new ItemMemento();
        memento.setOriginalItemId(21L);
        activeKit.setSnapshots(List.of(memento));

        when(articleRepository.findById(21L)).thenReturn(Optional.of(a));
        when(kitRepository.findActiveKitByItemId(21L, KitStatus.ACTIVE)).thenReturn(Optional.of(activeKit));
        when(articleRepository.save(any(Article.class))).thenAnswer(i -> i.getArgument(0));

        when(paymentService.processGuaranteeReturn(1L, owner.getId(), 3L, "DAMAGED")).thenReturn(40.0);

        ReturnRequest request = new ReturnRequest("DAMAGED", "Tiene arañazos");
        ReturnResponse response = articleService.processReturn(21L, owner.getId(), request);

        assertThat(response.resolution()).isEqualTo("DEPOSIT_RETAINED");
        assertThat(response.amountProcessed()).isEqualTo(40.0);
        assertThat(response.articleId()).isEqualTo(21L);
        assertThat(response.tenantEmail()).isEqualTo("damaged@example.com");
        assertThat(response.message()).contains("daños");
        verify(articleRepository).save(a);
        
        // CORRECCIÓN: El estado correcto ahora es DAMAGED, no AVAILABLE
        assertThat(a.getStatus()).isEqualTo(ArticleStatus.DAMAGED);
    }

    @Test
    void processReturn_invalidCondition_throws() throws Exception {
        // Al igual que en el test 4, la validación falla en la línea 1
        ReturnRequest request = new ReturnRequest("UNKNOWN", "");

        // CORRECCIÓN: Comprobamos el IllegalArgumentException exacto
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> articleService.processReturn(22L, owner.getId(), request));
                
        assertThat(ex.getMessage()).isEqualTo("Condición no válida. Usa GOOD o DAMAGED.");
    }

    @Test
    void processReturn_activeKitBeforeEndDate_throwsWithoutUpdatingArticleOrKit() throws Exception {
        Article a = makeArticle(27L, ArticleStatus.RENTED);
        User tenant = new User();
        tenant.setId(6L);
        tenant.setEmail("future@example.com");
        Kit activeKit = makeActiveKit(tenant);
        activeKit.setEndDate(LocalDate.now().plusDays(1));

        when(articleRepository.findById(27L)).thenReturn(Optional.of(a));
        when(kitRepository.findActiveKitByItemId(27L, KitStatus.ACTIVE)).thenReturn(Optional.of(activeKit));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> articleService.processReturn(27L, owner.getId(), new ReturnRequest("GOOD", "")));

        assertThat(ex.getMessage()).contains("No se puede procesar la devolución antes de la fecha de fin del contrato");
        assertThat(a.getStatus()).isEqualTo(ArticleStatus.RENTED);
        assertThat(activeKit.getStatus()).isEqualTo(KitStatus.ACTIVE);
        verify(articleRepository, never()).save(any(Article.class));
        verify(kitRepository, never()).save(any(Kit.class));
        verifyNoInteractions(paymentService);
    }

    @Test
    void processReturn_goodCondition_setsArticleAvailableAndClearsUntil() throws Exception {
        Article a = makeArticle(26L, ArticleStatus.RENTED);
        a.setPricePerMonth(50.0);
        a.setAvailableUntil(LocalDate.now().plusDays(10));
        User tenant = new User();
        tenant.setId(5L);
        tenant.setEmail("clean@example.com");
        Kit activeKit = makeActiveKit(tenant);

        when(articleRepository.findById(26L)).thenReturn(Optional.of(a));
        when(kitRepository.findActiveKitByItemId(26L, KitStatus.ACTIVE)).thenReturn(Optional.of(activeKit));
        when(articleRepository.save(any(Article.class))).thenAnswer(i -> i.getArgument(0));

        // Mock necesario para que no lance un NullPointerException al llegar a esa
        // línea
        when(paymentService.processGuaranteeReturn(1L, owner.getId(), 5L, "GOOD")).thenReturn(10.0);

        ReturnRequest request = new ReturnRequest("GOOD", "");
        articleService.processReturn(26L, owner.getId(), request);

        assertThat(a.getStatus()).isEqualTo(ArticleStatus.AVAILABLE);
        assertThat(a.getAvailableUntil()).isNull();
        verify(articleRepository).save(a);
    }

    // Test Filtros MyArticles
    @SuppressWarnings("unchecked")
    @Test
    void findArticlesByUserId_withFilters_returnsFilteredDtoMapping() {

        Article filteredArticle = new Article();
        filteredArticle.setId(12L);
        filteredArticle.setTitle("Martillo");
        filteredArticle.setStatus(ArticleStatus.AVAILABLE);
        filteredArticle.setCondition(ArticleCondition.NEW);
        filteredArticle.setPricePerMonth(15.0);

        when(articleRepository.findAll(any(Specification.class)))
                .thenReturn(List.of(filteredArticle));

        List<UserArticle> result = articleService.findArticlesByUserId(1L, 2L, "NEW", 10.0, 20.0);

        assertThat(result).hasSize(1);
        UserArticle dto = result.get(0);
        assertThat(dto.title()).isEqualTo("Martillo");

        assertThat(dto.status()).isEqualTo("AVAILABLE");
    }

    @SuppressWarnings("unchecked")
    @Test
    void findArticlesByUserId_withFiltersNoMatches_returnsEmpty() {

        when(articleRepository.findAll(any(Specification.class)))
                .thenReturn(List.of());

        List<UserArticle> result = articleService.findArticlesByUserId(1L, 99L, "BROKEN", 100.0, 500.0);

        assertThat(result).isNotNull();
    }

    // ------------ findArticleRecord ------------

    @Test
    void findArticleRecord_returnsMappedAndFilteredDtos() {
        User tenant = new User();
        tenant.setId(2L);
        tenant.setName("Inquilino Test");

        Kit activeKit = new Kit();
        activeKit.setId(10L);
        activeKit.setStatus(KitStatus.ACTIVE);
        activeKit.setTenant(tenant);
        activeKit.setStartDate(LocalDate.now().minusDays(5));
        activeKit.setEndDate(LocalDate.now().plusDays(5));
        activeKit.setCity("Barcelona");
        activeKit.setCountry("España");

        Kit draftKit = new Kit();
        draftKit.setStatus(KitStatus.DRAFT);

        Kit cancelledKit = new Kit();
        cancelledKit.setStatus(KitStatus.CANCELLED);

        when(articleRepository.findAllKitsWhereArticleHasBeen(1L))
                .thenReturn(List.of(activeKit, draftKit, cancelledKit));

        List<com.example.demo.dto.ArticleRecordDTO> result = articleService.findArticleRecord(1L);

        assertThat(result).hasSize(1);
        var dto = result.get(0);
        assertThat(dto.getTenantId()).isEqualTo(2L);
        assertThat(dto.getTenantName()).isEqualTo("Inquilino Test");
        assertThat(dto.getCity()).isEqualTo("Barcelona");
        assertThat(dto.getStatus()).isEqualTo(KitStatus.ACTIVE);
        assertThat(dto.getStartDate()).isEqualTo(activeKit.getStartDate());

        verify(articleRepository).findAllKitsWhereArticleHasBeen(1L);
    }

    @Test
    void findArticleRecord_whenNoKitsFound_returnsEmptyList() {
        when(articleRepository.findAllKitsWhereArticleHasBeen(99L)).thenReturn(List.of());

        List<com.example.demo.dto.ArticleRecordDTO> result = articleService.findArticleRecord(99L);

        assertThat(result).isEmpty();
        assertThat(result).isNotNull();
    }

    @Test
    void findArticleRecord_filtersAllKitsIfAllAreDraftOrCancelled() {
        Kit draft = new Kit();
        draft.setStatus(KitStatus.DRAFT);
        Kit cancelled = new Kit();
        cancelled.setStatus(KitStatus.CANCELLED);

        when(articleRepository.findAllKitsWhereArticleHasBeen(1L)).thenReturn(List.of(draft, cancelled));

        List<com.example.demo.dto.ArticleRecordDTO> result = articleService.findArticleRecord(1L);

        assertThat(result).isEmpty();
    }
}
