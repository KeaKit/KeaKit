package com.example.demo.repository;

import com.example.demo.model.PrivacyPolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PrivacyPolicyRepository extends JpaRepository<PrivacyPolicy, Long> {
    Optional<PrivacyPolicy> findTopByActiveTrueOrderByCreatedAtDesc();
}