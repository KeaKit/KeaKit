package com.example.demo.dto;

import java.util.List;

public class DefaultKitCreateRequest {
    private String name;
    private String description;
    private List<Long> itemsIds;

    // Constructores
    public DefaultKitCreateRequest() {
    }

    public DefaultKitCreateRequest(String name, String description, List<Long> itemIds) {
        this.name = name;
        this.description = description;
        this.itemsIds = itemIds;
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

    public List<Long> getItemsIds() {
        return itemsIds;
    }

    public void setItemsIds(List<Long> itemIds) {
        this.itemsIds = itemIds;
    }
}