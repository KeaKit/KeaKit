package com.example.demo.controller;

import com.example.demo.dto.CreatePaymentIntentRequest;
import com.example.demo.dto.CreatePaymentIntentResponse;
import com.stripe.Stripe;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final String stripeSecretKey;
    private static final double DEPOSIT_RATE = 0.20;

    public PaymentController() {
        // Usar System.getenv() para leer la variable de entorno exportada
        stripeSecretKey = System.getenv("STRIPE_SECRET_KEY");
        if (stripeSecretKey == null || stripeSecretKey.isEmpty()) {
            throw new IllegalStateException("La variable de entorno STRIPE_SECRET_KEY no está definida");
        }
        Stripe.apiKey = stripeSecretKey;
    }

    @PostMapping("/create-payment-intent")
    public ResponseEntity<?> createPaymentIntent(@RequestBody CreatePaymentIntentRequest request) {
        try {
            if (request == null || request.getBaseAmount() == null) {
                return ResponseEntity.badRequest().body("baseAmount es obligatorio (en céntimos).");
            }

            long baseAmount = request.getBaseAmount();
            if (baseAmount <= 0) {
                return ResponseEntity.badRequest().body("baseAmount debe ser mayor que 0.");
            }

            long depositAmount = Math.round(baseAmount * DEPOSIT_RATE);
            long totalAmount = baseAmount + depositAmount;

            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(totalAmount)
                .setCurrency("eur")
                .putMetadata("baseAmount", String.valueOf(baseAmount))
                .putMetadata("depositAmount", String.valueOf(depositAmount))
                .putMetadata("depositRate", String.valueOf(DEPOSIT_RATE))
                .putMetadata("kitId", request.getKitId() != null ? String.valueOf(request.getKitId()) : "")
                .build();

            PaymentIntent intent = PaymentIntent.create(params);

            CreatePaymentIntentResponse response = new CreatePaymentIntentResponse(
                intent.getClientSecret(),
                baseAmount,
                depositAmount,
                totalAmount,
                DEPOSIT_RATE
            );

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error creando PaymentIntent: " + e.getMessage());
        }
    }
}