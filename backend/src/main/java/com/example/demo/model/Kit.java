package com.example.demo.model;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import jakarta.persistence.*;

@Entity
@Table(name = "kits")
public class Kit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String country;
    private String city;

    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate orderDate;

    @Enumerated(EnumType.STRING)
    private KitStatus status;

    @Enumerated(EnumType.STRING)
    private DeliveryMethod deliveryMethod;

    @Column(length = 500)
    private String meetingPoint;

    private Double courierPrice;

    private Double appliedCommissionRate;

    private Double appliedGuaranteeRate;

    private Double appliedDiscount = 0.0;

    @ManyToOne
    @JoinColumn(name = "tenant_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User tenant;

    @OneToMany(mappedBy = "kit", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemMemento> snapshots = new ArrayList<>();

    public Kit() {}

    public Kit(String name, String country, String city, LocalDate startDate, LocalDate endDate, User tenant, KitStatus status) {
        this.name = name;
        this.country = country;
        this.city = city;
        this.startDate = startDate;
        this.endDate = endDate;
        this.tenant = tenant;
        this.status = status;
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

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public LocalDate getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(LocalDate orderDate) {
        this.orderDate = orderDate;
    }

    public KitStatus getStatus() {
        return status;
    }

    public void setStatus(KitStatus status) {
        this.status = status;
    }

    public DeliveryMethod getDeliveryMethod() {
        return deliveryMethod;
    }

    public void setDeliveryMethod(DeliveryMethod deliveryMethod) {
        this.deliveryMethod = deliveryMethod;
    }

    public String getMeetingPoint() {
        return meetingPoint;
    }

    public void setMeetingPoint(String meetingPoint) {
        this.meetingPoint = meetingPoint;
    }

    public Double getCourierPrice() {
        return courierPrice;
    }

    public void setCourierPrice(Double courierPrice) {
        this.courierPrice = courierPrice;
    }

    public Double getAppliedCommissionRate() {
        return appliedCommissionRate;
    }

    public void setAppliedCommissionRate(Double appliedCommissionRate) {
        this.appliedCommissionRate = appliedCommissionRate;
    }

    public Double getAppliedGuaranteeRate() {
        return appliedGuaranteeRate;
    }

    public void setAppliedGuaranteeRate(Double appliedGuaranteeRate) {
        this.appliedGuaranteeRate = appliedGuaranteeRate;
    }

    public User getTenant() {
        return tenant;
    }

    public void setTenant(User tenant) {
        this.tenant = tenant;
    }

    public List<ItemMemento> getSnapshots() {
        return snapshots;
    }

    public void setSnapshots(List<ItemMemento> snapshots) {
        this.snapshots.clear();
        if (snapshots == null) {
            return;
        }
        for (ItemMemento snapshot : snapshots) {
            if (snapshot == null) {
                continue;
            }
            snapshot.setKit(this);
            this.snapshots.add(snapshot);
        }
    }

    public Double getAppliedDiscount() { 
        return appliedDiscount; 
    }

    public void setAppliedDiscount(Double appliedDiscount) { 
        this.appliedDiscount = appliedDiscount != null ? appliedDiscount : 0.0; 
    }

    @Transient
    public Double calculateSubtotal() {
        if (this.snapshots == null || this.snapshots.isEmpty()) {
            return 0.0;
        }
        double months = calculateMonthsFactor();
        return this.snapshots.stream()
                .filter(s -> s.getPriceAtRental() != null && s.getSelectedUnits() != null)
                .mapToDouble(s -> s.getPriceAtRental() * s.getSelectedUnits() * months)
                .sum();
    }

    @Transient
    private double calculateMonthsFactor() {
        if (this.startDate == null || this.endDate == null) {
            return 1.0;
        }
        long diffDays = java.time.temporal.ChronoUnit.DAYS.between(this.startDate, this.endDate) + 1;
        return diffDays / 30.0;
    }

    @Transient
    public Double calculateTotalGuarantee() {
        double rate = this.appliedGuaranteeRate != null ? this.appliedGuaranteeRate : 0.0;
        return calculateSubtotal() * rate;
    }

    @Transient
    public Double calculatePlatformFee() {
        double rate = this.appliedCommissionRate != null ? this.appliedCommissionRate : 0.0;
        return calculateSubtotal() * rate;
    }

    @Transient
    public Double calculateTotal() {
        double courier = this.courierPrice != null ? this.courierPrice : 0.0;
        double rate = this.appliedDiscount != null ? this.appliedDiscount : 0.0;
        double discount = calculateSubtotal() * rate;        
        return calculateSubtotal() + calculateTotalGuarantee() + courier - discount;
    }

    @Transient
    public Double calculateOwnerPayout(ItemMemento snapshot) {
        if (snapshot == null || snapshot.getPriceAtRental() == null || snapshot.getSelectedUnits() == null) {
            return 0.0;
        }
        double rate = this.appliedCommissionRate != null ? this.appliedCommissionRate : 0.0;
        double gross = snapshot.getPriceAtRental() * snapshot.getSelectedUnits();
        return gross * (1.0 - rate);
    }

    public void processPayments() {
        // Payments are handled by KitService to keep side effects out of the entity.
    }
}
