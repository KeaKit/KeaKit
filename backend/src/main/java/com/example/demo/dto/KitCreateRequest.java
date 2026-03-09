package com.example.demo.dto;

import com.example.demo.model.DeliveryMethod;
import com.example.demo.model.KitStatus;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public record KitCreateRequest(
        @NotBlank String name,
        @NotBlank String country,
        @NotBlank String city,
        @NotNull LocalDate startDate,
        @NotNull LocalDate endDate,
        KitStatus status,
        @NotNull DeliveryMethod deliveryMethod,
        String meetingPoint,
        @NotNull Long tenantId,
        @NotEmpty List<ItemSelectionRequest> itemSelections) {

    public record ItemSelectionRequest(
            @NotNull Long itemId,
            @NotNull @Min(1) Integer quantity,
            @NotNull Double pricePerMonth) {
    }
    
}