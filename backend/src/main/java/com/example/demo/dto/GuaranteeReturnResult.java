package com.example.demo.dto;

import java.util.Collections;
import java.util.Map;

public record GuaranteeReturnResult(
    Double totalProcessed,
    Double tenantRefundAmount,
    Map<Long, Double> ownerPayouts
) {
    public GuaranteeReturnResult {
        totalProcessed = totalProcessed == null ? 0.0 : totalProcessed;
        tenantRefundAmount = tenantRefundAmount == null ? 0.0 : tenantRefundAmount;
        ownerPayouts = ownerPayouts == null ? Collections.emptyMap() : Map.copyOf(ownerPayouts);
    }

    public Double amountForOwner(Long ownerId) {
        if (ownerId == null) {
            return 0.0;
        }
        return ownerPayouts.getOrDefault(ownerId, 0.0);
    }
}
