package com.example.demo.dto;

import java.time.LocalDateTime;

import com.example.demo.model.DeliveryStatus;
import com.example.demo.model.KitDelivery;
import com.example.demo.model.User;

public class KitDeliveryResponse {

    private Long kitId;
    private DeliveryStatus status;
    private LocalDateTime estimatedArrival;
    private String lastLocation;
    private LocalDateTime lastUpdate;
    private Long courierId;
    private String courierName;

    public KitDeliveryResponse(KitDelivery delivery) {
        this.kitId = delivery.getKit() != null ? delivery.getKit().getId() : null;
        this.status = delivery.getStatus();
        this.estimatedArrival = delivery.getEstimatedArrival();
        this.lastLocation = delivery.getLastLocation();
        this.lastUpdate = delivery.getLastUpdate();

        User courier = delivery.getAssignedCourier();
        this.courierId = courier != null ? courier.getId() : null;
        this.courierName = courier != null ? courier.getName() : null;
    }

    public Long getKitId() {
        return kitId;
    }

    public DeliveryStatus getStatus() {
        return status;
    }

    public LocalDateTime getEstimatedArrival() {
        return estimatedArrival;
    }

    public String getLastLocation() {
        return lastLocation;
    }

    public LocalDateTime getLastUpdate() {
        return lastUpdate;
    }

    public Long getCourierId() {
        return courierId;
    }

    public String getCourierName() {
        return courierName;
    }
}
