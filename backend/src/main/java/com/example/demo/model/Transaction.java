package com.example.demo.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Double amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType type;

    @ManyToOne
    @JoinColumn(name = "wallet_id", nullable = false)
    private Wallet destinationWallet;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @ManyToOne
    @JoinColumn(name = "kit_id")
    private Kit relatedKit;

    @Column(length = 500)
    private String description;

    @Column(nullable = true)
    @Enumerated(EnumType.STRING)
    private PayoutSubtype payoutSubtype;

    public Transaction() {
        this.timestamp = LocalDateTime.now();
    }

    public Transaction(Double amount, Wallet wallet, TransactionType type) {
        this.amount = amount;
        this.destinationWallet = wallet;
        this.type = type;
        this.timestamp = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public TransactionType getType() { return type; }
    public void setType(TransactionType type) { this.type = type; }

    public Wallet getDestinationWallet() { return destinationWallet; }
    public void setDestinationWallet(Wallet destinationWallet) { this.destinationWallet = destinationWallet; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public Kit getRelatedKit() { return relatedKit; }
    public void setRelatedKit(Kit relatedKit) { this.relatedKit = relatedKit; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public PayoutSubtype getPayoutSubtype() { return payoutSubtype; }
    public void setPayoutSubtype(PayoutSubtype payoutSubtype) { this.payoutSubtype = payoutSubtype; }
}