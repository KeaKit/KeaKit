package com.example.demo.controller;

import com.stripe.Stripe;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import com.example.demo.dto.PaymentRequest;
import com.example.demo.model.PaymentData;
import com.example.demo.model.WalletTransaction;
import com.example.demo.service.PaymentService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final String stripeSecretKey;
    private final PaymentService paymentService;

    public PaymentController(
            @Value("${STRIPE_SECRET_KEY:}") String stripeSecretKey,
            PaymentService paymentService) {
        this.stripeSecretKey = stripeSecretKey;
        this.paymentService = paymentService;
        if (this.stripeSecretKey != null && !this.stripeSecretKey.isEmpty()) {
            Stripe.apiKey = this.stripeSecretKey;
        }
    }

    /**
     * Crea un Payment Intent para un kit específico
     * Retorna el clientSecret que el frontend usa para completar el pago
     */
    @PostMapping("/create-payment-intent")
    public ResponseEntity<Map<String, Object>> createPaymentIntent(@RequestBody Map<String, Object> data) {
        try {
            Long kitId = ((Number) data.get("kitId")).longValue();
            Long tenantId = ((Number) data.get("tenantId")).longValue();

            if (kitId == null || tenantId == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "kitId y tenantId son requeridos");
                return ResponseEntity.badRequest().body(error);
            }

            Map<String, Object> result = paymentService.createPaymentIntentForKit(kitId, tenantId);
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Error creando payment intent: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    /**
     * Confirma un pago después de que Stripe lo ha procesado
     * Se llama después de que el frontend haya completado el pago con Stripe
     */
    @PostMapping("/confirm-payment")
    public ResponseEntity<Map<String, Object>> confirmPayment(@RequestBody PaymentRequest paymentRequest) {
        try {
            Long kitId = paymentRequest.getKitId();
            Long tenantId = paymentRequest.getTenantId();
            String paymentIntentId = paymentRequest.getPaymentMethodId(); // Reutilizamos este campo

            if (kitId == null || tenantId == null || paymentIntentId == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "kitId, tenantId y paymentIntentId son requeridos");
                return ResponseEntity.badRequest().body(error);
            }

            Map<String, Object> result = paymentService.processKitPayment(kitId, tenantId, paymentIntentId);
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Error confirmando pago: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    /**
     * Procesa el pago de un kit (versión simplificada para compatibilidad backwards)
     * Obsoleto: usar create-payment-intent + confirm-payment en su lugar
     */
    @PostMapping("/pay-kit")
    public ResponseEntity<Map<String, Object>> payKit(@RequestBody PaymentRequest paymentRequest) {
        try {
            // Esta versión simplificada asume que el payment intent ya fue completado en Stripe
            Long kitId = paymentRequest.getKitId();
            Long tenantId = paymentRequest.getTenantId();
            String paymentIntentId = paymentRequest.getPaymentMethodId();

            if (kitId == null || tenantId == null || paymentIntentId == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "kitId, tenantId y paymentIntentId son requeridos");
                return ResponseEntity.badRequest().body(error);
            }

            Map<String, Object> result = paymentService.processKitPayment(kitId, tenantId, paymentIntentId);
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Error procesando el pago: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    /**
     * Obtiene el saldo de la wallet de un usuario
     */
    @GetMapping("/balance/{userId}")
    public ResponseEntity<Map<String, Object>> getBalance(@PathVariable Long userId) {
        try {
            Map<String, Object> balance = paymentService.getUserBalance(userId);
            return ResponseEntity.ok(balance);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    /**
     * Obtiene el historial de transacciones de un usuario
     */
    @GetMapping("/transactions/{userId}")
    public ResponseEntity<Map<String, Object>> getTransactions(@PathVariable Long userId) {
        try {
            List<WalletTransaction> transactions = paymentService.getUserTransactions(userId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("transactions", transactions);
            response.put("count", transactions.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    /**
     * Obtiene los datos de pago de un usuario (info de Stripe Connect)
     */
    @GetMapping("/payment-data/{userId}")
    public ResponseEntity<Map<String, Object>> getPaymentData(@PathVariable Long userId) {
        try {
            Map<String, Object> paymentInfo = paymentService.getUserPaymentInfo(userId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("paymentData", paymentInfo);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    /**
     * Obtiene todas las transacciones de un kit específico
     */
    @GetMapping("/kit-transactions/{kitId}")
    public ResponseEntity<Map<String, Object>> getKitTransactions(@PathVariable Long kitId) {
        try {
            List<WalletTransaction> transactions = paymentService.getKitTransactions(kitId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("transactions", transactions);
            response.put("count", transactions.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    /**
     * Procesa un reembolso de pago
     */
    @PostMapping("/refund/{kitId}")
    public ResponseEntity<Map<String, Object>> refundPayment(@PathVariable Long kitId) {
        try {
            Map<String, Object> result = paymentService.refundPayment(kitId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Error procesando reembolso: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }
}