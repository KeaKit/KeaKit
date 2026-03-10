package com.example.demo.dto;

import com.example.demo.model.TransactionType;
import java.time.LocalDateTime;

public record TransactionDTO(
                Long id,
                Double amount,
                TransactionType type,
                Long walletId,
                LocalDateTime createdAt) {

}
