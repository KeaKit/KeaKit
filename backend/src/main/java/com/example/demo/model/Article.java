package com.example.demo.model;

import java.time.LocalDate;

import jakarta.persistence.*;

@Entity
@Table(name = "articles")
public class Article extends Item {

    private String imageUrl;

    @Enumerated(EnumType.STRING)
    private ArticleStatus status;

    private LocalDate purchaseDate;

    public Article() {}

    public Article(String title, String description, String city, String country, Double pricePerMonth, LocalDate availableFrom, LocalDate availableUntil, String category, User owner, String imageUrl, ArticleStatus status, LocalDate purchaseDate) {
        super(title, description, city, pricePerMonth, availableFrom, availableUntil, category, owner);
        this.imageUrl = imageUrl;
        this.status = status;
        this.purchaseDate = purchaseDate;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public ArticleStatus getStatus() {
        return status;
    }

    public void setStatus(ArticleStatus status) {
        this.status = status;
    }

    public LocalDate getPurchaseDate() {
        return purchaseDate;
    }

    public void setPurchaseDate(LocalDate purchaseDate) {
        this.purchaseDate = purchaseDate;
    }

}