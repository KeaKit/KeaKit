package com.example.demo.repository;

import com.example.demo.model.Wallet;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, Long> {
    Optional<Wallet> findByUserId(Long userId);
    // void deleteByUserId(Long userId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Wallet w WHERE w.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);
}