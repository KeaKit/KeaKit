package com.example.demo.repository;

import com.example.demo.model.PaymentData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentDataRepository extends JpaRepository<PaymentData, Long> {
    Optional<PaymentData> findByUserId(Long userId);
    Optional<PaymentData> findByStripeAccountId(String stripeAccountId);
    Optional<PaymentData> findByStripeCustomerId(String stripeCustomerId);
}
