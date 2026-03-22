package com.example.demo.payment;

import java.util.Optional;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

import com.example.demo.repository.WalletRepository;
import com.example.demo.repository.TransactionRepository;
import com.example.demo.service.WalletService;
import com.example.demo.model.Wallet;
import com.example.demo.model.User;
import com.example.demo.model.UserRole;
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
    private User user;
    private Wallet emptyWallet;
    private Wallet walletWithTransactions;
    private Long nonexistingUserId;
    private Transaction transaction1;
    private Transaction transaction2;

    @BeforeEach
    void setUp() {
        nonexistingUserId = 999L;
        user = new User(
            "tenant@example.com",
            "password123",
            "Lucía Renter",
            UserRole.USER,
            "223456789",
            "Calle Manzana, 4",
            "Sevilla",
            "España"
        );
        emptyWallet = new Wallet(user);
        walletWithTransactions = new Wallet(user);
        // Double amount, Wallet destinationWallet, TransactionType type
        transaction1 = new Transaction(
            100.0,
            walletWithTransactions,
            TransactionType.PAYOUT
        );
        transaction2 = new Transaction(
            50.0,
            walletWithTransactions,
            TransactionType.PAYOUT
        );
        // No existe un setter para transactions, usamos ReflectionTestUtils para inyectar la lista de transacciones directamente
        ReflectionTestUtils.setField(walletWithTransactions, "transactions", List.of(transaction1, transaction2)); 
    }

    @Test
    void getWalletByUserId_ShouldReturnWallet_IfWalletExists() {
        when(walletRepository.findByUserId(user.getId())).thenReturn(Optional.of(emptyWallet));

        Wallet wallet = walletService.getWalletByUserId(user.getId());

        assertNotNull(wallet);
        assertEquals(wallet.getUser().getEmail(), user.getEmail());
    }

    @Test
    void getWalletByUserId_BalanceShouldBeZero_IfWalletIsNew() {
        when(walletRepository.findByUserId(user.getId())).thenReturn(Optional.of(emptyWallet));

        Wallet wallet = walletService.getWalletByUserId(user.getId());

        assertEquals(0.0, wallet.getBalance());
    }

    @Test
    void getWalletByUserId_ShouldThrowException_IfUserDoesNotExist() {
        when(walletRepository.findByUserId(nonexistingUserId)).thenReturn(Optional.empty());

        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            walletService.getWalletByUserId(nonexistingUserId);
        });

        assertTrue(exception.getMessage().contains("Wallet not found"));
    }

    @Test
    void getTransactionsForUser_ShouldReturnTransactions_IfWalletHasTransactions() {
        when(walletRepository.findByUserId(user.getId())).thenReturn(Optional.of(walletWithTransactions));
        when(transactionRepository.findByDestinationWalletIdOrderByTimestampDesc(walletWithTransactions.getId()))
            .thenReturn(List.of(transaction1, transaction2));

        List<Transaction> transactions = walletService.getTransactionsForUser(user.getId());

        assertNotNull(transactions);
        assertEquals(2, transactions.size());
        Double tx1Amount = transaction1.getAmount();
        Double tx2Amount = transaction2.getAmount();
        assertEquals(tx1Amount, transactions.get(0).getAmount());
        assertEquals(tx2Amount, transactions.get(1).getAmount());
        Double expectedBalance = tx1Amount + tx2Amount;
        assertEquals(expectedBalance, walletWithTransactions.getBalance());
    }

    @Test
    void getTransactionsForUser_ShouldReturnEmptyList_IfWalletHasNoTransactions() {
        when(walletRepository.findByUserId(user.getId())).thenReturn(Optional.of(emptyWallet));
        when(transactionRepository.findByDestinationWalletIdOrderByTimestampDesc(emptyWallet.getId()))
            .thenReturn(List.of());
        
        List<Transaction> transactions = walletService.getTransactionsForUser(user.getId());

        assertNotNull(transactions);
        assertTrue(transactions.isEmpty());
    }

    // TODO: Tests para updateWalletBalance, incluyendo casos de éxito y casos de error (saldo insuficiente, monto negativo, etc.)
    
}
