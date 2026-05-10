package com.example.demo.dto;

import java.time.LocalDate;

import com.example.demo.model.ServiceStatus;

public record ServiceWithRentalsDTO (
    Long id,
    String title,
    String city,
    Double pricePerMonth,
    ServiceStatus status,
    Integer totalUnits,
    Integer rentedUnitsNow,
    LocalDate availableFrom,
    LocalDate availableUntil
) {}
