package com.example.demo.model;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

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

    @Enumerated(EnumType.STRING)
    private KitStatus status;

    @Enumerated(EnumType.STRING)
    private DeliveryMethod deliveryMethod;

    private String meetingPoint;

    private Double courierPrice;

    @Column(nullable = false)
    private Double totalPrice = 0.0;

    @Column
    private String stripePaymentIntentId;

    @ManyToOne
    @JoinColumn(name = "owner_id")
    private User owner;

    @ManyToOne
    @JoinColumn(name = "tenant_id")
    private User tenant;

    @OneToMany(mappedBy = "kit", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<KitItem> kitItems = new ArrayList<>();

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

    public User getTenant() {
        return tenant;
    }

    public void setTenant(User tenant) {
        this.tenant = tenant;
    }

    public User getOwner() {
        return owner;
    }

    public void setOwner(User owner) {
        this.owner = owner;
    }

    public void setTotalPrice(Double totalPrice) {
        this.totalPrice = totalPrice;
    }

    public String getStripePaymentIntentId() {
        return stripePaymentIntentId;
    }

    public void setStripePaymentIntentId(String stripePaymentIntentId) {
        this.stripePaymentIntentId = stripePaymentIntentId;
    }

    public List<Item> getItems() {
        List<Item> items = new ArrayList<>();
        for (KitItem kitItem : kitItems) {
            Item item = kitItem.getItem();
            int quantity = kitItem.getQuantity() != null ? kitItem.getQuantity() : 0;
            for (int i = 0; i < quantity; i++) {
                items.add(item);
            }
        }
        return items;
    }

    public void setItems(List<Item> items) {
        Map<Long, Integer> quantitiesByItemId = new LinkedHashMap<>();
        Map<Long, Item> itemById = new LinkedHashMap<>();

        if (items != null) {
            for (Item item : items) {
                if (item == null || item.getId() == null) {
                    continue;
                }
                quantitiesByItemId.put(item.getId(), quantitiesByItemId.getOrDefault(item.getId(), 0) + 1);
                itemById.putIfAbsent(item.getId(), item);
            }
        }

        List<KitItem> nextKitItems = new ArrayList<>();
        for (Map.Entry<Long, Integer> entry : quantitiesByItemId.entrySet()) {
            KitItem kitItem = new KitItem();
            kitItem.setItem(itemById.get(entry.getKey()));
            kitItem.setQuantity(entry.getValue());
            kitItem.setKit(this);
            nextKitItems.add(kitItem);
        }
        this.kitItems = nextKitItems;
    }

    public List<KitItem> getKitItems() {
        return kitItems;
    }

    public void setKitItems(List<KitItem> kitItems) {
        this.kitItems.clear();
        if (kitItems == null) {
            return;
        }
        for (KitItem kitItem : kitItems) {
            if (kitItem == null) {
                continue;
            }
            kitItem.setKit(this);
            this.kitItems.add(kitItem);
        }
    }

@Transient
public Double getTotalPrice() {
    if (this.kitItems == null || this.kitItems.isEmpty()) {
        return 0.0;
    }
    return this.kitItems.stream()
            .filter(ki -> ki.getItem() != null && ki.getItem().getPricePerMonth() != null)
            .mapToDouble(ki -> {
                int qty = ki.getQuantity() != null ? ki.getQuantity() : 0;
                return ki.getItem().getPricePerMonth() * qty;
            })
            .sum();
}

}
