package com.example.demo.dto;

import com.example.demo.model.Kit;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

public class KitResponse {
    private Long id;
    private String name;
    private String country;
    private String city;
    private LocalDate startDate;
    private LocalDate endDate;
    private Long tenantId;
    private List<Long> itemIds;

    public KitResponse(Kit kit) {
        this.id = kit.getId();
        this.name = kit.getName();
        this.country = kit.getCountry();
        this.city = kit.getCity();
        this.startDate = kit.getStartDate();
        this.endDate = kit.getEndDate();
        this.tenantId = kit.getTenant() != null ? kit.getTenant().getId() : null;
        this.itemIds = kit.getItems() != null
            ? kit.getItems().stream().map(item -> item.getId()).collect(Collectors.toList())
            : List.of();
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
    
    public List<Long> getItemIds() { 
        return itemIds; 
    }

    public Long getTenantId() { 
        return tenantId; 
    }

}
