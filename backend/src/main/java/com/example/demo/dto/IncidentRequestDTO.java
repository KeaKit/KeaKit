package com.example.demo.dto;

import com.example.demo.model.IncidentType;

public class IncidentRequestDTO {
    private String title;
    private String description;
    private IncidentType type;
    private EntityIdDTO relatedItem;
    private EntityIdDTO relatedKit;
    private EntityIdDTO user;

    // Getters y Setters
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

    public IncidentType getType() {
        return type;
    }

    public void setType(IncidentType type) {
        this.type = type;
    }

    public EntityIdDTO getRelatedItem() {
        return relatedItem;
    }

    public void setRelatedItem(EntityIdDTO relatedItem) {
        this.relatedItem = relatedItem;
    }

    public EntityIdDTO getRelatedKit() {
        return relatedKit;
    }

    public void setRelatedKit(EntityIdDTO relatedKit) {
        this.relatedKit = relatedKit;
    }

    public EntityIdDTO getUser() {
        return user;
    }

    public void setUser(EntityIdDTO user) {
        this.user = user;
    }
}