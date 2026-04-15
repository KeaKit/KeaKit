package com.example.demo.repository;

import com.example.demo.model.RgpdConsent;
import com.example.demo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RgpdConsentRepository extends JpaRepository<RgpdConsent, Long> {
    Optional<RgpdConsent> findByUser(User user);

    boolean existsByUser(User user);
}