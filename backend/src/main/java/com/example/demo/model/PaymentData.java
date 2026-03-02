package com.example.demo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "payment_data")
public class PaymentData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column
    private String stripeCustomerId;  // Para pagos como cliente

    @Column
    private String stripeAccountId;   // Para Stripe Connect (como provider)

    @Column(nullable = false)
    private Boolean isVerified = false;

    @Column
    private String stripeAccountStatus;  // active, restricted, etc.

    @Column
    private String bankAccountToken;

    public PaymentData() {}

    public PaymentData(User user) {
        this.user = user;
        this.isVerified = false;
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

    public String getStripeCustomerId() {
        return stripeCustomerId;
    }

    public void setStripeCustomerId(String stripeCustomerId) {
        this.stripeCustomerId = stripeCustomerId;
    }

    public String getStripeAccountId() {
        return stripeAccountId;
    }

    public void setStripeAccountId(String stripeAccountId) {
        this.stripeAccountId = stripeAccountId;
    }

    public Boolean getIsVerified() {
        return isVerified;
    }

    public void setIsVerified(Boolean isVerified) {
        this.isVerified = isVerified;
    }

    public String getStripeAccountStatus() {
        return stripeAccountStatus;
    }

    public void setStripeAccountStatus(String stripeAccountStatus) {
        this.stripeAccountStatus = stripeAccountStatus;
    }

    public String getBankAccountToken() {
        return bankAccountToken;
    }

    public void setBankAccountToken(String bankAccountToken) {
        this.bankAccountToken = bankAccountToken;
    }
}
