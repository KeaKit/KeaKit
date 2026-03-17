package com.example.demo.dto;

import java.util.List;

public class DefaultKitCreateRequest {
    private String name;
    private String description;
    private Double basePrice;
    private List<Long> articleIds;

    // Constructores
    public DefaultKitCreateRequest() {
    }

    public DefaultKitCreateRequest(String name, String description, Double basePrice, List<Long> articleIds) {
        this.name = name;
        this.description = description;
        this.basePrice = basePrice;
        this.articleIds = articleIds;
    }

    // Getters y Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getBasePrice() {
        return basePrice;
    }

    public void setBasePrice(Double basePrice) {
        this.basePrice = basePrice;
    }

    public List<Long> getArticleIds() {
        return articleIds;
    }

    public void setArticleIds(List<Long> articleIds) {
        this.articleIds = articleIds;
    }
}