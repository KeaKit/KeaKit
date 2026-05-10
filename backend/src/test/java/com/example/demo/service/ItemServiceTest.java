package com.example.demo.service;

import com.example.demo.dto.ItemFilterResponseDTO;
import com.example.demo.model.Article;
import com.example.demo.model.ArticleCondition;
import com.example.demo.model.ArticleStatus;
import com.example.demo.model.Category;
import com.example.demo.model.CategoryStatus;
import com.example.demo.model.Item;
import com.example.demo.model.ItemMemento;
import com.example.demo.model.Kit;
import com.example.demo.model.KitStatus;
import com.example.demo.model.ServiceItem;
import com.example.demo.model.ServiceStatus;
import com.example.demo.model.User;
import com.example.demo.model.UserRole;
import com.example.demo.repository.ItemRepository;
import com.example.demo.repository.ArticleRepository;
import com.example.demo.repository.KitRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ItemServiceTest {

    @Mock private ArticleRepository articleRepository;
    @Mock private ItemRepository itemRepository;
    @Mock private DefaultKitService defaultKitService;
    @Mock private KitRepository kitRepository;

    @InjectMocks
    private ItemService itemService;

    private User owner;
    private Category category;

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
    }

    private Article makeArticle(Long id, ArticleCondition condition, ArticleStatus status, double price) {
        Article article = new Article();
        article.setId(id);
        article.setTitle("Taladro");
        article.setDescription("Un taladro potente");
        article.setCity("Madrid");
        article.setCountry("España");
        article.setPricePerMonth(price);
        article.setAvailableFrom(LocalDate.now().plusDays(1));
        article.setAvailableUntil(LocalDate.now().plusDays(30));
        article.setOwner(owner);
        article.setCategory(category);
        article.setCondition(condition);
        article.setStatus(status);
        article.setImageUrl("img.jpg");
        return article;
    }

    private ServiceItem makeService(Long id, ServiceStatus status, double price) {
        ServiceItem service = new ServiceItem();
        service.setId(id);
        service.setTitle("Montaje");
        service.setDescription("Servicio de montaje");
        service.setCity("Sevilla");
        service.setCountry("España");
        service.setPricePerMonth(price);
        service.setAvailableFrom(LocalDate.now().plusDays(1));
        service.setAvailableUntil(LocalDate.now().plusDays(30));
        service.setOwner(owner);
        service.setCategory(category);
        service.setStatus(status);
        return service;
    }

    private Kit makeKitWithSnapshot(
            Long itemId,
            int selectedUnits,
            LocalDate startDate,
            LocalDate endDate,
            KitStatus status
    ) {
        Kit kit = new Kit();
        kit.setStartDate(startDate);
        kit.setEndDate(endDate);
        kit.setStatus(status);

        ItemMemento snapshot = new ItemMemento();
        snapshot.setOriginalItemId(itemId);
        snapshot.setSelectedUnits(selectedUnits);
        kit.setSnapshots(List.of(snapshot));

        return kit;
    }

    @Test
    void filterItemsForKit_withConditionAndPriceRange_returnsMappedResponse() {
        List<Item> items = List.of(
                makeArticle(1L, ArticleCondition.USED, ArticleStatus.AVAILABLE, 25.0),
                makeService(2L, ServiceStatus.ACTIVE, 40.0)
        );
        Page<Item> page = new PageImpl<>(items, PageRequest.of(0, 10), items.size());

        when(itemRepository.findAll(org.mockito.ArgumentMatchers.<Specification<Item>>any(), eq(PageRequest.of(0, 10)))).thenReturn(page);

        ItemFilterResponseDTO result = itemService.filterItemsForKit(20.0, 50.0, null, null, null, "USED", 0, 10, null, null);

        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getContent().get(0).getId()).isEqualTo(1L);
        assertThat(result.getContent().get(0).getStatus()).isEqualTo("AVAILABLE");
        assertThat(result.getContent().get(0).getCondition()).isEqualTo("USED");
        assertThat(result.getContent().get(1).getId()).isEqualTo(2L);
        assertThat(result.getContent().get(1).getStatus()).isEqualTo("ACTIVE");
        assertThat(result.getContent().get(1).getCondition()).isNull();
        assertThat(result.getPage()).isEqualTo(0);
        assertThat(result.getSize()).isEqualTo(10);

        verify(itemRepository).findAll(org.mockito.ArgumentMatchers.<Specification<Item>>any(), eq(PageRequest.of(0, 10)));
    }

    @Test
    void filterItemsForKit_whenArticleFullyBookedForRequestedDates_returnsZeroUnitsAndRentedStatus() {
        LocalDate startDate = LocalDate.of(2026, 5, 10);
        LocalDate endDate = LocalDate.of(2026, 5, 12);
        Article article = makeArticle(1L, ArticleCondition.USED, ArticleStatus.AVAILABLE, 25.0);
        article.setTotalUnits(2);

        Page<Item> page = new PageImpl<>(List.of(article), PageRequest.of(0, 10), 1);
        Kit paidKit = makeKitWithSnapshot(1L, 2, startDate, endDate, KitStatus.PAID);

        when(itemRepository.findAll(org.mockito.ArgumentMatchers.<Specification<Item>>any(), eq(PageRequest.of(0, 10)))).thenReturn(page);
        when(kitRepository.findOverlappingKitsForItem(
                eq(1L),
                eq(startDate),
                eq(endDate),
                eq(List.of(KitStatus.PAID, KitStatus.ACTIVE))
        )).thenReturn(List.of(paidKit));

        ItemFilterResponseDTO result = itemService.filterItemsForKit(null, null, null, null, null, null, 0, 10, startDate, endDate);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getId()).isEqualTo(1L);
        assertThat(result.getContent().get(0).getTotalUnits()).isZero();
        assertThat(result.getContent().get(0).getStatus()).isEqualTo("RENTED");
    }

    @Test
    void filterItemsForKit_whenOnlySomeUnitsAreBookedForRequestedDates_returnsRemainingUnitsAndAvailableStatus() {
        LocalDate startDate = LocalDate.of(2026, 5, 10);
        LocalDate endDate = LocalDate.of(2026, 5, 13);
        Article article = makeArticle(1L, ArticleCondition.USED, ArticleStatus.AVAILABLE, 25.0);
        article.setTotalUnits(3);

        Page<Item> page = new PageImpl<>(List.of(article), PageRequest.of(0, 10), 1);
        Kit firstOverlappingKit = makeKitWithSnapshot(1L, 2, LocalDate.of(2026, 5, 10), LocalDate.of(2026, 5, 11), KitStatus.PAID);
        Kit secondOverlappingKit = makeKitWithSnapshot(1L, 1, LocalDate.of(2026, 5, 12), LocalDate.of(2026, 5, 13), KitStatus.ACTIVE);

        when(itemRepository.findAll(org.mockito.ArgumentMatchers.<Specification<Item>>any(), eq(PageRequest.of(0, 10)))).thenReturn(page);
        when(kitRepository.findOverlappingKitsForItem(
                eq(1L),
                eq(startDate),
                eq(endDate),
                eq(List.of(KitStatus.PAID, KitStatus.ACTIVE))
        )).thenReturn(List.of(firstOverlappingKit, secondOverlappingKit));

        ItemFilterResponseDTO result = itemService.filterItemsForKit(null, null, null, null, null, null, 0, 10, startDate, endDate);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getTotalUnits()).isEqualTo(1);
        assertThat(result.getContent().get(0).getStatus()).isEqualTo("AVAILABLE");
    }

    @Test
    void filterItemsForKit_whenMinPriceIsGreaterThanMaxPrice_throws() {
        assertThatThrownBy(() -> itemService.filterItemsForKit(60.0, 20.0, null, null, null, null, 0, 10, null, null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("El precio mínimo no puede ser mayor que el precio máximo");
    }

    @Test
    void filterItemsForKit_whenConditionIsInvalid_throws() {
        assertThatThrownBy(() -> itemService.filterItemsForKit(20.0, 50.0, null, null, null, "BROKEN", 0, 10, null, null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("La condición debe ser una entre: NEW, LIGHTLY_USED, USED, WORN");
    }
}
