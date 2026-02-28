package com.example.demo.dto;

public class CreatePaymentIntentRequest {

    private Long baseAmount;
    private Long kitId; 

    public Long getBaseAmount() {
        return baseAmount;
    }

    public void setBaseAmount(Long baseAmount) {
        this.baseAmount = baseAmount;
    }

    public Long getKitId() {
        return kitId;
    }

    public void setKitId(Long kitId) {
        this.kitId = kitId;
    }
}
