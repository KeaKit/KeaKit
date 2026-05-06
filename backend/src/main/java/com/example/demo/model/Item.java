package com.example.demo.model;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@Table(name = "items")
public abstract class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 255)
    @Column(nullable = false)
    protected String title;

    @NotBlank
    @Size(max = 1000)
    @Column(nullable = false, length = 1000)
    protected String description;

    @NotBlank
    @Size(max = 120)
    protected String city;

    @Size(max = 120)
    protected String country;

    @NotNull
    @Min(0)
    protected Double pricePerMonth;

    protected LocalDate availableFrom;
    protected LocalDate availableUntil;

    @ManyToOne(optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Category category;

    @NotNull
    @Positive
    @Column
    protected Integer totalUnits = 1;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "item_allowed_methods", joinColumns = @JoinColumn(name = "item_id"))
    @Column(name = "method", nullable = false)
    @Enumerated(EnumType.STRING)
    protected List<DeliveryMethod> allowedMethods = new ArrayList<>();

    @Column(nullable = false)
    protected boolean allowMonthFractions = false;

    @ManyToOne
    @JoinColumn(name = "owner_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    protected User owner;

    @Column(name = "owner_commission_promo_code", length = 80)
    protected String ownerCommissionPromoCode;

    @Column(name = "owner_commission_promo_consumed", nullable = false)
    protected boolean ownerCommissionPromoConsumed = false;

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

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
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

    public String getOwnerCommissionPromoCode() {
        return ownerCommissionPromoCode;
    }

    public void setOwnerCommissionPromoCode(String ownerCommissionPromoCode) {
        this.ownerCommissionPromoCode = ownerCommissionPromoCode;
    }

    public boolean isOwnerCommissionPromoConsumed() {
        return ownerCommissionPromoConsumed;
    }

    public void setOwnerCommissionPromoConsumed(boolean ownerCommissionPromoConsumed) {
        this.ownerCommissionPromoConsumed = ownerCommissionPromoConsumed;
    }

    public Integer getTotalUnits() {
        return totalUnits;
    }

    public void setTotalUnits(Integer totalUnits) {
        this.totalUnits = totalUnits;
    }

    public List<DeliveryMethod> getAllowedMethods() {
        return allowedMethods;
    }

    public void setAllowedMethods(List<DeliveryMethod> allowedMethods) {
        this.allowedMethods = allowedMethods != null ? allowedMethods : new ArrayList<>();
    }

    public boolean isAllowMonthFractions() {
        return allowMonthFractions;
    }

    public void setAllowMonthFractions(boolean allowMonthFractions) {
        this.allowMonthFractions = allowMonthFractions;
    }

    public ItemMemento createSnapshot(Integer selectedUnits, DeliveryMethod selectedMethod, Double shippingFeeAtRental, String pickupAddressSnapshot) {
        ItemMemento snapshot = new ItemMemento();
        snapshot.setOriginalItemId(this.id);
        snapshot.setSelectedUnits(selectedUnits != null ? selectedUnits : 1);
        snapshot.setNameAtRental(this.title);
        snapshot.setPriceAtRental(this.pricePerMonth);
        snapshot.setOwnerAtRental(this.owner);
        snapshot.setSelectedMethod(selectedMethod);
        snapshot.setShippingFeeAtRental(shippingFeeAtRental);
        snapshot.setPickupAddressSnapshot(pickupAddressSnapshot);
        snapshot.setCategoryAtRental(this.category);
        if (this instanceof Article) {
            snapshot.setImageUrlAtRental(((Article) this).getImageUrl());
        }
        return snapshot;
    }

    @PrePersist
    @PreUpdate
    public void normalizeTotalUnits() {
        if (totalUnits == null || totalUnits < 1) {
            totalUnits = 1;
        }
    }
}
