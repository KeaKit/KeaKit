package com.example.demo.model;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.*;

@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@Table(name = "items")
public abstract class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    protected String title;

    @Column(nullable = false, length = 1000)
    protected String description;

    protected String city;

    protected Double pricePerMonth;

    protected LocalDate availableFrom;
    protected LocalDate availableUntil;

    @ManyToOne(optional = false)
    @JoinColumn(name = "category", referencedColumnName = "name", nullable = false)
    private Category category;

    @Column
    protected Integer totalUnits = 1;

    @ManyToOne
    @JoinColumn(name = "owner_id")
    protected User owner;

    @OneToMany(mappedBy = "item", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<KitItem> kitItems = new ArrayList<>();

    public Item() {}

    public Item (String title, String description, String city, Double pricePerMonth, LocalDate availableFrom, LocalDate availableUntil, Category category, User owner) {
        this.title = title;
        this.description = description;
        this.city = city;
        this.pricePerMonth = pricePerMonth;
        this.availableFrom = availableFrom;
        this.availableUntil = availableUntil;
        this.category = category;
        this.owner = owner;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public Double getPricePerMonth() {
        return pricePerMonth;
    }

    public void setPricePerMonth(Double pricePerMonth) {
        this.pricePerMonth = pricePerMonth;
    }

    public LocalDate getAvailableFrom() {
        return availableFrom;
    }

    public void setAvailableFrom(LocalDate availableFrom) {
        this.availableFrom = availableFrom;
    }

    public LocalDate getAvailableUntil() {
        return availableUntil;
    }

    public void setAvailableUntil(LocalDate availableUntil) {
        this.availableUntil = availableUntil;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public User getOwner() {
        return owner;
    }

    public void setOwner(User owner) {
        this.owner = owner;
    }

    public Integer getTotalUnits() {
        return totalUnits;
    }

    public void setTotalUnits(Integer totalUnits) {
        this.totalUnits = totalUnits;
    }

    @PrePersist
    @PreUpdate
    public void normalizeTotalUnits() {
        if (totalUnits == null || totalUnits < 1) {
            totalUnits = 1;
        }
    }
}
