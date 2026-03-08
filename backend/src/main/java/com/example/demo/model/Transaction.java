package com.example.demo.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.*;

@Entity
@Table(name = "transactions")
@EntityListeners(AuditingEntityListener.class)
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Double amount;

    @ManyToOne
    @JoinColumn(name = "wallet_id", nullable = false)
    private Wallet destinationWallet;

    @Enumerated(EnumType.STRING)
    private TransactionType type;

    @Column(nullable = false)
    @CreatedDate
    private LocalDateTime timestamp;

    public Transaction() {
    }

    public Transaction(Double amount, String currency, Wallet destinationWallet, TransactionType type) {
        this.amount = amount;
        this.destinationWallet = destinationWallet;
        this.type = type;
        this.timestamp = LocalDateTime.now();
    }

    // Getters y setters
    public Long getId() {
        return id;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public Wallet getDestinationWallet() {
        return destinationWallet;
    }

    public void setDestinationWallet(Wallet destinationWallet) {
        this.destinationWallet = destinationWallet;
    }

    public TransactionType getType() {
        return type;
    }

    public void setType(TransactionType type) {
        this.type = type;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }
}
