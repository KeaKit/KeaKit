package com.example.demo.dto;

import java.time.LocalDate;

public record UserArticle(
    Long id,
    String title,
    String imageUrl,
    Double pricePerMonth,
    String status,         // Ejemplo: "AVAILABLE", "RENTED"
    LocalDate rentedUntil,  // Si status es RENTED, tendrá la fecha. Si no, será null.
    String ownerCommissionPromoCode
) {}
