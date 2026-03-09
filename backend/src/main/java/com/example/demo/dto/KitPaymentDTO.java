package com.example.demo.dto;

public record KitPaymentDTO (
    Double totalPrice,
    Double subtotalPrice,
    Double guarantee,
    Double fee,
    Double courierPrice
) {
    
}
