package com.example.demo.dto;

public class CreatePaymentIntentResponse {
    private String clientSecret;
    private long baseAmount;
    private long depositAmount;
    private long totalAmount;
    private double depositRate;

    public CreatePaymentIntentResponse(
        String clientSecret,
        long baseAmount,
        long depositAmount,
        long totalAmount,
        double depositRate
    ) {
        this.clientSecret = clientSecret;
        this.baseAmount = baseAmount;
        this.depositAmount = depositAmount;
        this.totalAmount = totalAmount;
        this.depositRate = depositRate;
    }

    public String getClientSecret() {
        return clientSecret;
    }

    public long getBaseAmount() {
        return baseAmount;
    }

    public long getDepositAmount() {
        return depositAmount;
    }

    public long getTotalAmount() {
        return totalAmount;
    }

    public double getDepositRate() {
        return depositRate;
    }
}
