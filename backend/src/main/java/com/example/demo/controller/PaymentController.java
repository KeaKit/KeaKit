package com.example.demo.controller;

import com.stripe.Stripe;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final String stripeSecretKey;

    public PaymentController(@Value("${STRIPE_SECRET_KEY:}") String stripeSecretKey) {
        this.stripeSecretKey = stripeSecretKey;
        if (this.stripeSecretKey == null || this.stripeSecretKey.isEmpty()) {
            throw new IllegalStateException("La variable de entorno STRIPE_SECRET_KEY no está definida");
        }
        Stripe.apiKey = this.stripeSecretKey;
    }

    @PostMapping("/create-payment-intent")
    public Map<String, Object> createPaymentIntent(@RequestBody Map<String, Object> data) throws Exception {
        long amount = ((Number) data.get("amount")).longValue(); // monto en centavos

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amount)
                .setCurrency("usd")
                .build();

        PaymentIntent intent = PaymentIntent.create(params);

        Map<String, Object> response = new HashMap<>();
        response.put("clientSecret", intent.getClientSecret());
        return response;
    }
}