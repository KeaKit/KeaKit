package com.example.demo.payment;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;

import com.example.demo.controller.WalletController;
import com.example.demo.service.WalletService;
import com.example.demo.model.Wallet;
import com.example.demo.model.User;
import com.example.demo.model.Transaction;

import com.example.demo.BaseControllerTest;
import com.example.demo.exception.AccessForbiddenException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.exception.UnauthorizedException;

@WebMvcTest(WalletController.class)
public class WalletControllerTest extends BaseControllerTest {

    @MockitoBean
    private WalletService walletService;

    // Endpoints
    private final String BASE_URL = "/api/wallet";
    private final String MY_WALLET_URL = BASE_URL + "/my-wallet";
    private final String MY_WALLET_TRANSACTIONS_URL = MY_WALLET_URL + "/transactions";
    private final String ADMIN_WALLET_URL = BASE_URL + "/user/{userId}";
    private final String ADMIN_WALLET_TRANSACTIONS_URL = ADMIN_WALLET_URL + "/transactions";

    // Datos de prueba
    private final Long USER_ID = 1L;
    private final Long WALLET_ID = 1L;
    private final Long TRANSACTION_ID = 1L;
    private final User user = createMockUser(USER_ID);
    private final Wallet wallet = createMockWallet(WALLET_ID, user);
    private final Transaction transaction = createMockTransaction(TRANSACTION_ID, wallet);

    // =============== Tests para getLogedUserWallet ===============
    @Test
    void getLogedUserWallet_ShouldReturnWallet_WhenUserIsAuthenticated() throws Exception {
        when(authService.getAuthenticatedUserId()).thenReturn(USER_ID);
        when(walletService.getWalletByUserId(USER_ID)).thenReturn(wallet);

        mockMvc.perform(get(MY_WALLET_URL))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(WALLET_ID))
                .andExpect(jsonPath("$.userId").value(USER_ID));
    }

    @Test
    void getLogedUserWallet_ShouldReturn401_WhenUserIsNotAuthenticated() throws Exception {
        when(authService.getAuthenticatedUserId()).thenThrow(new UnauthorizedException("Usuario no autenticado"));

        mockMvc.perform(get(MY_WALLET_URL))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getLogedUserWallet_ShouldReturn404_WhenWalletDoesNotExist() throws Exception {
        when(authService.getAuthenticatedUserId()).thenReturn(USER_ID);
        when(walletService.getWalletByUserId(USER_ID)).thenThrow(new ResourceNotFoundException("Wallet not found"));

        mockMvc.perform(get(MY_WALLET_URL))
                .andExpect(status().isNotFound());
    }

    // =============== Tests para getLogedUserWalletTransactions ===============

    @Test
    void getLogedUserWalletTransactions_ShouldReturnTransactions_WhenUserIsAuthenticated() throws Exception {
        when(authService.getAuthenticatedUserId()).thenReturn(USER_ID);
        when(walletService.getTransactionsForUser(USER_ID)).thenReturn(List.of(transaction));

        mockMvc.perform(get(MY_WALLET_TRANSACTIONS_URL))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void getLogedUserWalletTransactions_ShouldReturn401_WhenUserIsNotAuthenticated() throws Exception {
        when(authService.getAuthenticatedUserId()).thenThrow(new UnauthorizedException("Usuario no autenticado"));

        mockMvc.perform(get(MY_WALLET_TRANSACTIONS_URL))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getLogedUserWalletTransactions_ShouldReturn404_WhenWalletDoesNotExist() throws Exception {
        when(authService.getAuthenticatedUserId()).thenReturn(USER_ID);
        when(walletService.getTransactionsForUser(USER_ID))
                .thenThrow(new ResourceNotFoundException("Wallet not found"));

        mockMvc.perform(get(MY_WALLET_TRANSACTIONS_URL))
                .andExpect(status().isNotFound());
    }

    // =============== Tests para getWalletByUserId (admin) ===============

    @Test
    void getWalletByUserId_ShouldReturnWallet_WhenUserIsAdmin() throws Exception {
        when(walletService.getWalletByUserId(USER_ID)).thenReturn(wallet);

        mockMvc.perform(get(ADMIN_WALLET_URL, USER_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(WALLET_ID))
                .andExpect(jsonPath("$.userId").value(USER_ID));
    }

    @Test
    void getWalletByUserId_ShouldReturn403_WhenUserIsNotAdminOrOwner() throws Exception {
        doThrow(new AccessForbiddenException("No tienes permisos")).when(authService).validateAccess(USER_ID);

        mockMvc.perform(get(ADMIN_WALLET_URL, USER_ID))
                .andExpect(status().isForbidden());
    }

    @Test
    void getWalletByUserId_ShouldReturn404_WhenTargetUserNotFound() throws Exception {
        doThrow(new ResourceNotFoundException("Usuario no encontrado"))
                .when(authService).validateAccess(USER_ID);

        mockMvc.perform(get(ADMIN_WALLET_URL, USER_ID))
                .andExpect(status().isNotFound());
    }

    @Test
    void getWalletByUserId_ShouldReturn401_WhenTokenIsInvalid() throws Exception {
        doThrow(new UnauthorizedException("Token inválido"))
                .when(authService).validateAccess(USER_ID);

        mockMvc.perform(get(ADMIN_WALLET_URL, USER_ID))
                .andExpect(status().isUnauthorized());
    }

    // =============== Tests para getWalletTransactions (admin) ===============

    @Test
    void getWalletTransactions_ShouldReturnTransactions_WhenUserIsAdmin() throws Exception {
        when(walletService.getTransactionsForUser(USER_ID)).thenReturn(List.of(transaction));

        mockMvc.perform(get(ADMIN_WALLET_TRANSACTIONS_URL, USER_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void getWalletTransactions_ShouldReturn403_WhenUserIsNotAdminOrOwner() throws Exception {
        doThrow(new AccessForbiddenException("No tienes permisos")).when(authService).validateAccess(USER_ID);

        mockMvc.perform(get(ADMIN_WALLET_TRANSACTIONS_URL, USER_ID))
                .andExpect(status().isForbidden());
    }

    @Test
    void getWalletTransactions_ShouldReturn404_WhenTargetUserNotFound() throws Exception {
        doThrow(new ResourceNotFoundException("Usuario no encontrado"))
                .when(authService).validateAccess(USER_ID);

        mockMvc.perform(get(ADMIN_WALLET_TRANSACTIONS_URL, USER_ID))
                .andExpect(status().isNotFound());
    }

    @Test
    void getWalletTransactions_ShouldReturn401_WhenTokenIsInvalid() throws Exception {
        doThrow(new UnauthorizedException("Token inválido"))
                .when(authService).validateAccess(USER_ID);

        mockMvc.perform(get(ADMIN_WALLET_TRANSACTIONS_URL, USER_ID))
                .andExpect(status().isUnauthorized());
    }

}