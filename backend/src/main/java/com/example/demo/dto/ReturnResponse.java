package com.example.demo.dto;

public record ReturnResponse(
    Long articleId,
    String tenantEmail,
    String resolution,
    Double amountProcessed,
    String message,
    Boolean currentUserReceivesMoney,
    Double currentUserAmount,
    String messageType
) {
    public ReturnResponse(
        Long articleId,
        String tenantEmail,
        String resolution,
        Double amountProcessed,
        String message
    ) {
        this(articleId, tenantEmail, resolution, amountProcessed, message, false, 0.0, "INFO");
    }
}
