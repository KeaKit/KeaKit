package com.example.demo.service;

import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.model.User;
import com.example.demo.model.Transaction;
import com.example.demo.model.Wallet;
import com.example.demo.repository.TransactionRepository;
import com.example.demo.repository.WalletRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WalletService {

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    public void createWalletForUser(User user) {
        Wallet wallet = new Wallet(user);
        walletRepository.save(wallet);
    }

    public Wallet getWalletByUserId(Long userId) {
        return walletRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found for user: " + userId));
    }

    public List<Transaction> getTransactionsForUser(Long userId) {
        Wallet wallet = getWalletByUserId(userId);
        return transactionRepository.findByDestinationWalletIdOrderByTimestampDesc(wallet.getId());
    }
}