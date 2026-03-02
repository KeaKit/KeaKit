package com.example.demo.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.model.Kit;
import com.example.demo.model.KitStatus;
import com.example.demo.model.PaymentData;
import com.example.demo.model.TransactionType;
import com.example.demo.model.User;
import com.example.demo.model.Wallet;
import com.example.demo.model.WalletTransaction;
import com.example.demo.repository.KitRepository;
import com.example.demo.repository.PaymentDataRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.WalletRepository;
import com.example.demo.repository.WalletTransactionRepository;
import com.stripe.Stripe;
import com.stripe.model.Account;
import com.stripe.model.Charge;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import com.stripe.param.AccountCreateParams;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.RefundCreateParams;

@Service
public class PaymentService {

    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final PaymentDataRepository paymentDataRepository;
    private final UserRepository userRepository;
    private final KitRepository kitRepository;
    private final String stripeSecretKey;
    private final Double platformFeePercentage = 0.1; // 10% comisión plataforma

    public PaymentService(
            WalletRepository walletRepository,
            WalletTransactionRepository walletTransactionRepository,
            PaymentDataRepository paymentDataRepository,
            UserRepository userRepository,
            KitRepository kitRepository,
            @Value("${STRIPE_SECRET_KEY:}") String stripeSecretKey) {
        this.walletRepository = walletRepository;
        this.walletTransactionRepository = walletTransactionRepository;
        this.paymentDataRepository = paymentDataRepository;
        this.userRepository = userRepository;
        this.kitRepository = kitRepository;
        this.stripeSecretKey = stripeSecretKey;
        
        if (stripeSecretKey != null && !stripeSecretKey.isEmpty()) {
            Stripe.apiKey = stripeSecretKey;
        }
    }

    /**
     * Crea una wallet para un nuevo usuario durante el registro
     */
    @Transactional
    public Wallet createWallet(User user) {
        Wallet wallet = new Wallet(user);
        wallet = walletRepository.save(wallet);
        user.setWallet(wallet);
        userRepository.save(user);
        return wallet;
    }

    /**
     * Crea datos de pago para un usuario (Stripe Connect account)
     */
    @Transactional
    public PaymentData createPaymentData(User user) {
        PaymentData paymentData = new PaymentData(user);
        paymentData = paymentDataRepository.save(paymentData);
        user.setPaymentData(paymentData);
        userRepository.save(user);

        // Crea una cuenta de Stripe Connect
        try {
            if (stripeSecretKey != null && !stripeSecretKey.isEmpty()) {
                createStripeConnectAccount(paymentData, user);
            }
        } catch (Exception e) {
            System.err.println("Error creando cuenta Stripe Connect: " + e.getMessage());
            throw new RuntimeException("Error configurando Stripe Connect: " + e.getMessage());
        }

        return paymentData;
    }

    /**
     * Crea una cuenta de Stripe Connect (Standard Account) para el usuario
     */
    private void createStripeConnectAccount(PaymentData paymentData, User user) throws Exception {
        AccountCreateParams params = AccountCreateParams.builder()
                .setType(AccountCreateParams.Type.STANDARD)
                .setEmail(user.getEmail())
                .setCountry("ES")
                .setBusinessType(AccountCreateParams.BusinessType.INDIVIDUAL)
                .setIndividual(
                    AccountCreateParams.Individual.builder()
                            .setAddress(
                                AccountCreateParams.Individual.Address.builder()
                                        .setLine1(user.getAddress())
                                        .setCity(user.getCity())
                                        .setCountry(user.getCountry())
                                        .build()
                            )
                            .setEmail(user.getEmail())
                            .setFirstName(user.getName().split(" ")[0])
                            .setLastName(user.getName().contains(" ") ? 
                                user.getName().substring(user.getName().indexOf(" ") + 1) : 
                                user.getName())
                            .setPhone(user.getPhone())
                            .build()
                )
                .setBusinessProfile(
                    AccountCreateParams.BusinessProfile.builder()
                            .setName(user.getName())
                            .setUrl("https://keakit.com")
                            .setProductDescription("Alquiler de kits de viaje")
                            .build()
                )
                .build();

        Account account = Account.create(params);
        paymentData.setStripeAccountId(account.getId());
        paymentData.setStripeAccountStatus(account.getChargesEnabled() ? "active" : "restricted");
        paymentDataRepository.save(paymentData);
    }

    /**
     * Crea un Payment Intent para el tenant
     * Retorna el clientSecret para que el frontend complete el pago
     */
    public Map<String, Object> createPaymentIntentForKit(Long kitId, Long tenantId) throws Exception {
        Kit kit = kitRepository.findById(kitId)
                .orElseThrow(() -> new RuntimeException("Kit no encontrado"));

        User owner = kit.getOwner();
        if (owner == null) {
            throw new RuntimeException("El kit no tiene propietario");
        }

        PaymentData ownerPaymentData = owner.getPaymentData();
        if (ownerPaymentData == null || ownerPaymentData.getStripeAccountId() == null) {
            throw new RuntimeException("El propietario no tiene Stripe Connect configurado");
        }

        Long amountCents = (long) (kit.getTotalPrice() * 100);
        Long platformFee = (long) (amountCents * platformFeePercentage);

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amountCents)
                .setCurrency("eur")
                .setOnBehalfOf(ownerPaymentData.getStripeAccountId())
                .setApplicationFeeAmount(platformFee)
                .setDescription("Pago de kit: " + kit.getName())
                .putMetadata("kitId", kitId.toString())
                .putMetadata("tenantId", tenantId.toString())
                .build();

        PaymentIntent paymentIntent = PaymentIntent.create(params);

        Map<String, Object> response = new HashMap<>();
        response.put("clientSecret", paymentIntent.getClientSecret());
        response.put("paymentIntentId", paymentIntent.getId());
        response.put("amount", kit.getTotalPrice());
        return response;
    }

    /**
     * Procesa pagos usando Stripe Connect
     * El dinero va directo del customer al connected account del owner (propietario)
     */
    @Transactional
    public Map<String, Object> processKitPayment(Long kitId, Long tenantId, String paymentIntentId) throws Exception {
        Map<String, Object> result = new HashMap<>();

        Kit kit = kitRepository.findById(kitId)
                .orElseThrow(() -> new RuntimeException("Kit no encontrado"));

        User tenant = userRepository.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Tenant no encontrado"));

        User owner = kit.getOwner();
        if (owner == null) {
            throw new RuntimeException("El kit no tiene propietario");
        }

        PaymentData ownerPaymentData = owner.getPaymentData();
        if (ownerPaymentData == null || ownerPaymentData.getStripeAccountId() == null) {
            throw new RuntimeException("El propietario no tiene Stripe Connect configurado");
        }

        try {
            // Recuperar y confirmar el Payment Intent
            PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);

            if (!paymentIntent.getStatus().equals("succeeded")) {
                throw new RuntimeException("El pago no fue completado, estado: " + paymentIntent.getStatus());
            }

            // Guardar el ID del payment intent en el kit
            kit.setStripePaymentIntentId(paymentIntent.getId());
            kit.setStatus(KitStatus.PAID);
            kitRepository.save(kit);

            // Actualizar wallets para tracking local
            Wallet tenantWallet = tenant.getWallet();
            Wallet ownerWallet = owner.getWallet();

            if (tenantWallet == null) {
                tenantWallet = createWallet(tenant);
            }
            if (ownerWallet == null) {
                ownerWallet = createWallet(owner);
            }

            // Actualizar saldos en la wallet local
            Double amount = kit.getTotalPrice();
            Double platformFeeAmount = platformFeePercentage * amount;

            tenantWallet.subtractBalance(amount);
            ownerWallet.addBalance(amount - platformFeeAmount); // Owner recibe sin comisión

            walletRepository.save(tenantWallet);
            walletRepository.save(ownerWallet);

            // Registrar transacciones
            WalletTransaction tenantTransaction = new WalletTransaction(
                    tenantWallet,
                    amount,
                    TransactionType.PAYMENT,
                    "Pago del kit: " + kit.getName() + " (Stripe PI: " + paymentIntent.getId() + ")",
                    kitId
            );

            WalletTransaction ownerTransaction = new WalletTransaction(
                    ownerWallet,
                    amount - platformFeeAmount,
                    TransactionType.EARNING,
                    "Ganancia por kit alquilado: " + kit.getName() + " (Stripe PI: " + paymentIntent.getId() + ")",
                    kitId
            );

            walletTransactionRepository.save(tenantTransaction);
            walletTransactionRepository.save(ownerTransaction);

            result.put("success", true);
            result.put("message", "Pago procesado exitosamente");
            result.put("kitId", kitId);
            result.put("amount", amount);
            result.put("platformFee", platformFeeAmount);
            result.put("ownerReceives", amount - platformFeeAmount);
            result.put("paymentIntentId", paymentIntent.getId());
            result.put("paymentStatus", paymentIntent.getStatus());

        } catch (Exception e) {
            System.err.println("Error procesando pago Stripe: " + e.getMessage());
            throw new RuntimeException("Error procesando pago: " + e.getMessage());
        }

        return result;
    }

    /**
     * Reembolsa un pago completamente
     */
    @Transactional
    public Map<String, Object> refundPayment(Long kitId) throws Exception {
        Kit kit = kitRepository.findById(kitId)
                .orElseThrow(() -> new RuntimeException("Kit no encontrado"));

        if (kit.getStripePaymentIntentId() == null) {
            throw new RuntimeException("El kit no tiene un payment intent asociado");
        }

        PaymentIntent paymentIntent = PaymentIntent.retrieve(kit.getStripePaymentIntentId());

        // Retrieve charges associated with the payment intent
        Map<String, Object> chargeParams = new HashMap<>();
        chargeParams.put("payment_intent", kit.getStripePaymentIntentId());
        List<Charge> charges = Charge.list(chargeParams).getData();
        
        if (charges == null || charges.isEmpty()) {
            throw new RuntimeException("No se encontró cargo asociado al pago");
        }
        
        Charge charge = charges.get(0);

        RefundCreateParams refundParams = RefundCreateParams.builder()
                .setCharge(charge.getId())
                .setReason(RefundCreateParams.Reason.REQUESTED_BY_CUSTOMER)
                .build();

        Refund refund = Refund.create(refundParams);

        // Revertir cambios en wallets
        Wallet tenantWallet = kit.getTenant().getWallet();
        Wallet ownerWallet = kit.getOwner().getWallet();

        Double amount = kit.getTotalPrice();
        tenantWallet.addBalance(amount);
        ownerWallet.subtractBalance(amount);

        walletRepository.save(tenantWallet);
        walletRepository.save(ownerWallet);

        // Registrar transacciones de reembolso
        WalletTransaction tenantRefund = new WalletTransaction(
                tenantWallet,
                amount,
                TransactionType.PAYMENT,
                "REEMBOLSO: " + kit.getName(),
                kitId
        );

        WalletTransaction ownerRefund = new WalletTransaction(
                ownerWallet,
                -amount,
                TransactionType.EARNING,
                "REEMBOLSO MENOS: " + kit.getName(),
                kitId
        );

        walletTransactionRepository.save(tenantRefund);
        walletTransactionRepository.save(ownerRefund);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Reembolso procesado exitosamente");
        response.put("refundId", refund.getId());
        response.put("amount", amount);
        return response;
    }

    /**
     * Obtiene el historial de transacciones de un usuario
     */
    public List<WalletTransaction> getUserTransactions(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Wallet wallet = user.getWallet();
        if (wallet == null) {
            throw new RuntimeException("El usuario no tiene wallet");
        }

        return walletTransactionRepository.findByWalletId(wallet.getId());
    }

    /**
     * Obtiene el saldo de un usuario
     */
    public Map<String, Object> getUserBalance(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Wallet wallet = user.getWallet();
        if (wallet == null) {
            throw new RuntimeException("El usuario no tiene wallet");
        }

        Map<String, Object> balance = new HashMap<>();
        balance.put("userId", userId);
        balance.put("availableBalance", wallet.getAvailableBalance());
        balance.put("pendingBalance", wallet.getPendingBalance());
        balance.put("currency", wallet.getCurrency());
        balance.put("totalBalance", wallet.getAvailableBalance() + wallet.getPendingBalance());

        return balance;
    }

    /**
     * Obtiene la información de pago de un usuario
     */
    public Map<String, Object> getUserPaymentInfo(Long userId) throws Exception {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        PaymentData paymentData = user.getPaymentData();
        if (paymentData == null) {
            throw new RuntimeException("Datos de pago no encontrados");
        }

        Account stripeAccount = null;
        if (paymentData.getStripeAccountId() != null) {
            stripeAccount = Account.retrieve(paymentData.getStripeAccountId());
        }

        Map<String, Object> info = new HashMap<>();
        info.put("paymentDataId", paymentData.getId());
        info.put("stripeAccountId", paymentData.getStripeAccountId());
        info.put("isVerified", paymentData.getIsVerified());
        
        if (stripeAccount != null) {
            info.put("chargesEnabled", stripeAccount.getChargesEnabled());
            info.put("payoutsEnabled", stripeAccount.getPayoutsEnabled());
            info.put("accountStatus", stripeAccount.getId());
        }

        return info;
    }

    /**
     * Obtiene las transacciones relacionadas a un kit específico
     */
    public List<WalletTransaction> getKitTransactions(Long kitId) {
        return walletTransactionRepository.findByRelatedKitId(kitId);
    }
}
