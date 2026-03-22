package com.example.demo.dto;

import java.time.LocalDateTime;

import com.example.demo.model.DeliveryStatus;

public class UpdateDeliveryRequest {

    private DeliveryStatus status;
    private LocalDateTime estimatedArrival;
    private String lastLocation;

    public DeliveryStatus getStatus() {
        return status;
    }

    public void setStatus(DeliveryStatus status) {
        this.status = status;
    }

    public LocalDateTime getEstimatedArrival() {
        return estimatedArrival;
    }

    public void setEstimatedArrival(LocalDateTime estimatedArrival) {
        this.estimatedArrival = estimatedArrival;
    }

    public String getLastLocation() {
        return lastLocation;
    }

    public void setLastLocation(String lastLocation) {
        this.lastLocation = lastLocation;
    }
}
