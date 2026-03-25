package com.example.demo.dto;

import java.time.LocalDateTime;

public record WalletDTO(
        Long id,
        Double balance,
        Long userId,
        LocalDateTime createdAt) {

}
