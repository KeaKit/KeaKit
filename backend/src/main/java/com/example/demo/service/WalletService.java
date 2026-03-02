package com.example.demo.service;

import com.example.demo.model.Wallet;
import com.example.demo.repository.WalletRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class WalletService {

    @Autowired
    private WalletRepository walletRepository;
    public Wallet getWalletByUserId(Long userId) {
        Wallet wallet = walletRepository.findByUserId(userId);
        if (wallet == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Wallet not found for user with id: " + userId);
        }
        return wallet;
    }
}