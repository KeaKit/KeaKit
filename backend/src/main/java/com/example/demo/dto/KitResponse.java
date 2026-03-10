package com.example.demo.dto;

import com.example.demo.model.Kit;
import com.example.demo.model.KitItem;
import com.example.demo.model.KitStatus;
import com.example.demo.model.DeliveryMethod;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class KitResponse {
    private static final int DELIVERY_LEAD_DAYS = 7;

    public static class KitItemResponse {
        private Long itemId;
        private Integer quantity;
        private Double pricePerMonth;

        public KitItemResponse(Long itemId, Integer quantity, Double pricePerMonth) {
            this.itemId = itemId;
            this.quantity = quantity;
            this.pricePerMonth = pricePerMonth;
        }

        public Long getItemId() {
            return itemId;
        }

        public Integer getQuantity() {
            return quantity;
        }
        public Double getPricePerMonth() {
            return pricePerMonth;
        }
    }

    private Long id;
    private String name;
    private String country;
    private String city;
    private LocalDate orderDate;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate estimatedDeliveryDate;
    private String deliveryNotification;
    private KitStatus status;
    private DeliveryMethod deliveryMethod;
    private String meetingPoint;
    private Double courierPrice;
    private Long tenantId;
    private List<Long> itemIds;
    private List<KitItemResponse> items;
    private Integer totalSelectedItems;

    public KitResponse(Kit kit) {
        this.id = kit.getId();
        this.name = kit.getName();
        this.country = kit.getCountry();
        this.city = kit.getCity();
        this.orderDate = kit.getOrderDate();
        this.startDate = kit.getStartDate();
        this.endDate = kit.getEndDate();
        this.deliveryMethod = kit.getDeliveryMethod();
        this.estimatedDeliveryDate = calculateEstimatedDeliveryDate(this.orderDate, this.startDate);
        this.deliveryNotification = buildDeliveryNotification(this.estimatedDeliveryDate, this.deliveryMethod);
        this.status = kit.getStatus();
        this.meetingPoint = kit.getMeetingPoint();
        this.courierPrice = kit.getCourierPrice();
        this.tenantId = kit.getTenant() != null ? kit.getTenant().getId() : null;
        List<KitItem> kitItems = kit.getKitItems() != null ? kit.getKitItems() : List.of();

        this.items = kitItems.stream()
            .filter(kitItem -> kitItem.getItem() != null && kitItem.getItem().getId() != null)
            .map(kitItem -> new KitItemResponse(kitItem.getItem().getId(), kitItem.getQuantity(), kitItem.getPricePerMonth()))
            .collect(Collectors.toList());

        this.totalSelectedItems = this.items.stream()
            .map(selection -> selection.getQuantity() != null ? selection.getQuantity() : 0)
            .reduce(0, Integer::sum);

        this.itemIds = this.items.stream()
            .map(KitItemResponse::getItemId)
            .distinct()
            .collect(Collectors.toCollection(ArrayList::new));
    }

    public Long getId() {
        return id; 
    }
    public String getName() { 
        return name; 
    }

    public String getCountry() { 
        return country; 
    }

    public String getCity() { 
        return city; 
    }

    public LocalDate getOrderDate() {
        return orderDate;
    }

    public LocalDate getStartDate() { 
        return startDate; 
    }
    
    public LocalDate getEndDate() { 
        return endDate; 
    }

    public LocalDate getEstimatedDeliveryDate() {
        return estimatedDeliveryDate;
    }

    public String getDeliveryNotification() {
        return deliveryNotification;
    }
    
    public KitStatus getStatus() {
        return status;
    }

    public DeliveryMethod getDeliveryMethod() {
        return deliveryMethod;
    }

    public String getMeetingPoint() {
        return meetingPoint;
    }

    public Double getCourierPrice() {
        return courierPrice;
    }

    public List<Long> getItemIds() { 
        return itemIds; 
    }

    public List<KitItemResponse> getItems() {
        return items;
    }

    public Integer getTotalSelectedItems() {
        return totalSelectedItems;
    }

    public Long getTenantId() { 
        return tenantId; 
    }

    private LocalDate calculateEstimatedDeliveryDate(LocalDate orderDate, LocalDate startDate) {
        if (startDate == null) {
            return null;
        }
        if (orderDate == null) {
            return startDate.minusDays(1);
        }

        LocalDate preferredDeliveryDate = startDate.minusDays(1);
        LocalDate minimumLeadDeliveryDate = orderDate.plusDays(DELIVERY_LEAD_DAYS - 1L);

        if (minimumLeadDeliveryDate.isAfter(preferredDeliveryDate)) {
            return minimumLeadDeliveryDate;
        }
        return preferredDeliveryDate;
    }

    private String buildDeliveryNotification(LocalDate estimatedDeliveryDate, DeliveryMethod deliveryMethod) {
        if (estimatedDeliveryDate == null) {
            return null;
        }

        LocalDate today = LocalDate.now();
        String prefix = deliveryMethod == DeliveryMethod.COURIER
            ? "Tu pedido"
            : "Tu kit";

        if (today.isEqual(estimatedDeliveryDate.minusDays(1))) {
            return prefix + " llegará mañana";
        }
        if (today.isEqual(estimatedDeliveryDate)) {
            return prefix + " llega hoy";
        }
        if (today.isAfter(estimatedDeliveryDate)) {
            return prefix + " tenía entrega prevista para el " + estimatedDeliveryDate;
        }
        return prefix + " llegará el " + estimatedDeliveryDate;
    }

}
