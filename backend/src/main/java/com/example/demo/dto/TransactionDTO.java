package com.example.demo.dto;

import java.time.LocalDateTime;
import com.example.demo.model.TransactionType;
import com.example.demo.model.PayoutSubtype;

public record TransactionDTO(
        Long id,
        Double amount,
        TransactionType type,
        Long walletId,
        LocalDateTime timestamp,
        String description,
        PayoutSubtype payoutSubtype
) {
}