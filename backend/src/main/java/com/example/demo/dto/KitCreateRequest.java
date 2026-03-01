package com.example.demo.dto;

import java.time.LocalDate;
import java.util.List;

import com.example.demo.model.DeliveryMethod;
import com.example.demo.model.KitStatus;

public class KitCreateRequest {
    private String name;
    private String country;
    private String city;
    private LocalDate startDate;
    private LocalDate endDate;
    private KitStatus status;
    private DeliveryMethod deliveryMethod;
    private String meetingPoint;
    private Long tenantId;
    private List<Long> itemIds;

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
}

