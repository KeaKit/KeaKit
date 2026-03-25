package com.example.demo.model;

import java.time.LocalDate;

import jakarta.persistence.*;

@Entity
@Table(name = "services")
public class ServiceItem extends Item {

    @Enumerated(EnumType.STRING)
    private ServiceStatus status;


    public ServiceItem() {}

    public ServiceItem(String title, String description, String city, String country, Double pricePerMonth, LocalDate availableFrom, LocalDate availableUntil, Category category, User owner, ServiceStatus serviceStatus) {
        super(title, description, city, pricePerMonth, availableFrom, availableUntil, category, owner);
        this.status = serviceStatus;
    }


    public ServiceStatus getStatus() {
        return status;
    }

    public void setStatus(ServiceStatus status) {
        this.status = status;
    }

}
