package com.example.demo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;

@Entity
@Table(name = "categories")
public class Category {
    
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(nullable = false, length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CategoryStatus status;

    @DecimalMin(value = "0.0", message = "El precio no puede ser negativo")
    @DecimalMax(value = "1000000.0", message = "El precio no puede superar el 1.000.000")
    @Column(name = "min_price", nullable = false)
    private Double minPrice;

    @DecimalMin(value = "0.0", message = "El precio no puede ser negativo")
    @DecimalMax(value = "1000000.0", message = "El precio no puede superar el 1.000.000")
    @Column(name = "max_price", nullable = false)
    private Double maxPrice;

    public Category() {
        this.status = CategoryStatus.DRAFT;
    }

    public Category(String name, String description, Double minPrice, Double maxPrice) {
        this.name = name;
        this.description = description;
        this.minPrice = minPrice;
        this.maxPrice = maxPrice;
        this.status = CategoryStatus.DRAFT;
    }

    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }

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

    public CategoryStatus getStatus() {
        return status;
    }
    public void setStatus(CategoryStatus status) {
        this.status = status;
    }

    public Double getMinPrice() {
        return minPrice;
    }
    public void setMinPrice(Double minPrice) {
        this.minPrice = minPrice;
    }

    public Double getMaxPrice() {
        return maxPrice;
    }
    public void setMaxPrice(Double maxPrice) {
        this.maxPrice = maxPrice;
    }

    @PrePersist
    @PreUpdate
    private void validatePrices() {
        if (minPrice != null && maxPrice != null && minPrice > maxPrice) {
            throw new IllegalArgumentException("minPrice cannot be greater than maxPrice");
        }
        if (minPrice != null) {
            this.minPrice = Math.round(this.minPrice * 100.0) / 100.0;
        }
        if (maxPrice != null) {
            this.maxPrice = Math.round(this.maxPrice * 100.0) / 100.0;
        }
    }

}
