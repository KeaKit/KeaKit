package com.example.demo.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record WithdrawalRequest(
        @NotBlank(message = "La cuenta bancaria es obligatoria")
        @Pattern(regexp = "^[A-Z]{2}[0-9A-Z]{13,32}$", message = "La cuenta bancaria no tiene un formato válido")
        String bankAccount,

        @NotNull(message = "La cantidad es obligatoria")
        @DecimalMin(value = "0.01", message = "La cantidad debe ser mayor que 0")
        Double amount) {
}