package com.example.demo.dto;

public class PromoCodeValidationResponse {

    private boolean valid;
    private Double discountRate;
    private String message;

    public PromoCodeValidationResponse(boolean valid, Double discountRate, String message) {
        this.valid = valid;
        this.discountRate = discountRate;
        this.message = message;
    }

    public boolean isValid() { return valid; }
    public Double getDiscountRate() { return discountRate; }
    public String getMessage() { return message; }
}