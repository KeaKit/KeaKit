package com.example.demo.dto;

import java.time.LocalDate;

public record ArticleNearbyDTO(
    Long id,
    String itemType,
    String title,
    String description,
    String city,
    Double pricePerMonth,
    LocalDate availableFrom,
    LocalDate availableUntil,
    String category,
    Integer totalUnits,
    Long ownerId,
    String ownerName,
    String status,
    String imageUrl,
    double cityLat,
    double cityLng,
    double distanceKm
) {}
