package com.example.demo.controller;

import com.example.demo.dto.ItemCatalogResponse;
import com.example.demo.model.Article;
import com.example.demo.model.Item;
import com.example.demo.service.ItemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    private ItemCatalogResponse toCatalogResponse(Item item) {
        ItemCatalogResponse dto = new ItemCatalogResponse();
        dto.setId(item.getId());
        dto.setTitle(item.getTitle());
        dto.setDescription(item.getDescription());
        dto.setCity(item.getCity());
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
            dto.setImageUrl(article.getImageUrl());
        } else {
            dto.setItemType("SERVICE");
            dto.setStatus(null);
            dto.setImageUrl(null);
        }

        return dto;
    }
}
