package com.example.demo.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public record PlatformConfigRequest(
    @NotNull
    @DecimalMin("0.0") @DecimalMax("1.0")
    Double commissionRate
) {}