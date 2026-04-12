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
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.dto.KitPaymentDTO;
import com.example.demo.dto.UserResponse;
import com.example.demo.repository.TransactionRepository;
import com.example.demo.repository.KitRepository;

import com.stripe.Stripe;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.exception.StripeException;
import java.util.HashMap;
import java.util.Map;
import com.stripe.model.Payout;

import com.example.demo.exception.UserNotFoundException;
import com.example.demo.exception.NotEnoughBalanceException;

import jakarta.annotation.PostConstruct;

@Service
public class PaymentService {

    private final GuaranteeReturnEmailService guaranteeReturnEmailService;

    @Value("${ADMIN_EMAIL:admin@keakit.com}")
    private String KEAKIT_ADMIN_EMAIL;

    @Autowired
    private PlatformConfigService platformConfigService;

    @Autowired
    private WalletService walletService;

    @Autowired
    private KitService kitService;

    @Autowired
    private ItemService itemService;

    @Autowired
    private OrderConfirmationEmailService emailService;

    @Autowired
    private UserService userService;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private KitRepository kitRepository;

    @Autowired
    private PromoCodeService promoCodeService;


    @Value("${stripe.api.key}")
    private String stripeApiKey;

    public PaymentService(GuaranteeReturnEmailService guaranteeReturnEmailService) {
        this.guaranteeReturnEmailService = guaranteeReturnEmailService;
    }

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
        PaymentIntent intent = createStripePaymentIntent(params);
        System.out.println(intent.getId());
        System.out.println(intent.getClientSecret());
        return intent;
    }

    public PaymentIntent createStripePaymentIntent(PaymentIntentCreateParams params) throws StripeException {
        return PaymentIntent.create(params);
    }

    @Transactional
    public void processPayment(Long kitId, Boolean payWithWallet, String promoCode, String userEmail)
            throws ResourceNotFoundException, UserNotFoundException, NotEnoughBalanceException {

        KitResponse kit = kitService.findById(kitId);
        KitPaymentDTO paymentInfo = kitService.getKitPayment(kitId, promoCode, userEmail);

        if (payWithWallet) {
            processTenantPayment(kit.getTenantId(), paymentInfo);
        }

        processGuarantee(paymentInfo.guarantee());

        double months = kitService.calculateMonthsBetween(kit.getStartDate(), kit.getEndDate());

        kit.getItems().forEach(item -> processItemPaymentToOwner(item, months));

        kitService.markAsPaid(kitId);
        Kit kitEntity = kitRepository.findById(kitId)
                .orElseThrow(() -> new ResourceNotFoundException("Kit not found for email confirmation"));

        double discountEuros = paymentInfo.discount() != null ? paymentInfo.discount() / 100.0 : 0.0;
        emailService.sendOrderConfirmation(kitEntity, discountEuros, promoCode);

        if (promoCode != null && !promoCode.isBlank() && userEmail != null) {
            promoCodeService.markAsUsed(promoCode, userEmail);
        }
    }

    @Transactional
    public void processPayment(Long kitId, Boolean payWithWallet)
            throws ResourceNotFoundException, UserNotFoundException, NotEnoughBalanceException {
        processPayment(kitId, payWithWallet, null, null);
    }

    private void processTenantPayment(Long tenantId, KitPaymentDTO paymentInfo) {
        Double amount = toEuros(paymentInfo.totalPrice());
        Transaction payment = payWithWallet(tenantId, amount);
        transactionRepository.save(payment);
    }

    private void processGuarantee(Integer guaranteeRaw) throws ResourceNotFoundException, UserNotFoundException {
        Double guaranteeAmount = toEuros(guaranteeRaw);
        Transaction guaranteeTransaction = sendGuaranteeToKeaKit(guaranteeAmount);
        transactionRepository.save(guaranteeTransaction);
    }

    private void processItemPaymentToOwner(KitItemResponse item, double months) throws ResourceNotFoundException {
        Long ownerId = item.getOwnerId();
        if (ownerId == null) {
            Item itemDetails = itemService.findById(item.getItemId());
            ownerId = itemDetails.getOwner().getId();
        }

        double basePrice = item.getPricePerMonth() * item.getQuantity() * months;
        Double finalPrice = calculateFinalOwnerPrice(basePrice);

        Transaction payOwnerTransaction = payItemToOwner(ownerId, finalPrice);
        transactionRepository.save(payOwnerTransaction);
    }

    private Double calculateFinalOwnerPrice(double basePrice) {
        // TODO: Añadir lógica real para determinar si el usuario es piloto o no, y obtener la tasa de comisión real desde la configuración
        boolean isPilotUser = true;
        if (isPilotUser) {
            return toMoney(basePrice);
        }

        double rate = platformConfigService.getCommissionRate();
        Double feeAmount = toMoney(basePrice * rate);

        transactionRepository.save(transferFee(feeAmount));
        return toMoney(basePrice * (1 - rate));
    }

    private void completeOrder(Long kitId) throws ResourceNotFoundException {
        kitService.markAsPaid(kitId);
        Kit kitEntity = kitRepository.findById(kitId)
                .orElseThrow(() -> new ResourceNotFoundException("Kit not found for email confirmation"));
        emailService.sendOrderConfirmation(kitEntity);
    }

    @Transactional
    public Double processGuaranteeReturn(Long kitId, Long ownerId, Long tenantId, String condition) throws Exception {
        // 1. Obtenemos la cantidad exacta de la fianza para este Kit
        KitPaymentDTO paymentInfo = kitService.getKitPayment(kitId);
        Double guaranteeAmount = toEuros(paymentInfo.guarantee());

        // 2. Extraemos el dinero del monedero de KeaKit (que lo estaba custodiando)
        Wallet keakitWallet = getKeaKitWallet();
        Transaction keakitDeduct = new Transaction(-guaranteeAmount, keakitWallet, TransactionType.GUARANTEE_REFUND);
        transactionRepository.save(keakitDeduct);

        // 3. Destinamos el dinero al monedero correspondiente
        if ("GOOD".equalsIgnoreCase(condition)) {
            // Devolvemos la fianza al monedero del inquilino
            Wallet tenantWallet = walletService.getWalletByUserId(tenantId);
            Transaction tenantReceive = new Transaction(guaranteeAmount, tenantWallet,
                    TransactionType.GUARANTEE_REFUND);
            transactionRepository.save(tenantReceive);
            guaranteeReturnEmailService.sendGuaranteeNotification(kitId);

        } else if ("DAMAGED".equalsIgnoreCase(condition)) {
            // Compensamos al propietario enviando la fianza a su monedero
            Wallet ownerWallet = walletService.getWalletByUserId(ownerId);
            Transaction ownerReceive = new Transaction(guaranteeAmount, ownerWallet, TransactionType.PAYOUT);
            transactionRepository.save(ownerReceive);

        } else {
            throw new IllegalArgumentException("Condición no válida. Usa GOOD o DAMAGED.");
        }

        return guaranteeAmount;
    }

    private Double toMoney(Double amount) {
        return Math.round(amount * 100.0) / 100.0;
    }

    private Transaction payWithWallet(Long tenantId, Double amount)
            throws ResourceNotFoundException, NotEnoughBalanceException {
        Wallet tenantWallet = walletService.getWalletByUserId(tenantId);
        if (tenantWallet.getBalance() < amount) {
            throw new NotEnoughBalanceException(
                    "Not enough balance in wallet. Required: " + amount + ", Available: " + tenantWallet.getBalance());
        }
        Transaction givePayment = new Transaction(-amount, tenantWallet, TransactionType.PAYOUT);
        return givePayment;
    }

    private Transaction sendGuaranteeToKeaKit(Double guarantee)
            throws ResourceNotFoundException, UserNotFoundException {
        Wallet keakitWallet = getKeaKitWallet();
        Transaction guaranteeTransaction = new Transaction(guarantee, keakitWallet, TransactionType.GUARANTEE_DEPOSIT);
        return guaranteeTransaction;
    }

    private Transaction payItemToOwner(Long ownerId, Double amount) throws ResourceNotFoundException {
        Wallet ownerWallet = walletService.getWalletByUserId(ownerId);
        Transaction payOwnerTransaction = new Transaction(amount, ownerWallet, TransactionType.PAYOUT);
        return payOwnerTransaction;
    }

    private Transaction transferFee(Double amount) throws ResourceNotFoundException, UserNotFoundException {
        Wallet keakitWallet = getKeaKitWallet();
        Transaction feeTransaction = new Transaction(amount, keakitWallet, TransactionType.FEE);
        return feeTransaction;
    }

    private Double toEuros(Integer amountInCents) {
        return amountInCents / 100.0;
    }

    private Wallet getKeaKitWallet() throws ResourceNotFoundException, UserNotFoundException {
        UserResponse keakitAdmin = userService.getUserByEmail(KEAKIT_ADMIN_EMAIL);
        Wallet keakitWallet = walletService.getWalletByUserId(keakitAdmin.getId());
        return keakitWallet;
    }

    public Payout createPayout(Long amountInCents) throws StripeException {
        Stripe.apiKey = stripeApiKey;

        Map<String, Object> params = new HashMap<>();
        params.put("amount", amountInCents);
        params.put("currency", "eur");
        params.put("destination", "btok_fr");
        Payout payout = createStripePayout(params);

        return payout;
    }

    public Payout createStripePayout(Map<String, Object> params) throws StripeException {
        return Payout.create(params);
    }

    private boolean isValidIban(String iban) {
        if (iban == null) {
            return false;
        }

        String normalized = iban.replaceAll("\\s+", "").toUpperCase();
        if (!normalized.matches("^[A-Z]{2}\\d{2}[A-Z0-9]{11,30}$")) {
            return false;
        }

        String rearranged = normalized.substring(4) + normalized.substring(0, 4);
        int remainder = 0;

        for (char character : rearranged.toCharArray()) {
            String chunk = Character.isLetter(character)
                    ? String.valueOf(character - 'A' + 10)
                    : String.valueOf(character);

            for (char digit : chunk.toCharArray()) {
                remainder = (remainder * 10 + Character.getNumericValue(digit)) % 97;
            }
        }

        return remainder == 1;
    }

    @Transactional
    public void withdrawToBank(Long userId, Double amount, String bankAccount)
            throws ResourceNotFoundException, NotEnoughBalanceException, StripeException {

        if (amount == null || amount <= 0) {
            throw new IllegalArgumentException("La cantidad debe ser mayor que 0");
        }

        if (bankAccount == null || bankAccount.isBlank()) {
            throw new IllegalArgumentException("La cuenta bancaria es obligatoria");
        }

        if (!isValidIban(bankAccount)) {
            throw new IllegalArgumentException("La cuenta bancaria debe ser un IBAN valido");
        }

        Wallet wallet = walletService.getWalletByUserId(userId);

        if (wallet.getBalance() < amount) {
            throw new NotEnoughBalanceException(
                    "Not enough balance" + " Required: " + amount + ", Available: " + wallet.getBalance());
        }

        Long amountInCents = (long) (amount * 100);
        // Sacar dinero de Stripe en centimos
        createPayout(amountInCents);
        // Restar saldo de la wallet del usuario
        walletService.updateWalletBalance(userId, amount);
    }

}
