package com.example.demo.dto;

public record ReturnResponse(
    Long articleId,
    String tenantEmail,
    String resolution,
    Double amountProcessed,
    String message
) {}