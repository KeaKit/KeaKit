package com.example.demo.article;

import com.example.demo.model.*;
import com.example.demo.repository.ArticleRepository;
import com.example.demo.repository.CategoryRepository;
import com.example.demo.repository.KitRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.ArticleService;
import com.example.demo.service.CloudinaryService;
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

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT) 
class ArticleServiceTest {

    @Mock private ArticleRepository articleRepository;
    @Mock private UserRepository userRepository;
    @Mock private CategoryRepository categoryRepository;
    @Mock private KitRepository kitRepository;
    @Mock private CloudinaryService cloudinaryService;

    @InjectMocks
    private ArticleService articleService;

    private User owner;
    private Category category;
    private Article article;

    private static final LocalDate FROM  = LocalDate.now().plusDays(1);
    private static final LocalDate UNTIL = LocalDate.now().plusDays(30);

    @BeforeEach
    void setUp() {
        owner = new User();
        owner.setId(1L);
        owner.setName("Owner");

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

    @Test
    void save_missingTitle_throws() {
        article.setTitle(null);
        assertThatThrownBy(() -> articleService.save(article))
            .isInstanceOf(RuntimeException.class)
            .hasMessage("Title is required");
    }

    @Test
    void save_emptyTitle_throws() {
        article.setTitle("   ");
        assertThatThrownBy(() -> articleService.save(article))
            .isInstanceOf(RuntimeException.class)
            .hasMessage("Title is required");
    }

    @Test
    void save_missingDescription_throws() {
        article.setDescription(null);
        assertThatThrownBy(() -> articleService.save(article))
            .isInstanceOf(RuntimeException.class)
            .hasMessage("Description is required");
    }

    @Test
    void save_descriptionTooLong_throws() {
        article.setDescription("a".repeat(1001));
        assertThatThrownBy(() -> articleService.save(article))
            .isInstanceOf(RuntimeException.class)
            .hasMessage("Description cannot exceed 1000 characters");
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
            .hasMessage("City is required");
    }

    @Test
    void save_negativePrice_throws() {
        article.setPricePerMonth(-1.0);
        assertThatThrownBy(() -> articleService.save(article))
            .isInstanceOf(RuntimeException.class)
            .hasMessage("pricePerMonth must be >= 0");
    }

    @Test
    void save_priceBelowCategoryMin_throws() {
        article.setPricePerMonth(1.0); // < minPrice 5.0
        assertThatThrownBy(() -> articleService.save(article))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("pricePerMonth must be between");
    }

    @Test
    void save_priceAboveCategoryMax_throws() {
        article.setPricePerMonth(9999.0); // > maxPrice 500.0
        assertThatThrownBy(() -> articleService.save(article))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("pricePerMonth must be between");
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
            .hasMessage("availableFrom cannot be in the past");
    }

    @Test
    void save_availableFromAfterUntil_throws() {
        article.setAvailableFrom(LocalDate.now().plusDays(10));
        article.setAvailableUntil(LocalDate.now().plusDays(5));
        assertThatThrownBy(() -> articleService.save(article))
            .isInstanceOf(RuntimeException.class)
            .hasMessage("availableFrom must be before or equal to availableUntil");
    }

    @Test
    void save_nullOwner_throws() {
        article.setOwner(null);
        assertThatThrownBy(() -> articleService.save(article))
            .isInstanceOf(RuntimeException.class)
            .hasMessage("Owner (with valid id) is required");
    }

    @Test
    void save_ownerNotFound_throws() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty()); // override del setUp
        assertThatThrownBy(() -> articleService.save(article))
            .isInstanceOf(RuntimeException.class)
            .hasMessage("Owner not found");
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
    void update_articleRented_throws() {
        article.setStatus(ArticleStatus.RENTED);
        when(articleRepository.findById(1L)).thenReturn(Optional.of(article));

        Article updateData = new Article();
        updateData.setTitle("Nuevo");

        assertThatThrownBy(() -> articleService.update(1L, 1L, updateData))
            .isInstanceOf(RuntimeException.class)
            .hasMessage("Article is currently rented and cannot be edited");
    }

    @Test
    void update_notOwner_throws() {
        when(articleRepository.findById(1L)).thenReturn(Optional.of(article));

        Article updateData = new Article();
        updateData.setTitle("Intento");

        assertThatThrownBy(() -> articleService.update(1L, 999L, updateData))
            .isInstanceOf(RuntimeException.class)
            .hasMessage("Only the owner can modify this article");
    }

    @Test
    void update_cannotChangeStatus_throws() {
        when(articleRepository.findById(1L)).thenReturn(Optional.of(article));

        Article updateData = new Article();
        updateData.setStatus(ArticleStatus.RENTED);

        assertThatThrownBy(() -> articleService.update(1L, 1L, updateData))
            .isInstanceOf(RuntimeException.class)
            .hasMessage("Cannot change status via update; use toggleRent endpoint");
    }

    @Test
    void update_descriptionTooLong_throws() {
        when(articleRepository.findById(1L)).thenReturn(Optional.of(article));

        Article updateData = new Article();
        updateData.setDescription("a".repeat(1001));

        assertThatThrownBy(() -> articleService.update(1L, 1L, updateData))
            .isInstanceOf(RuntimeException.class)
            .hasMessage("Description cannot exceed 1000 characters");
    }

    @Test
    void update_priceOutOfCategoryRange_throws() {
        when(articleRepository.findById(1L)).thenReturn(Optional.of(article));

        Article updateData = new Article();
        updateData.setPricePerMonth(9999.0);

        assertThatThrownBy(() -> articleService.update(1L, 1L, updateData))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("pricePerMonth must be between");
    }

    @Test
    void update_availableFromInPast_throws() {
        when(articleRepository.findById(1L)).thenReturn(Optional.of(article));

        Article updateData = new Article();
        updateData.setAvailableFrom(LocalDate.now().minusDays(1));

        assertThatThrownBy(() -> articleService.update(1L, 1L, updateData))
            .isInstanceOf(RuntimeException.class)
            .hasMessage("availableFrom cannot be in the past");
    }

    @Test
    void update_availableFromAfterUntil_throws() {
        when(articleRepository.findById(1L)).thenReturn(Optional.of(article));

        Article updateData = new Article();
        updateData.setAvailableFrom(LocalDate.now().plusDays(20));
        updateData.setAvailableUntil(LocalDate.now().plusDays(5));

        assertThatThrownBy(() -> articleService.update(1L, 1L, updateData))
            .isInstanceOf(RuntimeException.class)
            .hasMessage("availableFrom must be before or equal to availableUntil");
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

        LocalDate newFrom  = LocalDate.now().plusDays(5);
        LocalDate newUntil = LocalDate.now().plusDays(60);

        Article updateData = new Article();
        updateData.setAvailableFrom(newFrom);
        updateData.setAvailableUntil(newUntil);

        Article result = articleService.update(1L, 1L, updateData);
        assertThat(result.getAvailableFrom()).isEqualTo(newFrom);
        assertThat(result.getAvailableUntil()).isEqualTo(newUntil);
    }

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
    void delete_articleRented_throws() {
        article.setStatus(ArticleStatus.RENTED);
        when(articleRepository.findById(1L)).thenReturn(Optional.of(article));

        assertThatThrownBy(() -> articleService.deleteById(1L, 1L))
            .isInstanceOf(RuntimeException.class)
            .hasMessage("Article is currently rented and cannot be deleted");
    }

    @Test
    void delete_notOwner_throws() {
        when(articleRepository.findById(1L)).thenReturn(Optional.of(article));

        assertThatThrownBy(() -> articleService.deleteById(1L, 999L))
            .isInstanceOf(RuntimeException.class)
            .hasMessage("Only the owner can delete this article");
    }

    @Test
    void delete_articleNotFound_throws() {
        when(articleRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> articleService.deleteById(99L, 1L))
            .isInstanceOf(RuntimeException.class)
            .hasMessage("Article not found");
    }

    @Test
    void delete_success_callsRepository() throws Exception {
        article.setImageUrl(null);
        when(articleRepository.findById(1L)).thenReturn(Optional.of(article));

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
    void toggleRent_notOwner_throws() {
        when(articleRepository.findById(1L)).thenReturn(Optional.of(article));

        assertThatThrownBy(() -> articleService.toggleRent(1L, 999L))
            .isInstanceOf(RuntimeException.class)
            .hasMessage("Only the owner can change rental status");
    }

    @Test
    void toggleRent_inactiveArticle_throws() {
        article.setStatus(ArticleStatus.INACTIVE);
        when(articleRepository.findById(1L)).thenReturn(Optional.of(article));

        assertThatThrownBy(() -> articleService.toggleRent(1L, 1L))
            .isInstanceOf(RuntimeException.class)
            .hasMessage("Inactive articles cannot be rented");
    }

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
    void toggleRent_articleNotFound_throws() {
        when(articleRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> articleService.toggleRent(99L, 1L))
            .isInstanceOf(RuntimeException.class)
            .hasMessage("Article not found");
    }

    @Test
    void findArticlesByUserId_returnsUserArticleDtos() {
        Article rented = new Article();
        rented.setId(2L);
        rented.setTitle("Sierra");
        rented.setImageUrl("url");
        rented.setPricePerMonth(30.0);
        rented.setStatus(ArticleStatus.RENTED);
        rented.setAvailableUntil(UNTIL);

        when(articleRepository.findByOwnerId(1L)).thenReturn(List.of(article, rented));

        var result = articleService.findArticlesByUserId(1L);

        assertThat(result).hasSize(2);

        var rentedDto = result.stream().filter(a -> "RENTED".equals(a.status())).findFirst().orElseThrow();
        assertThat(rentedDto.rentedUntil()).isEqualTo(UNTIL);

        var availableDto = result.stream().filter(a -> "AVAILABLE".equals(a.status())).findFirst().orElseThrow();
        assertThat(availableDto.rentedUntil()).isNull();
    }

    @Test
    void findArticlesByUserId_emptyList_returnsEmpty() {
        when(articleRepository.findByOwnerId(99L)).thenReturn(List.of());

        var result = articleService.findArticlesByUserId(99L);
        assertThat(result).isEmpty();
    }
}