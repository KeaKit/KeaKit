package com.example.demo.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;

public record KitPaymentDTO (
    @NotNull @Min(0) Integer totalPrice,
    @NotNull @Min(0) Integer subtotalPrice,
    @NotNull @Min(0) Integer guarantee,
    @NotNull @Min(0) Integer platformFee,
    @NotNull @Min(0) Integer courierPrice
) {
    
}
