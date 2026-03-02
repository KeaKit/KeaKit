package com.example.demo.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "wallets")
public class Wallet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Double availableBalance = 0.0;

    @Column(nullable = false)
    private Double pendingBalance = 0.0;

    @Column(nullable = false)
    private String currency = "EUR";

    @OneToMany(mappedBy = "wallet", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WalletTransaction> transactions = new ArrayList<>();

    public Wallet() {}

    public Wallet(User user) {
        this.user = user;
        this.availableBalance = 0.0;
        this.pendingBalance = 0.0;
        this.currency = "EUR";
    }

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Double getAvailableBalance() {
        return availableBalance;
    }

    public void setAvailableBalance(Double availableBalance) {
        this.availableBalance = availableBalance;
    }

    public Double getPendingBalance() {
        return pendingBalance;
    }

    public void setPendingBalance(Double pendingBalance) {
        this.pendingBalance = pendingBalance;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public List<WalletTransaction> getTransactions() {
        return transactions;
    }

    public void setTransactions(List<WalletTransaction> transactions) {
        this.transactions = transactions;
    }

    public void addTransaction(WalletTransaction transaction) {
        this.transactions.add(transaction);
        transaction.setWallet(this);
    }

    public void addBalance(Double amount) {
        this.availableBalance = Math.max(0, this.availableBalance + amount);
    }

    public void subtractBalance(Double amount) {
        this.availableBalance = Math.max(0, this.availableBalance - amount);
    }
}
