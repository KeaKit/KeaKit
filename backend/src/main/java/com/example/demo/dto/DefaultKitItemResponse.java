package com.example.demo.dto;

public class DefaultKitItemResponse {
    private Long id;

    private ItemCatalogResponse item;

    public DefaultKitItemResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public ItemCatalogResponse getItem() { return item; }
    public void setItem(ItemCatalogResponse item) { this.item = item; }
}