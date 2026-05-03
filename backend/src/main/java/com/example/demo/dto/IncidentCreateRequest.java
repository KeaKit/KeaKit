package com.example.demo.dto;

import com.example.demo.model.IncidentType;

public class IncidentCreateRequest {
    private String title;
    private String description;
    private IncidentType type;
    private Long userId;
    private Long relatedItemId;
    private Long relatedKitId;

    // Getters y Setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public IncidentType getType() { return type; }
    public void setType(IncidentType type) { this.type = type; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getRelatedItemId() { return relatedItemId; }
    public void setRelatedItemId(Long relatedItemId) { this.relatedItemId = relatedItemId; }

    public Long getRelatedKitId() { return relatedKitId; }
    public void setRelatedKitId(Long relatedKitId) { this.relatedKitId = relatedKitId; }
}