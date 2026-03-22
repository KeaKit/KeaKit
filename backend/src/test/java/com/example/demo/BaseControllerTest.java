package com.example.demo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.ImportAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;

import com.example.demo.security.CustomUserDetailsService;
import com.example.demo.security.JwtUtil;
import com.example.demo.security.TokenBlacklistService;
import com.example.demo.service.AuthService;
import com.example.demo.model.Transaction;
import com.example.demo.model.User;
import com.example.demo.model.Wallet;
import com.example.demo.model.TransactionType;

@WebMvcTest // No se especifica aquí excludeAutoConfiguration porque la herencia no lo
            // permite
@ImportAutoConfiguration(exclude = {
        SecurityAutoConfiguration.class,
        SecurityFilterAutoConfiguration.class
})
public abstract class BaseControllerTest {

    @Autowired
    protected MockMvc mockMvc;

    @MockitoBean
    protected AuthService authService;

    @MockitoBean
    protected CustomUserDetailsService customUserDetailsService;

    @MockitoBean
    protected TokenBlacklistService tokenBlacklistService;

    @MockitoBean
    protected JwtUtil jwtUtil;

    protected User createMockUser(Long id) {
        User user = new User();
        ReflectionTestUtils.setField(user, "id", id);
        return user;
    }

    protected Wallet createMockWallet(Long walletId, User user) {
        Wallet wallet = new Wallet();
        ReflectionTestUtils.setField(wallet, "id", walletId);
        ReflectionTestUtils.setField(wallet, "user", user);
        ReflectionTestUtils.setField(wallet, "balance", 100.0);
        return wallet;
    }

    protected Transaction createMockTransaction(Long transactionId, Wallet wallet) {
        Transaction transaction = new Transaction();
        ReflectionTestUtils.setField(transaction, "id", transactionId);
        ReflectionTestUtils.setField(transaction, "destinationWallet", wallet);
        ReflectionTestUtils.setField(transaction, "amount", 50.0);
        ReflectionTestUtils.setField(transaction, "type", TransactionType.PAYOUT);
        return transaction;
    }

}
