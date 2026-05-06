package com.example.demo.dto;

import java.util.List;

public class DefaultKitResponse {
    private Long id;
    private String name;
    private String description;
    private Double basePrice;
    private List<DefaultKitItemResponse> items;

    public DefaultKitResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getBasePrice() { return basePrice; }
    public void setBasePrice(Double basePrice) { this.basePrice = basePrice; }

    public List<DefaultKitItemResponse> getItems() { return items; }
    public void setItems(List<DefaultKitItemResponse> items) { this.items = items; }
}