package com.example.demo.dto;

import com.example.demo.model.PromoCodeType;
import jakarta.validation.constraints.*;
import java.util.List;

public record PromoCodeRequest(
    @NotBlank
    @Size(max = 10, message = "El código promocional no puede superar 10 caracteres")
    String code,

    @NotNull
    @DecimalMin(value = "0.01", message = "El descuento debe ser al menos de un 1%")
    @DecimalMax(value = "1.0", message = "El descuento no puede superar el 100%")
    Double discountRate,

    boolean active,

    boolean singleUse,

    PromoCodeType type,

    boolean pilotUserOnly,

    List<@Email(message = "El email '${validatedValue}' no tiene un formato válido") String> pilotEmails
) {}