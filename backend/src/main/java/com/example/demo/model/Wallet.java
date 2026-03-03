package com.example.demo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "wallets")
public class Wallet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Double availableBalance = 0.0;

    @Column(nullable = false)
    private Double pendingBalance = 0.0;

    @Column(nullable = false)
    private String currency = "EUR";

    @OneToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    public Wallet() {}

    public Wallet(User user) {
        this.user = user;
        this.availableBalance = 0.0;
        this.pendingBalance = 0.0;
        this.currency = "EUR";
    }

    // Getters y setters
    public Long getId() { return id; }
    public Double getAvailableBalance() { return availableBalance; }
    public void setAvailableBalance(Double availableBalance) { this.availableBalance = availableBalance; }
    public Double getPendingBalance() { return pendingBalance; }
    public void setPendingBalance(Double pendingBalance) { this.pendingBalance = pendingBalance; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}