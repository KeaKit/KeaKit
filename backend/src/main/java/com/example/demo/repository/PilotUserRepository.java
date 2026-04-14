package com.example.demo.repository;

import com.example.demo.model.PilotUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PilotUserRepository extends JpaRepository<PilotUser, Long> {
    Optional<PilotUser> findByEmailIgnoreCase(String email);
    List<PilotUser> findByActiveTrue();
}