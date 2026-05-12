package com.example.demo.dto;

import com.example.demo.model.Transaction;
import com.example.demo.model.TransactionType;
import java.time.LocalDateTime;

public class TransactionWithDetailsDTO {
    private Long id;
    private Double amount;
    private TransactionType type;
    private Long walletId;
    private LocalDateTime createdAt;
    private TransactionDetailsDTO details;

    public TransactionWithDetailsDTO(Transaction tx) {
        this.id = tx.getId();
        this.amount = tx.getAmount();
        this.type = tx.getType();
        this.walletId = tx.getDestinationWallet().getId();
        this.createdAt = tx.getTimestamp();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public TransactionType getType() { return type; }
    public void setType(TransactionType type) { this.type = type; }

    public Long getWalletId() { return walletId; }
    public void setWalletId(Long walletId) { this.walletId = walletId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public TransactionDetailsDTO getDetails() { return details; }
    public void setDetails(TransactionDetailsDTO details) { this.details = details; }
}