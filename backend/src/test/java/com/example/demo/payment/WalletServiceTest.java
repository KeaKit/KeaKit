package com.example.demo.payment;

import java.util.Optional;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

import com.example.demo.TestDataFactory;

import com.example.demo.repository.WalletRepository;
import com.example.demo.repository.TransactionRepository;
import com.example.demo.service.WalletService;
import com.example.demo.model.Wallet;
import com.example.demo.model.User;
import com.example.demo.model.Transaction;
import com.example.demo.model.TransactionType;

import com.example.demo.exception.ResourceNotFoundException;


@ExtendWith(MockitoExtension.class)
public class WalletServiceTest {

    @Mock
    private WalletRepository walletRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @InjectMocks
    private WalletService walletService;

    // Datos de prueba
    private final User USER = TestDataFactory.createMockTenantUser();
    private final Wallet EMPTY_WALLET = TestDataFactory.createMockWallet(0L, USER, 0.0);
    private final Wallet WALLET_WITH_TRANSACTIONS = TestDataFactory.createMockWallet(0L, USER, null); // balance se calculará a partir de las transacciones
    private final Long NONEXISTING_USER_ID = 999L;
    private final Transaction TRANSACTION_1 = TestDataFactory.createMockTransaction(1L, WALLET_WITH_TRANSACTIONS, 100.0, TransactionType.PAYOUT);
    private final Transaction TRANSACTION_2 = TestDataFactory.createMockTransaction(2L, WALLET_WITH_TRANSACTIONS, 50.0, TransactionType.PAYOUT);
    

    @Test
    void getWalletByUserId_ShouldReturnWallet_IfWalletExists() {
        when(walletRepository.findByUserId(USER.getId())).thenReturn(Optional.of(EMPTY_WALLET));

        Wallet wallet = walletService.getWalletByUserId(USER.getId());

        assertNotNull(wallet);
        assertEquals(wallet.getUser().getEmail(), USER.getEmail());
    }

    @Test
    void getWalletByUserId_BalanceShouldBeZero_IfWalletIsNew() {
        when(walletRepository.findByUserId(USER.getId())).thenReturn(Optional.of(EMPTY_WALLET));

        Wallet wallet = walletService.getWalletByUserId(USER.getId());

        assertEquals(0.0, wallet.getBalance());
    }

    @Test
    void getWalletByUserId_ShouldThrowException_IfUserDoesNotExist() {
        when(walletRepository.findByUserId(NONEXISTING_USER_ID)).thenReturn(Optional.empty());

        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            walletService.getWalletByUserId(NONEXISTING_USER_ID);
        });

        assertTrue(exception.getMessage().contains("Wallet not found"));
    }

    @Test
    void getTransactionsForUser_ShouldReturnTransactions_IfWalletHasTransactions() {
        when(walletRepository.findByUserId(USER.getId())).thenReturn(Optional.of(WALLET_WITH_TRANSACTIONS));
        when(transactionRepository.findByDestinationWalletIdOrderByTimestampDesc(WALLET_WITH_TRANSACTIONS.getId()))
            .thenReturn(List.of(TRANSACTION_1, TRANSACTION_2));

        List<Transaction> transactions = walletService.getTransactionsForUser(USER.getId());
        assertNotNull(transactions);
        assertEquals(2, transactions.size());
        Double tx1Amount = TRANSACTION_1.getAmount();
        Double tx2Amount = TRANSACTION_2.getAmount();
        assertEquals(tx1Amount, transactions.get(0).getAmount());
        assertEquals(tx2Amount, transactions.get(1).getAmount());
        Double expectedBalance = tx1Amount + tx2Amount;
        assertEquals(expectedBalance, WALLET_WITH_TRANSACTIONS.getBalance());
    }

    @Test
    void getTransactionsForUser_ShouldReturnEmptyList_IfWalletHasNoTransactions() {
        when(walletRepository.findByUserId(USER.getId())).thenReturn(Optional.of(EMPTY_WALLET));
        when(transactionRepository.findByDestinationWalletIdOrderByTimestampDesc(EMPTY_WALLET.getId()))
            .thenReturn(List.of());
        
        List<Transaction> transactions = walletService.getTransactionsForUser(USER.getId());
        assertNotNull(transactions);
        assertTrue(transactions.isEmpty());
    }

    // TODO: Tests para updateWalletBalance, incluyendo casos de éxito y casos de error (saldo insuficiente, monto negativo, etc.)
    
}
