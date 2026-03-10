package com.example.demo.controller;

import com.example.demo.service.PaymentService;

import com.stripe.model.PaymentIntent;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.net.Webhook;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

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

    @PostMapping("/process")
    public ResponseEntity<String> processPayment(
            @RequestBody String payload,
            @RequestHeader(value = "Stripe-Signature", required = false) String sigHeader) {
        // TODO: Revisar y completar esta función

        Event event;

        try {
            if ("test".equals(sigHeader)) {
                // Modo test: deserializamos directamente desde JSON
                event = Event.GSON.fromJson(payload, Event.class);
            } else {
                // Validación real con firma de Stripe
                event = Webhook.constructEvent(payload, sigHeader, endpointSecret);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error de validación: " + e.getMessage());
        }

        // Procesamos el evento
        if ("payment_intent.succeeded".equals(event.getType())) {
            event.getDataObjectDeserializer().getObject().ifPresent(stripeObject -> {
                if (stripeObject instanceof PaymentIntent) {
                    PaymentIntent paymentIntent = (PaymentIntent) stripeObject;
                    System.out.println("¡Pago exitoso! ID: " + paymentIntent.getId());
                    System.out.println("Monto: " + paymentIntent.getAmount());

                    // Recuperar metadata del kit
                    Map<String, String> metadata = paymentIntent.getMetadata();
                    System.out.println("Kit: " + metadata.get("kit_name"));
                    System.out.println("Usuario: " + metadata.get("user_id"));
                    System.out.println("Fechas: " + metadata.get("start_date") + " - " + metadata.get("end_date"));
                    System.out.println("Items: " + metadata.get("items"));

                    // Aquí creas el kit en la base de datos usando los metadata
                }
            });
        }

        return ResponseEntity.ok("Procesado");
    }

}