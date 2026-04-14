package com.example.demo.payment;

import com.example.demo.BaseControllerTest;

import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import org.springframework.http.MediaType;
import static org.hamcrest.Matchers.containsString;
import com.stripe.exception.ApiException;
import com.example.demo.exception.NotEnoughBalanceException;

import com.example.demo.controller.PaymentController;
import com.example.demo.service.PaymentService;
import com.stripe.model.PaymentIntent;

import java.util.Map;


@WebMvcTest(PaymentController.class)
public class PaymentControllerTest extends BaseControllerTest {

    @MockitoBean
    private PaymentService paymentService;

    // Endpoints
    private final String BASE_URL = "/api/payments";
    private final String CREATE_PAYMENT_INTENT_URL = BASE_URL + "/create";
    private final String PROCESS_STRIPE_URL = BASE_URL + "/process/stripe/{kitId}";
    private final String PROCESS_WALLET_URL = BASE_URL + "/process/wallet/{kitId}";

    // Datos de prueba
    private static final Long KIT_ID = 1L;

    @Test
    void createPaymentIntent_ShouldReturnClientSecret_WhenSuccessful() throws Exception {
        Long amount = 15000L;
        PaymentIntent mockedIntent = mock(PaymentIntent.class);
        String secret = "pi_123_secret_456";

        when(mockedIntent.getClientSecret()).thenReturn(secret);
        when(paymentService.createPaymentIntent(amount)).thenReturn(mockedIntent);


        mockMvc.perform(post(CREATE_PAYMENT_INTENT_URL)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(amount)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.clientSecret").value(secret));
    }

    @Test
    void processPayment_ShouldReturnOk_WhenStripeSucceeded() throws Exception {
        String statusSucceeded = "\"succeeded\""; 

        mockMvc.perform(post(PROCESS_STRIPE_URL, KIT_ID)
                .contentType(MediaType.APPLICATION_JSON)
                .content(statusSucceeded))
                .andExpect(status().isOk())
                .andExpect(content().string("Pago procesado correctamente"));

        verify(paymentService).processPayment(KIT_ID, false, null, null);
    }

    @Test
    void processPayment_ShouldReturnBadRequest_WhenStatusIsNotSucceeded() throws Exception {
        String statusFailed = "\"failed\"";

        mockMvc.perform(post(PROCESS_STRIPE_URL, KIT_ID)
                .contentType(MediaType.APPLICATION_JSON)
                .content(statusFailed))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("Se esperaba un estado de pago succeeded")));
        
        verify(paymentService, never()).processPayment(anyLong(), anyBoolean());
    }

    @Test
    void processWalletPayment_ShouldReturnOk_WhenSuccessful() throws Exception {
        mockMvc.perform(post(PROCESS_WALLET_URL, KIT_ID))
                .andExpect(status().isOk())
                .andExpect(content().string("Pago con billetera procesado correctamente"));

        verify(paymentService).processPayment(KIT_ID, true, null, null);
    }

    @Test
    void processWalletPayment_ShouldReturnError_WhenServiceThrowsException() throws Exception {
        doThrow(new RuntimeException("Saldo insuficiente"))
            .when(paymentService).processPayment(KIT_ID, true, null, null);

        mockMvc.perform(post(PROCESS_WALLET_URL, KIT_ID))
                .andExpect(status().isInternalServerError())
                .andExpect(content().string(containsString("Error al procesar el pago con billetera: Saldo insuficiente")));
    }

    @Test
    void createPaymentIntent_ShouldReturnErrorMessage_WhenStripeFails() throws Exception {
        Long amount = 1000L;
        ApiException stripeException = new ApiException("Invalid card", null, "card_declined", 402, null);
        
        when(paymentService.createPaymentIntent(amount)).thenThrow(stripeException);

        mockMvc.perform(post(CREATE_PAYMENT_INTENT_URL)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(amount)))
                .andExpect(status().isOk()) // Tu controlador devuelve 200 pero con un mapa de error
                .andExpect(jsonPath("$.error").value(containsString("Error al crear el PaymentIntent: Invalid card")));
    }

    @Test
    void processPayment_ShouldReturnInternalServerError_WhenServiceFails() throws Exception {
        String statusSucceeded = "\"succeeded\"";
        String errorMsg = "Database connection failed";
        
        doThrow(new RuntimeException(errorMsg))
            .when(paymentService).processPayment(KIT_ID, false, null, null);

        mockMvc.perform(post(PROCESS_STRIPE_URL, KIT_ID)
                .contentType(MediaType.APPLICATION_JSON)
                .content(statusSucceeded))
                .andExpect(status().isInternalServerError())
                .andExpect(content().string(containsString("Error al procesar el pago: " + errorMsg)));
    }

    @Test
    void withdraw_ShouldReturnOk_WhenSuccessful() throws Exception {
        Double amount = 50.0;
        Long userId = 2L;
        String bankAccount = "ES9121000418450200051332";

        when(authService.getAuthenticatedUserId()).thenReturn(userId);

        mockMvc.perform(post(BASE_URL + "/withdraw")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                        "amount", amount,
                        "bankAccount", bankAccount))))
                .andExpect(status().isOk())
                .andExpect(content().string("Retirada realizada correctamente"));

        verify(paymentService).withdrawToBank(userId, amount, bankAccount);
    }

    @Test
    void withdraw_ShouldReturnPaymentRequired_WhenServiceThrowsNotEnoughBalance() throws Exception {
        Double amount = 50.0;
        Long userId = 2L;
        String bankAccount = "ES9121000418450200051332";

        when(authService.getAuthenticatedUserId()).thenReturn(userId);
        doThrow(new NotEnoughBalanceException("Saldo insuficiente"))
                .when(paymentService).withdrawToBank(userId, amount, bankAccount);

        mockMvc.perform(post(BASE_URL + "/withdraw")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                        "amount", amount,
                        "bankAccount", bankAccount))))
                .andExpect(status().isPaymentRequired())
                .andExpect(jsonPath("$.message").value("Saldo insuficiente"));
    }

    @Test
    void withdraw_ShouldReturnBadRequest_WhenRequestIsInvalid() throws Exception {
        Long userId = 2L;

        when(authService.getAuthenticatedUserId()).thenReturn(userId);

        mockMvc.perform(post(BASE_URL + "/withdraw")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                        "amount", 0,
                        "bankAccount", "123"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.amount").value("La cantidad debe ser mayor que 0"))
                .andExpect(jsonPath("$.bankAccount").value("La cuenta bancaria debe tener un formato IBAN valido"));

        verify(paymentService, never()).withdrawToBank(anyLong(), anyDouble(), anyString());
    }
}
