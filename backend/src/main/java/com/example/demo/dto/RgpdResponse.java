package com.example.demo.dto;

public class RgpdResponse {
    private boolean hasAccepted;

    public RgpdResponse(boolean hasAccepted) {
        this.hasAccepted = hasAccepted;
    }

    public boolean isHasAccepted() {
        return hasAccepted;
    }

    public void setHasAccepted(boolean hasAccepted) {
        this.hasAccepted = hasAccepted;
    }
}