package com.example.demo.controller;

import com.example.demo.service.PaymentService;
import com.example.demo.repository.KitRepository;
import com.example.demo.model.Kit;
import com.example.demo.model.KitStatus;
import com.stripe.model.PaymentIntent;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.Balance;
import com.stripe.net.Webhook;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private KitRepository kitRepository;

    @Value("${stripe.api.key}")
    private String endpointSecret;

    @PostMapping("/create")
    public ResponseEntity<String> createPaymentIntent(@RequestBody Long amount) throws StripeException {
        // El monto debe ser siempre en la unidad más pequeña de la moneda
        PaymentIntent intent = paymentService.createPaymentIntent(amount);
        return ResponseEntity.ok(intent.getClientSecret());
    }

    @PostMapping("/process")
    public ResponseEntity<String> processPayment(
            @RequestBody String payload, 
            @RequestHeader(value = "Stripe-Signature", required = false) String sigHeader) {
        
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

    @PostMapping("/pay-kit")
    public ResponseEntity<Map<String, Object>> simulateCapturedPayment(
            @RequestBody Map<String, Object> paymentRequest) throws StripeException, RuntimeException {
        
        Long amount = ((Number) paymentRequest.get("amount")).longValue();
        
        // Reutilizar el servicio existente para crear el PaymentIntent
        PaymentIntent intent = paymentService.createPaymentIntent(amount);
        Long kitId = null;
        
        // Agregar metadata del kit
        Map<String, String> metadata = new HashMap<>();
        System.out.println("Recibiendo solicitud de pago para kit. Datos: " + paymentRequest);
        if (paymentRequest.containsKey("kitId")) {
            metadata.put("kit_id", paymentRequest.get("kitId").toString());
            kitId = Long.valueOf(paymentRequest.get("kitId").toString());
            Optional<Kit> kit = kitRepository.findById(kitId);
            
            if (kit.isPresent()) {
                System.out.println("Kit encontrado: " + kit.get().getName());
                kit.get().setStatus(KitStatus.PAID);
                kitRepository.save(kit.get());
                System.out.println("Actualizado kit status"+kit.get().getStatus());
            }else{
                System.out.println("Kit no encontrado :(");
            }
            

        }
        if (paymentRequest.containsKey("userId")) {
            metadata.put("user_id", paymentRequest.get("userId").toString());
        }
        if (paymentRequest.containsKey("startDate")) {
            metadata.put("start_date", paymentRequest.get("startDate").toString());
        }
        if (paymentRequest.containsKey("endDate")) {
            metadata.put("end_date", paymentRequest.get("endDate").toString());
        }
        if (paymentRequest.containsKey("items")) {
            metadata.put("items", paymentRequest.get("items").toString());
        }
        
        // Actualizar el PaymentIntent con metadata
        Map<String, Object> updateParams = new HashMap<>();
        updateParams.put("metadata", metadata);
        intent = intent.update(updateParams);
        
        // Confirmar el pago con tarjeta de prueba
        Map<String, Object> confirmParams = new HashMap<>();
        confirmParams.put("payment_method", "pm_card_visa");
        intent = intent.confirm(confirmParams);
        
        // Obtener el balance actual de prueba
        Balance balance = Balance.retrieve();
        
        // Preparar respuesta
        Map<String, Object> response = new HashMap<>();
        response.put("paymentIntentId", intent.getId());
        response.put("status", intent.getStatus());
        response.put("amount", intent.getAmount());
        response.put("currency", intent.getCurrency());
        response.put("metadata", intent.getMetadata());
        response.put("message", "Pago de prueba capturado exitosamente");
        response.put("balanceAvailable", balance.getAvailable());
        response.put("balancePending", balance.getPending());
        response.put("dashboardUrl", "https://dashboard.stripe.com/test/payments/" + intent.getId());

        if (!intent.getStatus().equals("succeeded")) {
            throw new RuntimeException("Error al capturar el pago de prueba. Status: " + intent.getStatus());
        } else {

            System.out.println("Pago de prueba capturado exitosamente. ID: " + intent.getId());
            System.out.println("Creando transacciones...");

        }


        
        return ResponseEntity.ok(response);
    }

}