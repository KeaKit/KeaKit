package com.example.demo.service;

import com.example.demo.dto.WithdrawalRequest;
import com.example.demo.exception.NotEnoughBalanceException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.model.Transaction;
import com.example.demo.model.TransactionType;
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

    public Wallet getWalletByUserId(Long userId) throws ResourceNotFoundException {
        return walletRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found for user: " + userId));
    }

    public List<Transaction> getTransactionsForUser(Long userId) throws ResourceNotFoundException {
        Wallet wallet = getWalletByUserId(userId);
        return transactionRepository.findByDestinationWalletIdOrderByTimestampDesc(wallet.getId());
    }

    public Transaction withdrawFromWallet(Long userId, WithdrawalRequest request)
            throws ResourceNotFoundException, NotEnoughBalanceException {
        Wallet wallet = getWalletByUserId(userId);
        Double amount = request.amount();

        if (wallet.getBalance() < amount) {
            throw new NotEnoughBalanceException(
                    "Saldo insuficiente para retirar " + amount + " EUR. Saldo disponible: " + wallet.getBalance());
        }

        Transaction withdrawal = new Transaction(-amount, wallet, TransactionType.WITHDRAWAL);
        return transactionRepository.save(withdrawal);
    }
}