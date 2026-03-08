package com.example.demo.controller;

import com.example.demo.model.Wallet;
import com.example.demo.model.Transaction;
import com.example.demo.dto.TransactionDTO;
import com.example.demo.dto.WalletDTO;
import com.example.demo.service.WalletService;
import com.example.demo.service.AuthService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wallet")
public class WalletController {

    @Autowired
    private WalletService walletService;

    @Autowired
    private AuthService authService;

    @GetMapping("/my-wallet")
    public ResponseEntity<?> getLogedUserWallet() {
        Long userId = authService.getAuthenticatedUserId();
        if (userId == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(authService.createErrorResponse("Usuario no autenticado"));
        }
        Wallet wallet = walletService.getWalletByUserId(userId);
        if (wallet == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(authService.createErrorResponse("Wallet no encontrada para el usuario"));
        }
        WalletDTO walletDTO = toDTO(wallet);

        return ResponseEntity.ok(walletDTO);
    }

    @GetMapping("/my-wallet/transactions")
    public ResponseEntity<?> getLogedUserWalletTransactions() {
        Long userId = authService.getAuthenticatedUserId();
        if (userId == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(authService.createErrorResponse("Usuario no autenticado"));
        }
        List<Transaction> transactions = walletService.getTransactionsForUser(userId);

        if (transactions == null || transactions.isEmpty())
            return ResponseEntity.ok(List.of());

        List<TransactionDTO> transactionDTOs = transactions.stream()
                .map(this::toDTO)
                .toList();
        return ResponseEntity.ok(transactionDTOs);
    }

    // Rutas de administrador para acceder a cualquier wallet y sus transacciones
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getWalletByUserId(@PathVariable Long userId) {

        ResponseEntity<?> accessValidation = authService.validateAccess(userId);
        if (accessValidation != null) {
            return accessValidation;
        }

        Wallet wallet = walletService.getWalletByUserId(userId);
        if (wallet == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(authService.createErrorResponse("Wallet no encontrada para el usuario"));
        }
        WalletDTO walletDTO = toDTO(wallet);
        return ResponseEntity.ok(walletDTO);
    }

    @GetMapping("/user/{userId}/transactions")
    public ResponseEntity<?> getWalletTransactions(@PathVariable Long userId) {

        ResponseEntity<?> accessValidation = authService.validateAccess(userId);
        if (accessValidation != null) {
            return accessValidation;
        }

        List<Transaction> transactions = walletService.getTransactionsForUser(userId);
        if (transactions == null || transactions.isEmpty())
            return ResponseEntity.ok(List.of());
        List<TransactionDTO> transactionDTOs = transactions.stream()
                .map(this::toDTO)
                .toList();
        return ResponseEntity.ok(transactionDTOs);
    }

    private TransactionDTO toDTO(Transaction tx) {
        return new TransactionDTO(
                tx.getId(),
                tx.getAmount(),
                tx.getType(),
                tx.getDestinationWallet().getId(),
                tx.getTimestamp());
    }

    private WalletDTO toDTO(Wallet wallet) {
        return new WalletDTO(
                wallet.getId(),
                wallet.getBalance(),
                wallet.getUser().getId(),
                wallet.getCreatedAt());
    }
}