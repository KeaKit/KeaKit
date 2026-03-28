package com.example.demo.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public class WithdrawRequest {

    @NotBlank(message = "La cuenta bancaria es obligatoria")
    @Pattern(
            regexp = "^[A-Z]{2}\\d{2}[A-Z0-9]{11,30}$",
            message = "La cuenta bancaria debe tener un formato IBAN valido")
    private String bankAccount;

    @NotNull(message = "La cantidad es obligatoria")
    @DecimalMin(value = "0.01", message = "La cantidad debe ser mayor que 0")
    private Double amount;

    public String getBankAccount() {
        return bankAccount;
    }

    public void setBankAccount(String bankAccount) {
        this.bankAccount = bankAccount;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }
}
