package com.example.demo.repository;

import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.model.Transaction;
import com.example.demo.model.TransactionType;
import com.example.demo.model.Wallet;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByDestinationWallet(Wallet destinationWallet);

    List<Transaction> findByDestinationWalletIdOrderByTimestampDesc(Long destinationWalletId);

    List<Transaction> findByRelatedKitIdAndType(Long relatedKitId, TransactionType type);
}
