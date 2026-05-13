package com.example.demo.dto;

import com.example.demo.model.DeliveryMethod;
import com.example.demo.model.KitStatus;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

public record KitCreateRequest(
        @NotBlank 
        @Size(max = 255, message = "El nombre no puede superar los 255 caracteres")
        String name,
        @NotBlank 
        @Size(max = 120, message = "El país no puede superar los 120 caracteres")
        String country,
        @NotBlank 
        @Size(max = 120, message = "La ciudad no puede superar los 120 caracteres")
        String city,
        @NotNull LocalDate startDate,
        @NotNull LocalDate endDate,
        KitStatus status,
        @NotNull DeliveryMethod deliveryMethod,
        @Size(max = 500, message = "El punto de encuentro no puede superar los 500 caracteres")
        String meetingPoint,
        @NotNull Long tenantId,
        List<ItemSelectionRequest> itemSelections) {

    public record ItemSelectionRequest(
            @NotNull Long itemId,
            @NotNull @Min(1) Integer quantity,
            @NotNull Double pricePerMonth) {
    }
    
}