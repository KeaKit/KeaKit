package com.example.demo.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public class ItemFilterDTO {

    @Positive(message = "minPrice must be greater than 0")
    private Double minPrice;

    @Positive(message = "maxPrice must be greater than 0")
    private Double maxPrice;

    @Size(max = 120, message = "country cannot exceed 120 characters")
    private String country;

    @Size(max = 120, message = "city cannot exceed 120 characters")
    private String city;

    @Positive(message = "categoryId must be greater than 0")
    private Long categoryId;

    private String condition;

    @Min(value = 0, message = "page must be greater than or equal to 0")
    private Integer page = 0;

    @Positive(message = "size must be greater than 0")
    private Integer size = 10;

    private LocalDate startDate;
    private LocalDate endDate;

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

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getCondition() {
        return condition;
    }

    public void setCondition(String condition) {
        this.condition = condition;
    }

    public Integer getPage() {
        return page;
    }

    public void setPage(Integer page) {
        this.page = page;
    }

    public Integer getSize() {
        return size;
    }

    public void setSize(Integer size) {
        this.size = size;
    }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
}
