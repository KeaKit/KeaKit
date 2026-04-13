package com.example.demo.service;

import com.example.demo.dto.ItemCatalogResponse;
import com.example.demo.dto.ItemFilterResponseDTO;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.model.Article;
import com.example.demo.model.ArticleCondition;
import com.example.demo.model.Item;
import com.example.demo.model.ItemFilter;
import com.example.demo.model.ServiceItem;
import com.example.demo.repository.ItemRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import com.example.demo.model.Kit;
import com.example.demo.model.KitStatus;
import com.example.demo.repository.KitRepository;
import java.time.LocalDate;
import java.util.List;

@Service
public class ItemService {

    private final ItemRepository itemRepository;
    private final DefaultKitService defaultKitService;
    private final KitRepository kitRepository;

    public ItemService(ItemRepository itemRepository, DefaultKitService defaultKitService, KitRepository kitRepository) {
        this.itemRepository = itemRepository;
        this.defaultKitService = defaultKitService;
        this.kitRepository = kitRepository;

    }

    public List<Item> findAll() {
        return itemRepository.findAll();
    }

    public ItemFilterResponseDTO filterItemsForKit(Double minPrice, Double maxPrice, String country, String city,
            Long categoryId, String condition, Integer page, Integer size) {
        ArticleCondition parsedCondition = validateAndParseFilterInput(minPrice, maxPrice, country, city, categoryId,
                condition, page, size);

        int safePage = page != null ? page : 0;
        int safeSize = size != null ? size : 10;
        String sanitizedCountry = sanitizeCountry(country);
        String sanitizedCity = sanitizeCity(city);

        Pageable pageable = PageRequest.of(safePage, safeSize);
        Specification<Item> spec = Specification.where(ItemFilter.isRentable())
                .and(ItemFilter.isPriceInRange(minPrice, maxPrice))
                .and(ItemFilter.hasCountry(sanitizedCountry))
                .and(ItemFilter.hasCity(sanitizedCity))
                .and(ItemFilter.hasCategoryId(categoryId))
                .and(ItemFilter.hasArticleCondition(parsedCondition));

        Page<ItemCatalogResponse> resultPage = itemRepository.findAll(spec, pageable).map(this::toCatalogResponse);

        if (resultPage.isEmpty()) {
            throw new ResourceNotFoundException("No items found for the provided filters");
        }

        return new ItemFilterResponseDTO(
                resultPage.getContent(),
                resultPage.getNumber(),
                resultPage.getSize(),
                resultPage.getTotalElements(),
                resultPage.getTotalPages(),
                resultPage.hasNext(),
                resultPage.hasPrevious()
        );
    }

    public List<ItemCatalogResponse> findItemsForRent(Long ownerId) {
    List<KitStatus> activeStatuses = List.of(KitStatus.PAID, KitStatus.ACTIVE);
    LocalDate today = LocalDate.now();

    return itemRepository.findAll()
        .stream()
        .filter(item -> !item.getOwner().getId().equals(ownerId))
        .map(item -> {
            List<Kit> occupiedKits = kitRepository.findOverlappingKitsForItem(
                item.getId(), today, today, activeStatuses);
            int occupiedUnits = occupiedKits.stream()
                .flatMap(k -> k.getSnapshots().stream())
                .filter(s -> s.getOriginalItemId().equals(item.getId()))
                .mapToInt(s -> s.getSelectedUnits())
                .sum();
            int totalUnits = item.getTotalUnits() != null ? item.getTotalUnits() : 1;
            int availableUnits = Math.max(0, totalUnits - occupiedUnits);
            ItemCatalogResponse dto = toCatalogResponse(item);
            dto.setAvailableUnits(availableUnits);
            return dto;
        })
        .toList();
}

    public Item findById(Long id) throws ResourceNotFoundException {
        return itemRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Item not found"));
    }

    public Item save(Item item) {
        return itemRepository.save(item);
    }

    public Item update(Long id, Item updateData) {
        Item item = itemRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Item not found"));

        if (updateData.getTitle() != null) item.setTitle(updateData.getTitle());
        if (updateData.getDescription() != null) item.setDescription(updateData.getDescription());
        if (updateData.getCity() != null) item.setCity(updateData.getCity());
        if (updateData.getPricePerMonth() != null) item.setPricePerMonth(updateData.getPricePerMonth());
        if (updateData.getAvailableFrom() != null) item.setAvailableFrom(updateData.getAvailableFrom());
        if (updateData.getAvailableUntil() != null) item.setAvailableUntil(updateData.getAvailableUntil());
        if (updateData.getCategory() != null) item.setCategory(updateData.getCategory());
        if (updateData.getTotalUnits() != null) {
            if (updateData.getTotalUnits() < 1) {
                throw new RuntimeException("totalUnits must be >= 1");
            }
            item.setTotalUnits(updateData.getTotalUnits());
        }
        if (updateData.getOwner() != null) item.setOwner(updateData.getOwner());

        return itemRepository.save(item);
    }

    public void deleteById(Long id) {
        if (!itemRepository.existsById(id)) {
            throw new RuntimeException("Item not found");
        }
        defaultKitService.removeItemFromAllDefaultKits(id);
        itemRepository.deleteById(id);
    }

    private ArticleCondition validateAndParseFilterInput(Double minPrice, Double maxPrice, String country, String city,
            Long categoryId, String condition, Integer page, Integer size) {
        if (minPrice != null && minPrice <= 0) {
            throw new IllegalArgumentException("minPrice must be greater than 0");
        }
        if (maxPrice != null && maxPrice <= 0) {
            throw new IllegalArgumentException("maxPrice must be greater than 0");
        }
        if (minPrice != null && maxPrice != null && minPrice > maxPrice) {
            throw new IllegalArgumentException("minPrice cannot be greater than maxPrice");
        }

        if (country != null) {
            String trimmed = country.trim();
            if (trimmed.isEmpty()) {
                throw new IllegalArgumentException("country must not be blank");
            }
            if (trimmed.length() > 120) {
                throw new IllegalArgumentException("country cannot exceed 120 characters");
            }
        }

        if (city != null) {
            String trimmed = city.trim();
            if (trimmed.isEmpty()) {
                throw new IllegalArgumentException("city must not be blank");
            }
            if (trimmed.length() > 120) {
                throw new IllegalArgumentException("city cannot exceed 120 characters");
            }
        }

        if (categoryId != null && categoryId <= 0) {
            throw new IllegalArgumentException("categoryId must be greater than 0");
        }

        if (page != null && page < 0) {
            throw new IllegalArgumentException("page must be greater than or equal to 0");
        }
        if (size != null && size <= 0) {
            throw new IllegalArgumentException("size must be greater than 0");
        }

        if (condition == null || condition.trim().isEmpty()) {
            return null;
        }

        try {
            return ArticleCondition.valueOf(condition.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("condition must be one of: NEW, LIGHTLY_USED, USED, WORN");
        }
    }

    private String sanitizeCountry(String country) {
        if (country == null) {
            return null;
        }
        String trimmed = country.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String sanitizeCity(String city) {
        if (city == null) {
            return null;
        }
        String trimmed = city.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private ItemCatalogResponse toCatalogResponse(Item item) {
        ItemCatalogResponse dto = new ItemCatalogResponse();
        dto.setId(item.getId());
        dto.setTitle(item.getTitle());
        dto.setDescription(item.getDescription());
        dto.setCity(item.getCity());
        dto.setCountry(item.getCountry());
        dto.setPricePerMonth(item.getPricePerMonth());
        dto.setAvailableFrom(item.getAvailableFrom());
        dto.setAvailableUntil(item.getAvailableUntil());
        dto.setCategory(item.getCategory() != null ? item.getCategory().getName() : null);
        dto.setTotalUnits(item.getTotalUnits() != null ? item.getTotalUnits() : 1);
        dto.setOwnerId(item.getOwner() != null ? item.getOwner().getId() : null);
        dto.setOwnerName(item.getOwner() != null ? item.getOwner().getName() : null);

        if (item instanceof Article article) {
            dto.setItemType("ARTICLE");
            dto.setStatus(article.getStatus() != null ? article.getStatus().name() : null);
            dto.setCondition(article.getCondition() != null ? article.getCondition().name() : null);
            dto.setImageUrl(article.getImageUrl());
        } else if (item instanceof ServiceItem serviceItem) {
            dto.setItemType("SERVICE");
            dto.setStatus(serviceItem.getStatus() != null ? serviceItem.getStatus().name() : null);
            dto.setCondition(null);
            dto.setImageUrl(null);
        }

        return dto;
    }
}
