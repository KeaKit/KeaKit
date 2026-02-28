package com.example.demo.model;

import java.time.LocalDate;

import jakarta.persistence.*;

@Entity
@Table(name = "services")
public class Service extends Item {

    public Service() {}

    public Service(String title, String description, String city, String country, Double pricePerMonth, LocalDate availableFrom, LocalDate availableUntil, String category, User owner) {
        super(title, description, city, pricePerMonth, availableFrom, availableUntil, category, owner);
    }

}
