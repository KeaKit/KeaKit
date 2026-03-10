package com.example.demo.article;

import com.example.demo.dto.ReturnRequest;
import com.example.demo.dto.ReturnResponse;
import com.example.demo.dto.UserArticle;
import com.example.demo.model.Article;
import com.example.demo.model.ArticleStatus;
import com.example.demo.model.Kit;
import com.example.demo.model.KitStatus;
import com.example.demo.model.User;
import com.example.demo.model.UserRole;
import com.example.demo.repository.ArticleRepository;
import com.example.demo.repository.CategoryRepository;
import com.example.demo.repository.KitRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.ArticleService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ArticleServiceTest {

    @Mock
    private ArticleRepository articleRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private KitRepository kitRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private ArticleService articleService;

    private User owner;

    @BeforeEach
    void setUp() {
        owner = new User();
        owner.setId(1L);
        owner.setName("owner");
        owner.setEmail("owner@example.com");
        owner.setPassword("pwdpwd");
        owner.setRole(UserRole.USER);
    }

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

    // ------------ GET findAll -------------
    // ─────────────────────────────────────────────

    @Test
    void findAll_returnsAllArticles() {
        List<Article> articles = List.of(makeArticle(1L, ArticleStatus.AVAILABLE), makeArticle(2L, ArticleStatus.RENTED));
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
        assertThat(ex.getMessage()).contains("Article not found");
    }

    // ------------ SAVE /api/article/upload ------------

    @Test
    void save_successful() {
        Article a = makeArticle(null, ArticleStatus.AVAILABLE);
        when(userRepository.findById(owner.getId())).thenReturn(Optional.of(owner));
        when(articleRepository.save(any(Article.class))).thenAnswer(i -> i.getArgument(0));

        Article result = articleService.save(a);

        assertThat(result.getTitle()).isEqualTo("title");
        verify(articleRepository).save(a);
    }

    @Test
    void save_nullArticle_throws() {
        RuntimeException ex = assertThrows(RuntimeException.class, () -> articleService.save(null));
        assertThat(ex.getMessage()).contains("Article payload is required");
    }

    @Test
    void save_nullTitle_throws() {
        Article a = makeArticle(null, ArticleStatus.AVAILABLE);
        a.setTitle(null);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> articleService.save(a));
        assertThat(ex.getMessage()).contains("Title is required");
    }

    @Test
    void save_blankTitle_throws() {
        Article a = makeArticle(null, ArticleStatus.AVAILABLE);
        a.setTitle("   ");

        RuntimeException ex = assertThrows(RuntimeException.class, () -> articleService.save(a));
        assertThat(ex.getMessage()).contains("Title is required");
    }

    @Test
    void save_nullDescription_throws() {
        Article a = makeArticle(null, ArticleStatus.AVAILABLE);
        a.setDescription(null);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> articleService.save(a));
        assertThat(ex.getMessage()).contains("Description is required");
    }

    @Test
    void save_blankDescription_throws() {
        Article a = makeArticle(null, ArticleStatus.AVAILABLE);
        a.setDescription("  ");

        RuntimeException ex = assertThrows(RuntimeException.class, () -> articleService.save(a));
        assertThat(ex.getMessage()).contains("Description is required");
    }

    @Test
    void save_nullCity_throws() {
        Article a = makeArticle(null, ArticleStatus.AVAILABLE);
        a.setCity(null);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> articleService.save(a));
        assertThat(ex.getMessage()).contains("City is required");
    }

    @Test
    void save_blankCity_throws() {
        Article a = makeArticle(null, ArticleStatus.AVAILABLE);
        a.setCity(" ");

        RuntimeException ex = assertThrows(RuntimeException.class, () -> articleService.save(a));
        assertThat(ex.getMessage()).contains("City is required");
    }

    @Test
    void save_nullPricePerMonth_throws() {
        Article a = makeArticle(null, ArticleStatus.AVAILABLE);
        a.setPricePerMonth(null);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> articleService.save(a));
        assertThat(ex.getMessage()).contains("pricePerMonth must be >= 0");
    }

    @Test
    void save_negativePricePerMonth_throws() {
        Article a = makeArticle(null, ArticleStatus.AVAILABLE);
        a.setPricePerMonth(-1.0);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> articleService.save(a));
        assertThat(ex.getMessage()).contains("pricePerMonth must be >= 0");
    }

    @Test
    void save_zeroPricePerMonth_succeeds() {
        Article a = makeArticle(null, ArticleStatus.AVAILABLE);
        a.setPricePerMonth(0.0);
        when(userRepository.findById(owner.getId())).thenReturn(Optional.of(owner));
        when(articleRepository.save(any(Article.class))).thenAnswer(i -> i.getArgument(0));

        Article result = articleService.save(a);
        assertThat(result.getPricePerMonth()).isEqualTo(0.0);
    }

    @Test
    void save_availableFromAfterUntil_throws() {
        Article a = makeArticle(null, ArticleStatus.AVAILABLE);
        a.setAvailableFrom(LocalDate.now().plusDays(5));
        a.setAvailableUntil(LocalDate.now());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> articleService.save(a));
        assertThat(ex.getMessage()).contains("availableFrom must be before or equal to availableUntil");
    }

    @Test
    void save_availableFromEqualsUntil_succeeds() {
        Article a = makeArticle(null, ArticleStatus.AVAILABLE);
        LocalDate today = LocalDate.now();
        a.setAvailableFrom(today);
        a.setAvailableUntil(today);
        when(userRepository.findById(owner.getId())).thenReturn(Optional.of(owner));
        when(articleRepository.save(any(Article.class))).thenAnswer(i -> i.getArgument(0));

        Article result = articleService.save(a);
        assertThat(result).isNotNull();
    }

    @Test
    void save_nullOwner_throws() {
        Article a = makeArticle(null, ArticleStatus.AVAILABLE);
        a.setOwner(null);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> articleService.save(a));
        assertThat(ex.getMessage()).contains("Owner (with valid id) is required");
    }

    @Test
    void save_ownerWithNullId_throws() {
        Article a = makeArticle(null, ArticleStatus.AVAILABLE);
        User noIdOwner = new User();
        noIdOwner.setId(null);
        a.setOwner(noIdOwner);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> articleService.save(a));
        assertThat(ex.getMessage()).contains("Owner (with valid id) is required");
    }

    @Test
    void save_ownerNotFoundInDb_throws() {
        Article a = makeArticle(null, ArticleStatus.AVAILABLE);
        when(userRepository.findById(owner.getId())).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> articleService.save(a));
        assertThat(ex.getMessage()).contains("Owner not found");
    }

    // ------------ UPDATE /api/article/{id} ------------

    @Test
    void update_successful() {
        Article existing = makeArticle(2L, ArticleStatus.AVAILABLE);
        when(articleRepository.findById(2L)).thenReturn(Optional.of(existing));
        when(articleRepository.save(any(Article.class))).thenAnswer(i -> i.getArgument(0));

        Article update = new Article();
        update.setTitle("new");
        update.setDescription("newdesc");

        Article result = articleService.update(2L, owner.getId(), update);

        assertThat(result.getTitle()).isEqualTo("new");
        assertThat(result.getDescription()).isEqualTo("newdesc");
        verify(articleRepository).save(existing);
    }

    @Test
    void update_allOptionalFields() {
        Article existing = makeArticle(2L, ArticleStatus.AVAILABLE);
        when(articleRepository.findById(2L)).thenReturn(Optional.of(existing));
        when(articleRepository.save(any(Article.class))).thenAnswer(i -> i.getArgument(0));

        Article update = new Article();
        update.setTitle("t2");
        update.setDescription("d2");
        update.setCity("c2");
        update.setPricePerMonth(200.0);
        update.setAvailableFrom(LocalDate.now());
        update.setAvailableUntil(LocalDate.now().plusDays(10));
   //     update.setCategory("tools");
        update.setImageUrl("http://img.com");
        update.setPurchaseDate(LocalDate.of(2023, 1, 1));

        Article result = articleService.update(2L, owner.getId(), update);

        assertThat(result.getTitle()).isEqualTo("t2");
        assertThat(result.getDescription()).isEqualTo("d2");
        assertThat(result.getCity()).isEqualTo("c2");
        assertThat(result.getPricePerMonth()).isEqualTo(200.0);
        assertThat(result.getImageUrl()).isEqualTo("http://img.com");
    }

    @Test
    void update_notFound() {
        when(articleRepository.findById(5L)).thenReturn(Optional.empty());
        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> articleService.update(5L, owner.getId(), new Article()));
        assertThat(ex.getMessage()).contains("Article not found");
    }

    @Test
    void update_rentedThrows() {
        Article rented = makeArticle(3L, ArticleStatus.RENTED);
        when(articleRepository.findById(3L)).thenReturn(Optional.of(rented));
        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> articleService.update(3L, owner.getId(), new Article()));
        assertThat(ex.getMessage()).contains("currently rented");
    }

    @Test
    void update_ownerMismatch() {
        Article a = makeArticle(4L, ArticleStatus.AVAILABLE);
        User other = new User();
        other.setId(99L);
        a.setOwner(other);
        when(articleRepository.findById(4L)).thenReturn(Optional.of(a));
        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> articleService.update(4L, owner.getId(), new Article()));
        assertThat(ex.getMessage()).contains("Only the owner");
    }

    @Test
    void update_cannotChangeStatus() {
        Article a = makeArticle(6L, ArticleStatus.AVAILABLE);
        when(articleRepository.findById(6L)).thenReturn(Optional.of(a));
        Article update = new Article();
        update.setStatus(ArticleStatus.RENTED);
        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> articleService.update(6L, owner.getId(), update));
        assertThat(ex.getMessage()).contains("Cannot change status");
    }

    // ------------ DELETE /api/article/{id} ------------

    @Test
    void delete_successful() {
        Article a = makeArticle(7L, ArticleStatus.AVAILABLE);
        when(articleRepository.findById(7L)).thenReturn(Optional.of(a));
        doNothing().when(articleRepository).deleteById(7L);

        articleService.deleteById(7L, owner.getId());
        verify(articleRepository).deleteById(7L);
    }

    @Test
    void delete_notFound() {
        when(articleRepository.findById(8L)).thenReturn(Optional.empty());
        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> articleService.deleteById(8L, owner.getId()));
        assertThat(ex.getMessage()).contains("Article not found");
    }

    @Test
    void delete_rentedThrows() {
        Article a = makeArticle(9L, ArticleStatus.RENTED);
        when(articleRepository.findById(9L)).thenReturn(Optional.of(a));
        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> articleService.deleteById(9L, owner.getId()));
        assertThat(ex.getMessage()).contains("currently rented");
    }

    @Test
    void delete_ownerMismatch() {
        Article a = makeArticle(10L, ArticleStatus.AVAILABLE);
        User other = new User();
        other.setId(123L);
        a.setOwner(other);
        when(articleRepository.findById(10L)).thenReturn(Optional.of(a));
        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> articleService.deleteById(10L, owner.getId()));
        assertThat(ex.getMessage()).contains("Only the owner");
    }

    // ------------ toggleRent ------------

    @Test
    void toggleRent_availableToRented() {
        Article a = makeArticle(11L, ArticleStatus.AVAILABLE);
        when(articleRepository.findById(11L)).thenReturn(Optional.of(a));
        when(articleRepository.save(any(Article.class))).thenAnswer(i -> i.getArgument(0));

        Article updated = articleService.toggleRent(11L, owner.getId());
        assertThat(updated.getStatus()).isEqualTo(ArticleStatus.RENTED);
    }

    @Test
    void toggleRent_rentedToAvailable() {
        Article a = makeArticle(12L, ArticleStatus.RENTED);
        when(articleRepository.findById(12L)).thenReturn(Optional.of(a));
        when(articleRepository.save(any(Article.class))).thenAnswer(i -> i.getArgument(0));

        Article updated = articleService.toggleRent(12L, owner.getId());
        assertThat(updated.getStatus()).isEqualTo(ArticleStatus.AVAILABLE);
    }

    @Test
    void toggleRent_inactiveThrows() {
        Article a = makeArticle(13L, ArticleStatus.INACTIVE);
        when(articleRepository.findById(13L)).thenReturn(Optional.of(a));
        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> articleService.toggleRent(13L, owner.getId()));
        assertThat(ex.getMessage()).contains("Inactive articles");
    }

    @Test
    void toggleRent_ownerMismatch() {
        Article a = makeArticle(14L, ArticleStatus.AVAILABLE);
        User other = new User();
        other.setId(555L);
        a.setOwner(other);
        when(articleRepository.findById(14L)).thenReturn(Optional.of(a));
        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> articleService.toggleRent(14L, owner.getId()));
        assertThat(ex.getMessage()).contains("Only the owner");
    }

    @Test
    void toggleRent_notFound_throws() {
        when(articleRepository.findById(99L)).thenReturn(Optional.empty());
        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> articleService.toggleRent(99L, owner.getId()));
        assertThat(ex.getMessage()).contains("Article not found");
    }

    @Test
    void getMyArticles_returnsMappedDTOs() {
        Article articleAvailable = makeArticle(10L, ArticleStatus.AVAILABLE);
        articleAvailable.setTitle("Taladro");
        articleAvailable.setAvailableUntil(LocalDate.now().plusDays(5)); 

        Article articleRented = makeArticle(11L, ArticleStatus.RENTED);
        articleRented.setTitle("Bicicleta");
        LocalDate rentalEndDate = LocalDate.now().plusDays(10);
        articleRented.setAvailableUntil(rentalEndDate);

        when(articleRepository.findByOwnerId(owner.getId()))
            .thenReturn(List.of(articleAvailable, articleRented));

        List<UserArticle> result = articleService.findArticlesByUserId(owner.getId());

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

    @Test
    void getMyArticles_whenUserHasNoArticles_returnsEmptyList() {
        when(articleRepository.findByOwnerId(owner.getId())).thenReturn(List.of());

        List<UserArticle> result = articleService.findArticlesByUserId(owner.getId());

        assertThat(result).isEmpty();
        assertThat(result).isNotNull();
    }

    // ------------ CATEGORY METHODS ------------

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

    //------------ Gestión de fin de alquiler ------------

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

    @Test
    void processReturn_goodCondition_returnsDepositReturned() {
        Article a = makeArticle(20L, ArticleStatus.RENTED);
        a.setPricePerMonth(100.0);
        User tenant = new User();
        tenant.setId(2L);
        tenant.setEmail("tenant@example.com");
        Kit activeKit = makeActiveKit(tenant);

        when(articleRepository.findById(20L)).thenReturn(Optional.of(a));
        when(kitRepository.findActiveKitByItemId(20L, KitStatus.ACTIVE)).thenReturn(Optional.of(activeKit));
        when(articleRepository.save(any(Article.class))).thenAnswer(i -> i.getArgument(0));

        ReturnRequest request = new ReturnRequest("GOOD", "Todo perfecto");
        ReturnResponse response = articleService.processReturn(20L, owner.getId(), request);

        assertThat(response.resolution()).isEqualTo("DEPOSIT_RETURNED");
        assertThat(response.amountProcessed()).isEqualTo(20.0); // 20% de 100
        assertThat(response.articleId()).isEqualTo(20L);
        assertThat(response.tenantEmail()).isEqualTo("tenant@example.com");
        assertThat(response.message()).contains("buen estado");
        verify(articleRepository).save(a);
        assertThat(a.getStatus()).isEqualTo(ArticleStatus.AVAILABLE);
    }

    @Test
    void processReturn_damagedCondition_retainsDeposit() {
        Article a = makeArticle(21L, ArticleStatus.RENTED);
        a.setPricePerMonth(200.0);
        User tenant = new User();
        tenant.setId(3L);
        tenant.setEmail("damaged@example.com");
        Kit activeKit = makeActiveKit(tenant);

        when(articleRepository.findById(21L)).thenReturn(Optional.of(a));
        when(kitRepository.findActiveKitByItemId(21L, KitStatus.ACTIVE)).thenReturn(Optional.of(activeKit));
        when(articleRepository.save(any(Article.class))).thenAnswer(i -> i.getArgument(0));

        ReturnRequest request = new ReturnRequest("DAMAGED", "Tiene arañazos");
        ReturnResponse response = articleService.processReturn(21L, owner.getId(), request);

        assertThat(response.resolution()).isEqualTo("DEPOSIT_RETAINED");
        assertThat(response.amountProcessed()).isEqualTo(40.0); // 20% de 200
        assertThat(response.articleId()).isEqualTo(21L);
        assertThat(response.tenantEmail()).isEqualTo("damaged@example.com");
        assertThat(response.message()).contains("daños");
        verify(articleRepository).save(a);
        assertThat(a.getStatus()).isEqualTo(ArticleStatus.AVAILABLE);
    }

    @Test
    void processReturn_invalidCondition_throws() {
        Article a = makeArticle(22L, ArticleStatus.RENTED);
        User tenant = new User();
        tenant.setId(4L);
        tenant.setEmail("t@example.com");
        Kit activeKit = makeActiveKit(tenant);

        when(articleRepository.findById(22L)).thenReturn(Optional.of(a));
        when(kitRepository.findActiveKitByItemId(22L, KitStatus.ACTIVE)).thenReturn(Optional.of(activeKit));

        ReturnRequest request = new ReturnRequest("UNKNOWN", "");

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
            () -> articleService.processReturn(22L, owner.getId(), request));
        assertThat(ex.getMessage()).contains("Condición no válida");
    }

    @Test
    void processReturn_articleNotFound_throws() {
        when(articleRepository.findById(99L)).thenReturn(Optional.empty());

        ReturnRequest request = new ReturnRequest("GOOD", "");

        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> articleService.processReturn(99L, owner.getId(), request));
        assertThat(ex.getMessage()).contains("Article not found");
    }

    @Test
    void processReturn_notOwner_throws() {
        Article a = makeArticle(23L, ArticleStatus.RENTED);
        User otherOwner = new User();
        otherOwner.setId(999L);
        a.setOwner(otherOwner);

        when(articleRepository.findById(23L)).thenReturn(Optional.of(a));

        ReturnRequest request = new ReturnRequest("GOOD", "");

        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> articleService.processReturn(23L, owner.getId(), request));
        assertThat(ex.getMessage()).contains("Only the owner can confirm the return");
    }

    @Test
    void processReturn_articleNotRented_throws() {
        Article a = makeArticle(24L, ArticleStatus.AVAILABLE);

        when(articleRepository.findById(24L)).thenReturn(Optional.of(a));

        ReturnRequest request = new ReturnRequest("GOOD", "");

        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> articleService.processReturn(24L, owner.getId(), request));
        assertThat(ex.getMessage()).contains("not currently rented");
    }

    @Test
    void processReturn_noActiveKit_throws() {
        Article a = makeArticle(25L, ArticleStatus.RENTED);

        when(articleRepository.findById(25L)).thenReturn(Optional.of(a));
        when(kitRepository.findActiveKitByItemId(25L, KitStatus.ACTIVE)).thenReturn(Optional.empty());

        ReturnRequest request = new ReturnRequest("GOOD", "");

        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> articleService.processReturn(25L, owner.getId(), request));
        assertThat(ex.getMessage()).contains("No active Kit found");
    }

    @Test
    void processReturn_goodCondition_setsArticleAvailableAndClearsUntil() {
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

        ReturnRequest request = new ReturnRequest("GOOD", "");
        articleService.processReturn(26L, owner.getId(), request);

        assertThat(a.getStatus()).isEqualTo(ArticleStatus.AVAILABLE);
        assertThat(a.getAvailableUntil()).isNull();
        verify(articleRepository).save(a);
    }
}
