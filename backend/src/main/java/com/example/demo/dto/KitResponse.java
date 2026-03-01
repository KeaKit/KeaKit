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
    public static class KitItemSelectionResponse {
        private Long itemId;
        private Integer quantity;

        public KitItemSelectionResponse(Long itemId, Integer quantity) {
            this.itemId = itemId;
            this.quantity = quantity;
        }

        public Long getItemId() {
            return itemId;
        }

        public Integer getQuantity() {
            return quantity;
        }
    }

    private Long id;
    private String name;
    private String country;
    private String city;
    private LocalDate startDate;
    private LocalDate endDate;
    private KitStatus status;
    private DeliveryMethod deliveryMethod;
    private String meetingPoint;
    private Double courierPrice;
    private Long tenantId;
    private List<Long> itemIds;
    private List<KitItemSelectionResponse> itemSelections;
    private Integer totalSelectedItems;

    public KitResponse(Kit kit) {
        this.id = kit.getId();
        this.name = kit.getName();
        this.country = kit.getCountry();
        this.city = kit.getCity();
        this.startDate = kit.getStartDate();
        this.endDate = kit.getEndDate();
        this.status = kit.getStatus();
        this.deliveryMethod = kit.getDeliveryMethod();
        this.meetingPoint = kit.getMeetingPoint();
        this.courierPrice = kit.getCourierPrice();
        this.tenantId = kit.getTenant() != null ? kit.getTenant().getId() : null;
        List<KitItem> kitItems = kit.getKitItems() != null ? kit.getKitItems() : List.of();

        this.itemSelections = kitItems.stream()
            .filter(kitItem -> kitItem.getItem() != null && kitItem.getItem().getId() != null)
            .map(kitItem -> new KitItemSelectionResponse(kitItem.getItem().getId(), kitItem.getQuantity()))
            .collect(Collectors.toList());

        this.totalSelectedItems = this.itemSelections.stream()
            .map(selection -> selection.getQuantity() != null ? selection.getQuantity() : 0)
            .reduce(0, Integer::sum);

        this.itemIds = this.itemSelections.stream()
            .map(KitItemSelectionResponse::getItemId)
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

    public LocalDate getStartDate() { 
        return startDate; 
    }
    
    public LocalDate getEndDate() { 
        return endDate; 
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

    public List<KitItemSelectionResponse> getItemSelections() {
        return itemSelections;
    }

    public Integer getTotalSelectedItems() {
        return totalSelectedItems;
    }

    public Long getTenantId() { 
        return tenantId; 
    }

}
