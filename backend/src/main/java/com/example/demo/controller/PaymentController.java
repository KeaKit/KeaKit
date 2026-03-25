package com.example.demo.controller;

import com.example.demo.dto.WithdrawRequest;
import com.example.demo.service.AuthService;
import com.example.demo.service.PaymentService;

import com.stripe.model.PaymentIntent;
import com.stripe.exception.StripeException;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private AuthService authService;

    @Value("${stripe.api.key}")
    private String endpointSecret;

    @PostMapping("/create")
    public Map<String, String> createPaymentIntent(@RequestBody Long amount) throws StripeException {
        // El monto debe ser siempre en la unidad más pequeña de la moneda
        try {
            PaymentIntent intent = paymentService.createPaymentIntent(amount);
            return Map.of("clientSecret", intent.getClientSecret());
        } catch (StripeException e) {
            return Map.of("error", "Error al crear el PaymentIntent: " + e.getMessage());
        }
    }

    @PostMapping("/process/stripe/{kitId}")
    public ResponseEntity<String> processPayment(@PathVariable Long kitId, @RequestBody String paymentIntentStatus) {

        if (paymentIntentStatus.replace("\"", "").equals("succeeded")) {
            try {
                paymentService.processPayment(kitId, false); // El pago se hizo a través de Stripe, no con wallet
                return ResponseEntity.ok("Pago procesado correctamente");
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Error al procesar el pago: " + e.getMessage());
            }
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Se esperaba un estado de pago succeeded, pero se recibió: " + paymentIntentStatus);
        }
    }

    @PostMapping("/process/wallet/{kitId}")
    public ResponseEntity<String> processWalletPayment(@PathVariable Long kitId) {
        try {
            paymentService.processPayment(kitId, true); // El pago se hizo con wallet
            return ResponseEntity.ok("Pago con billetera procesado correctamente");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al procesar el pago con billetera: " + e.getMessage());
        }
    }

    @PostMapping("/withdraw")
    public ResponseEntity<String> withdraw(@Valid @RequestBody WithdrawRequest request) throws StripeException {

        Long userId = authService.getAuthenticatedUserId();

        paymentService.withdrawToBank(userId, request.getAmount(), request.getBankAccount());

        return ResponseEntity.ok("Retirada realizada correctamente");
    }

}
