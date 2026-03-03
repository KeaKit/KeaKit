package com.example.demo.dto;

import java.time.LocalDate;

public record ArticleReviewDetail(
    Long id,
    String title,
    String imageUrl,
    Double pricePerMonth,
    String status,
    LocalDate rentedUntil,
    String tenantName,
    String tenantEmail
) {}
