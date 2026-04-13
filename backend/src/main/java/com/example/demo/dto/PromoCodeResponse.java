package com.example.demo.dto;

import com.example.demo.model.PromoCode;

import java.util.List;

public class PromoCodeResponse {

    private Long id;
    private String code;
    private Double discountRate;
    private boolean active;
    private boolean singleUse;
    private boolean pilotUserOnly;
    private List<String> pilotEmails;

    public PromoCodeResponse(PromoCode promoCode) {
        this.id = promoCode.getId();
        this.code = promoCode.getCode();
        this.discountRate = promoCode.getDiscountRate();
        this.active = promoCode.isActive();
        this.singleUse = promoCode.isSingleUse();
        this.pilotUserOnly = promoCode.isPilotUserOnly();
        this.pilotEmails = promoCode.getPilotEmails();
    }

    public Long getId() { return id; }
    public String getCode() { return code; }
    public Double getDiscountRate() { return discountRate; }
    public boolean isActive() { return active; }
    public boolean isSingleUse() { return singleUse; }
    public boolean isPilotUserOnly() { return pilotUserOnly; }
    public List<String> getPilotEmails() { return pilotEmails; }
}