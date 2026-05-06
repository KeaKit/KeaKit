package com.example.demo.model;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import jakarta.persistence.*;

@Entity
@Table(name = "item_mementos")
public class ItemMemento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "kit_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Kit kit;

    @Column(nullable = false)
    private Integer selectedUnits = 1;

    @Column(nullable = false)
    private Long originalItemId;

    @Column(nullable = false)
    private String nameAtRental;

    @Column(nullable = false)
    private Double priceAtRental;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User ownerAtRental;

    @Enumerated(EnumType.STRING)
    private DeliveryMethod selectedMethod;

    private Double shippingFeeAtRental;

    @Column(length = 500)
    private String pickupAddressSnapshot;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Category categoryAtRental;

    private String imageUrlAtRental;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Kit getKit() {
        return kit;
    }

    public void setKit(Kit kit) {
        this.kit = kit;
    }

    public Integer getSelectedUnits() {
        return selectedUnits;
    }

    public void setSelectedUnits(Integer selectedUnits) {
        this.selectedUnits = selectedUnits;
    }

    public Long getOriginalItemId() {
        return originalItemId;
    }

    public void setOriginalItemId(Long originalItemId) {
        this.originalItemId = originalItemId;
    }

    public String getNameAtRental() {
        return nameAtRental;
    }

    public void setNameAtRental(String nameAtRental) {
        this.nameAtRental = nameAtRental;
    }

    public Double getPriceAtRental() {
        return priceAtRental;
    }

    public void setPriceAtRental(Double priceAtRental) {
        this.priceAtRental = priceAtRental;
    }

    public User getOwnerAtRental() {
        return ownerAtRental;
    }

    public void setOwnerAtRental(User ownerAtRental) {
        this.ownerAtRental = ownerAtRental;
    }

    public DeliveryMethod getSelectedMethod() {
        return selectedMethod;
    }

    public void setSelectedMethod(DeliveryMethod selectedMethod) {
        this.selectedMethod = selectedMethod;
    }

    public Double getShippingFeeAtRental() {
        return shippingFeeAtRental;
    }

    public void setShippingFeeAtRental(Double shippingFeeAtRental) {
        this.shippingFeeAtRental = shippingFeeAtRental;
    }

    public String getPickupAddressSnapshot() {
        return pickupAddressSnapshot;
    }

    public void setPickupAddressSnapshot(String pickupAddressSnapshot) {
        this.pickupAddressSnapshot = pickupAddressSnapshot;
    }

    public Category getCategoryAtRental() {
        return categoryAtRental;
    }

    public void setCategoryAtRental(Category categoryAtRental) {
        this.categoryAtRental = categoryAtRental;
    }

    public String getImageUrlAtRental() {
        return imageUrlAtRental;
    }

    public void setImageUrlAtRental(String imageUrlAtRental) {
        this.imageUrlAtRental = imageUrlAtRental;
    }

}
