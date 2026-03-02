package com.example.demo.dto;

import jakarta.validation.constraints.NotNull;

public class PaymentRequest {
    @NotNull(message = "Kit ID es requerido")
    private Long kitId;

    @NotNull(message = "Tenant ID es requerido")
    private Long tenantId;

    private String paymentMethodId;  // Para Stripe (o paymentIntentId después de crear)

    public PaymentRequest() {}

    public PaymentRequest(Long kitId, Long tenantId) {
        this.kitId = kitId;
        this.tenantId = tenantId;
    }

    public PaymentRequest(Long kitId, Long tenantId, String paymentMethodId) {
        this.kitId = kitId;
        this.tenantId = tenantId;
        this.paymentMethodId = paymentMethodId;
    }

    public Long getKitId() {
        return kitId;
    }

    public void setKitId(Long kitId) {
        this.kitId = kitId;
    }

    public Long getTenantId() {
        return tenantId;
    }

    public void setTenantId(Long tenantId) {
        this.tenantId = tenantId;
    }

    public String getPaymentMethodId() {
        return paymentMethodId;
    }

    public void setPaymentMethodId(String paymentMethodId) {
        this.paymentMethodId = paymentMethodId;
    }
}
