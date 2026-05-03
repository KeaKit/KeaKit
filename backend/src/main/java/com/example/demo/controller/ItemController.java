package com.example.demo.controller;

import com.example.demo.dto.ErrorResponse;
import com.example.demo.dto.ItemFilterDTO;
import com.example.demo.dto.ItemFilterResponseDTO;
import com.example.demo.dto.ItemCatalogResponse;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.model.Article;
import com.example.demo.model.Item;
import com.example.demo.service.ItemService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/items")
@CrossOrigin(origins = "*")
public class ItemController {

    private final ItemService itemService;

    public ItemController(ItemService itemService) {
        this.itemService = itemService;
    }

    @GetMapping("/all")
    public ResponseEntity<List<ItemCatalogResponse>> getAllItems() {
        List<ItemCatalogResponse> response = itemService.findAll()
            .stream()
            .map(this::toCatalogResponse)
            .toList();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/for-rent/{ownerId}")
    public ResponseEntity<List<ItemCatalogResponse>> getAllItemsForRent(@PathVariable Long ownerId) {
        List<ItemCatalogResponse> response = itemService.findItemsForRent(ownerId)
            .stream()
            .map(this::toCatalogResponse)
            .toList();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/filter-for-kit")
    public ResponseEntity<?> filterItemsForKit(
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) String country,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String condition,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
                    @RequestParam(required = false) LocalDate startDate,  
        @RequestParam(required = false) LocalDate endDate,
            HttpServletRequest request) {
        try {
            ItemFilterResponseDTO response = itemService.filterItemsForKit(minPrice, maxPrice, country, city, categoryId,
                    condition, page, size, startDate, endDate);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(400, "Bad Request", e.getMessage(), request.getRequestURI()));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(404, "Not Found", e.getMessage(), request.getRequestURI()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(500, "Internal Server Error", e.getMessage(), request.getRequestURI()));
        }
    }

    @PostMapping("/filter-for-kit")
    public ResponseEntity<?> filterItemsForKit(
            @Valid @RequestBody ItemFilterDTO filter,
            HttpServletRequest request) {
        try {
            ItemFilterResponseDTO response = itemService.filterItemsForKit(
                    filter.getMinPrice(),
                    filter.getMaxPrice(),
                    filter.getCountry(),
            filter.getCity(),
            filter.getCategoryId(),
            filter.getCondition(),
                    filter.getPage(),
                    filter.getSize(),filter.getStartDate(), filter.getEndDate());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(400, "Bad Request", e.getMessage(), request.getRequestURI()));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(404, "Not Found", e.getMessage(), request.getRequestURI()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(500, "Internal Server Error", e.getMessage(), request.getRequestURI()));
        }
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
        } else {
            dto.setItemType("SERVICE");
            dto.setStatus(null);
            dto.setCondition(null);
            dto.setImageUrl(null);
        }

        return dto;
    }
}
