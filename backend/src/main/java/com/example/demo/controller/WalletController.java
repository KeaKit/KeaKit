package com.example.demo.controller;

import com.example.demo.model.Wallet;
import com.example.demo.model.Transaction;
import com.example.demo.dto.TransactionDTO;
import com.example.demo.dto.TransactionWithDetailsDTO;
import com.example.demo.dto.WalletDTO;
import com.example.demo.dto.ErrorResponse;
import com.example.demo.service.WalletService;
import com.example.demo.service.AuthService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.demo.exception.AccessForbiddenException;
import com.example.demo.exception.NotEnoughBalanceException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.exception.UnauthorizedException;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
@RequestMapping("/api/wallet")
public class WalletController {

    @Autowired
    private WalletService walletService;

    @Autowired
    private AuthService authService;

    @GetMapping("/my-wallet")
    public ResponseEntity<?> getLogedUserWallet() throws ResourceNotFoundException, UnauthorizedException {
        Long userId = authService.getAuthenticatedUserId();
        Wallet wallet = walletService.getWalletByUserId(userId);
        WalletDTO walletDTO = toDTO(wallet);
        return ResponseEntity.ok(walletDTO);
    }

    @GetMapping("/my-wallet/transactions")
    public ResponseEntity<List<TransactionDTO>> getLogedUserWalletTransactions()
            throws ResourceNotFoundException, UnauthorizedException {
        Long userId = authService.getAuthenticatedUserId();
        List<Transaction> transactions = walletService.getTransactionsForUser(userId);
        List<TransactionDTO> transactionDTOs = transactions.stream()
                .map(this::toDTO)
                .toList();
        return ResponseEntity.ok(transactionDTOs);
    }

    @GetMapping("/transactions/{transactionId}/details")
    public ResponseEntity<?> getTransactionDetails(@PathVariable Long transactionId)
            throws ResourceNotFoundException, UnauthorizedException {
        Long userId = authService.getAuthenticatedUserId();
        TransactionWithDetailsDTO transactionDetails = walletService.getTransactionWithDetails(transactionId, userId);
        return ResponseEntity.ok(transactionDetails);
    }

    // Rutas de administrador para acceder a cualquier wallet y sus transacciones
    @GetMapping("/user/{userId}")
    public ResponseEntity<WalletDTO> getWalletByUserId(@PathVariable Long userId)
            throws ResourceNotFoundException, UnauthorizedException, AccessForbiddenException {
        authService.validateAccess(userId);
        Wallet wallet = walletService.getWalletByUserId(userId);
        WalletDTO walletDTO = toDTO(wallet);
        return ResponseEntity.ok(walletDTO);
    }

    @GetMapping("/user/{userId}/transactions")
    public ResponseEntity<List<TransactionDTO>> getWalletTransactions(@PathVariable Long userId)
            throws ResourceNotFoundException, UnauthorizedException, AccessForbiddenException {
        authService.validateAccess(userId);
        List<Transaction> transactions = walletService.getTransactionsForUser(userId);
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

    @ExceptionHandler(NotEnoughBalanceException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<ErrorResponse> handleNotEnoughBalance(
            NotEnoughBalanceException ex,
            HttpServletRequest request) {
        
        ErrorResponse error = new ErrorResponse(
            HttpStatus.BAD_REQUEST.value(),
            "Bad Request",
            ex.getMessage(),
            request.getRequestURI()
        );
        
        return ResponseEntity.badRequest().body(error);
    }
}