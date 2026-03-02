package com.example.demo.dto;

import java.time.LocalDate;
import java.util.List;

import com.example.demo.model.DeliveryMethod;
import com.example.demo.model.KitStatus;

public class KitCreateRequest {
    public static class KitItemSelectionRequest {
        private Long itemId;
        private Integer quantity;

        public Long getItemId() {
            return itemId;
        }

        public void setItemId(Long itemId) {
            this.itemId = itemId;
        }

        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }
    }

    private String name;
    private String country;
    private String city;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate arrivalDate;
    private KitStatus status;
    private DeliveryMethod deliveryMethod;
    private String meetingPoint;
    private Long tenantId;
    private List<Long> itemIds;
    private List<KitItemSelectionRequest> itemSelections;

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

    public LocalDate getArrivalDate() {
        return arrivalDate;
    }

    public void setArrivalDate(LocalDate arrivalDate) {
        this.arrivalDate = arrivalDate;
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

    public Long getTenantId() { 
        return tenantId; 
    }

    public void setTenantId(Long tenantId) { 
        this.tenantId = tenantId; 
    }

    public List<Long> getItemIds() { 
        return itemIds; 
    }

    public void setItemIds(List<Long> itemIds) { 
        this.itemIds = itemIds; 
    }

    public List<KitItemSelectionRequest> getItemSelections() {
        return itemSelections;
    }

    public void setItemSelections(List<KitItemSelectionRequest> itemSelections) {
        this.itemSelections = itemSelections;
    }
}

