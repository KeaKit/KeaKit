package com.example.demo.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "promo_codes")
public class PromoCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(name = "promo_type")
    private PromoCodeType type = PromoCodeType.TENANT_DISCOUNT;

    private Double discountRate; // 0.0 - 1.0

    private boolean active = true;

    private boolean singleUse = false;

    private boolean pilotUserOnly = false;

    @ElementCollection
    @CollectionTable(name = "promo_code_pilot_emails", joinColumns = @JoinColumn(name = "promo_code_id"))
    @Column(name = "email")
    private List<String> pilotEmails = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "promo_code_used_emails", joinColumns = @JoinColumn(name = "promo_code_id"))
    @Column(name = "email")
    private List<String> usedByEmails = new ArrayList<>();

    public PromoCode() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public PromoCodeType getType() { return type; }
    public void setType(PromoCodeType type) { this.type = type; }

    public Double getDiscountRate() { return discountRate; }
    public void setDiscountRate(Double discountRate) { this.discountRate = discountRate; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public boolean isSingleUse() { return singleUse; }
    public void setSingleUse(boolean singleUse) { this.singleUse = singleUse; }

    public boolean isPilotUserOnly() { return pilotUserOnly; }
    public void setPilotUserOnly(boolean pilotUserOnly) { this.pilotUserOnly = pilotUserOnly; }

    public List<String> getPilotEmails() { return pilotEmails; }
    public void setPilotEmails(List<String> pilotEmails) { this.pilotEmails = pilotEmails; }

    public List<String> getUsedByEmails() { return usedByEmails; }
    public void setUsedByEmails(List<String> usedByEmails) { this.usedByEmails = usedByEmails; }
}