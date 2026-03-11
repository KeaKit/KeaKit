package com.example.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.model.Transaction;
import com.example.demo.model.TransactionType;
import com.example.demo.model.Wallet;
import com.example.demo.model.Item;
import com.example.demo.model.Kit;
import com.example.demo.dto.KitResponse;
import com.example.demo.dto.KitResponse.KitItemResponse;
import com.example.demo.dto.KitPaymentDTO;
import com.example.demo.repository.TransactionRepository;
import com.example.demo.repository.KitRepository;

import com.stripe.Stripe;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.exception.StripeException;

import jakarta.annotation.PostConstruct;

@Service
public class PaymentService {

    // TODO: Crear una wallet fija para observar el dinero que administra la empresa
    private static final Long KEAKIT_WALLET_ID = 1L;
    private static final Double PLATFORM_FEE_PERCENTAGE = 0.2;

    @Autowired
    private WalletService walletService;

    @Autowired
    private KitService kitService;

    @Autowired
    private ItemService itemService;

    @Autowired
    private OrderConfirmationEmailService emailService;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private KitRepository kitRepository;

    @Value("${stripe.api.key}")
    private String stripeApiKey;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeApiKey;
    }

    public PaymentIntent createPaymentIntent(Long amount) throws StripeException {
        Stripe.apiKey = stripeApiKey;
        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amount)
                .setCurrency("eur")
                .setAutomaticPaymentMethods(
                        PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                .setEnabled(true)
                                .setAllowRedirects(
                                        PaymentIntentCreateParams.AutomaticPaymentMethods.AllowRedirects.NEVER)
                                .build())
                .build();
        PaymentIntent intent = PaymentIntent.create(params);
        System.out.println(intent.getId());
        System.out.println(intent.getClientSecret());
        return intent;
    }

    @Transactional
    public void processPayment(Long kitId, Boolean payWithWallet) throws RuntimeException {
        try {
            // 1. Cobrar al arrendatario
            KitResponse kit = kitService.findById(kitId);
            System.out.println("Procesando pago para kitId: " + kitId + ", tenantId: " + kit.getTenantId() + ", payWithWallet: " + payWithWallet);
            Long tenantId = kit.getTenantId();
            KitPaymentDTO paymentInfo = kitService.getKitPayment(kitId);
            Double amount = toEuros(paymentInfo.totalPrice());
            if (payWithWallet) {
                // 1.1. Cobramos de su cartera si paga con wallet
                Transaction givePayment = payWithWallet(tenantId, amount);
                transactionRepository.save(givePayment);
            }
            // 1.2. Si no paga con wallet, se asume que el pago se ha procesado
            // correctamente a través de Stripe (ya que esta función se llama desde el
            // webhook de Stripe una vez confirmado el pago)
            // 2. Transferimos la fianza (guarantee) a la cartera de KeaKit
            Double guaranteeAmount = toEuros(paymentInfo.guarantee());
            Transaction guaranteeTransaction = sendGuaranteeToKeaKit(guaranteeAmount);
            System.out.println("Transferencia de garantía a KeaKit: " + guaranteeAmount + " euros");
            transactionRepository.save(guaranteeTransaction);
            System.out.println("Garantía transferida a KeaKit. Procesando pagos a propietarios de items...");


            for (KitItemResponse item : kit.getItems()) {
                System.out.println("Procesando pago para itemId: " + item.getItemId() + ", quantity: " + item.getQuantity() + ", pricePerMonth: " + item.getPricePerMonth());
                // 3. Pagamos al propietario de cada item
                Item itemDetails = itemService.findById(item.getItemId());
                Long ownerId = itemDetails.getOwner().getId();
                System.out.println("Propietario del itemId " + item.getItemId() + ": userId " + ownerId);

                // TODO: Reemplazar por lógica real para determinar si el usuario es piloto o no
                Boolean isPilotUser = true;
                Double itemPrice = toMoney(item.getPricePerMonth() * item.getQuantity());
                // itemPrice está redondeado a 2 decimales

                if (!isPilotUser) {
                    // 4. Si el usuario no es piloto, aplicamos la comisión de la plataforma
                    itemPrice = toMoney(item.getPricePerMonth() * item.getQuantity() * (1 - PLATFORM_FEE_PERCENTAGE));
                    Double feeAmount = toMoney(item.getPricePerMonth() * item.getQuantity() * PLATFORM_FEE_PERCENTAGE);
                    Transaction feeTransaction = transferFee(feeAmount);
                    transactionRepository.save(feeTransaction);
                }
                System.out.println("Creando transacciones para los owners...");

                Transaction payOwnerTransaction = payItemToOwner(ownerId, itemPrice);
                transactionRepository.save(payOwnerTransaction);
            }
            // 5. Marcamos el kit como pagado
            kitService.markAsPaid(kitId);
            // 6. Enviamos email de confirmación al arrendatario
            // TODO: Utilizar KitResponse
            Kit kitEntity = kitRepository.findById(kitId).orElseThrow(() -> new RuntimeException("Kit not found"));
            emailService.sendOrderConfirmation(kitEntity);

        } catch (Exception e) {
            throw new RuntimeException("Error processing payment: " + e.getMessage());
        }
    }

    private Double toMoney(Double amount) {
        return Math.round(amount * 100.0) / 100.0;
    }

    private Transaction payWithWallet(Long tenantId, Double amount) throws RuntimeException {
        Wallet tenantWallet = walletService.getWalletByUserId(tenantId);
        if (tenantWallet.getBalance() < amount) {
            throw new RuntimeException("Not enough balance in wallet");
        }
        Transaction givePayment = new Transaction(-amount, tenantWallet, TransactionType.PAYOUT);
        return givePayment;
    }

    private Transaction sendGuaranteeToKeaKit(Double guarantee) throws RuntimeException {
        Wallet keakitWallet = walletService.getWalletByUserId(KEAKIT_WALLET_ID);
        Transaction guaranteeTransaction = new Transaction(guarantee, keakitWallet, TransactionType.GUARANTEE_DEPOSIT);
        return guaranteeTransaction;
    }

    private Transaction payItemToOwner(Long ownerId, Double amount) throws RuntimeException {
        Wallet ownerWallet = walletService.getWalletByUserId(ownerId);
        Transaction payOwnerTransaction = new Transaction(amount, ownerWallet, TransactionType.PAYOUT);
        return payOwnerTransaction;
    }

    private Transaction transferFee(Double amount) throws RuntimeException {
        Wallet keakitWallet = walletService.getWalletByUserId(KEAKIT_WALLET_ID);
        Transaction feeTransaction = new Transaction(amount, keakitWallet, TransactionType.FEE);
        return feeTransaction;
    }

    private Double toEuros(Integer amountInCents) {
        return amountInCents / 100.0;
    }

}
