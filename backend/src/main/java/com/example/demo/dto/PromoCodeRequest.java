package com.example.demo.dto;

import jakarta.validation.constraints.*;
import java.util.List;

public record PromoCodeRequest(
    @NotBlank String code,
    @NotNull @DecimalMin("0.0") @DecimalMax("1.0") Double discountRate,
    boolean active,
    boolean singleUse,
    boolean pilotUserOnly,
    List<@Email(message = "El email '${validatedValue}' no tiene un formato válido") String> pilotEmails
) {}