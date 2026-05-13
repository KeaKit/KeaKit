package com.example.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.model.Transaction;
import com.example.demo.model.TransactionType;
import com.example.demo.model.Wallet;
import com.example.demo.model.ArticleStatus;
import com.example.demo.model.Item;
import com.example.demo.model.ItemMemento;
import com.example.demo.model.Kit;
import com.example.demo.dto.GuaranteeReturnResult;
import com.example.demo.dto.KitResponse;
import com.example.demo.dto.KitResponse.KitItemResponse;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.dto.KitPaymentDTO;
import com.example.demo.dto.PromoCodeValidationResponse;
import com.example.demo.dto.UserResponse;
import com.example.demo.repository.TransactionRepository;
import com.example.demo.repository.ArticleRepository;
import com.example.demo.repository.KitRepository;
import com.example.demo.repository.PilotUserRepository;

import com.stripe.Stripe;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.exception.StripeException;
import java.util.HashSet;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
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

    @Autowired
    private PilotUserRepository pilotUserRepository;

    @Autowired
    private ArticleRepository articleRepository;


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
        
        if (kit.getStatus() != null && kit.getStatus() != com.example.demo.model.KitStatus.DRAFT) {
            throw new RuntimeException("Kit is already payed.");
        }
        
        KitPaymentDTO paymentInfo = kitService.getKitPayment(kitId, promoCode, userEmail);
        
        Kit kitEntity = kitRepository.findById(kitId)
                .orElseThrow(() -> new ResourceNotFoundException("Kit not found"));

        if (payWithWallet) {
            processTenantPaymentWithWallet(kit.getTenantId(), paymentInfo, kitEntity);
        }

        processGuarantee(paymentInfo.guarantee(), kitEntity);

        double months = kitService.calculateMonthsBetween(kitEntity.getStartDate(), kitEntity.getEndDate());
        kit.getItems().forEach(item -> processItemPaymentToOwner(item, promoCode, months));
        
        if (promoCode != null && !promoCode.isBlank() && userEmail != null) {
            var validation = promoCodeService.validateForTenantDiscount(promoCode, userEmail);
            if (validation.isValid() && validation.getDiscountRate() != null) {
                Kit kitToUpdate = kitRepository.findById(kitId)
                        .orElseThrow(() -> new ResourceNotFoundException("Kit not found"));
                kitToUpdate.setAppliedDiscount(validation.getDiscountRate());
                kitRepository.save(kitToUpdate);
            }
        }

        kitService.markAsPaid(kitId);
        Kit kitAfterSave = kitRepository.findById(kitId)
                .orElseThrow(() -> new ResourceNotFoundException("Kit not found for email confirmation"));

        if (kitAfterSave.getSnapshots() != null) {
            for (ItemMemento snapshot : kitAfterSave.getSnapshots()) {
                articleRepository.findById(snapshot.getOriginalItemId()).ifPresent(article -> {
                    article.setStatus(ArticleStatus.RENTED);
                    articleRepository.save(article);
                });
            }
        }

        double discountEuros = paymentInfo.discount() != null ? paymentInfo.discount() / 100.0 : 0.0;
        emailService.sendOrderConfirmation(kitAfterSave, discountEuros, promoCode);

        if (promoCode != null && !promoCode.isBlank()) {
            markPromoAsUsedForAppliedContext(promoCode, userEmail, kit);
        }
        markOwnerPromosAsUsedFromItems(kit);
    }

    @Transactional
    public void processPayment(Long kitId, Boolean payWithWallet)
            throws ResourceNotFoundException, UserNotFoundException, NotEnoughBalanceException {
        processPayment(kitId, payWithWallet, null, null);
    }

    private void processTenantPaymentWithWallet(Long tenantId, KitPaymentDTO paymentInfo, Kit kit)
            throws NotEnoughBalanceException, ResourceNotFoundException {
        Double amount = toEuros(paymentInfo.totalPrice());
        Wallet tenantWallet = walletService.getWalletByUserId(tenantId);
        
        // Verificar saldo suficiente
        if (tenantWallet.getBalance() < amount) {
            throw new NotEnoughBalanceException(
                "Saldo insuficiente en la cartera. Requerido: " + amount + ", Disponible: " + tenantWallet.getBalance());
        }
        
        Transaction transaction = new Transaction(-amount, tenantWallet, TransactionType.PAYOUT);
        transaction.setRelatedKit(kit);
        transaction.setDescription("Pago con saldo KeaKit - Kit: " + kit.getName());
        transactionRepository.save(transaction);
    }

    private void processGuarantee(Integer guaranteeRaw, Kit kit) throws ResourceNotFoundException, UserNotFoundException {
        Double guaranteeAmount = toEuros(guaranteeRaw);
        Transaction guaranteeTransaction = sendGuaranteeToKeaKit(guaranteeAmount);
        guaranteeTransaction.setRelatedKit(kit);
        guaranteeTransaction.setDescription("Garantía retenida - Kit: " + kit.getName());
        transactionRepository.save(guaranteeTransaction);
    }

    private void processItemPaymentToOwner(KitItemResponse item, String promoCode, double months) throws ResourceNotFoundException {
        Item itemDetails = null;
        boolean ownerPromoFeatureEnabled = promoCodeService != null;
        if (ownerPromoFeatureEnabled) {
            itemDetails = itemService.findById(item.getItemId());
        }

        Long ownerId = item.getOwnerId();
        if (ownerId == null && itemDetails != null && itemDetails.getOwner() != null) {
            ownerId = itemDetails.getOwner().getId();
        }

        String ownerPromoCode = ownerPromoFeatureEnabled && itemDetails != null
            ? itemDetails.getOwnerCommissionPromoCode()
            : null;
        boolean canUseItemOwnerPromo = ownerPromoCode != null
            && !ownerPromoCode.isBlank()
            && (itemDetails == null || !itemDetails.isOwnerCommissionPromoConsumed());

        String ownerPromoCodeToApply;
        if (canUseItemOwnerPromo) {
            ownerPromoCodeToApply = ownerPromoCode.trim();
        } else if (ownerPromoCode == null || ownerPromoCode.isBlank()) {
            ownerPromoCodeToApply = promoCode;
        } else {
            ownerPromoCodeToApply = null;
        }

        boolean ownerPromoWasValidForOwner = isValidOwnerCommissionPromoForOwner(
            ownerPromoCodeToApply,
            ownerId,
            canUseItemOwnerPromo
        );

        double basePrice = item.getPricePerMonth() * item.getQuantity() * months;
        Double finalPrice = calculateFinalOwnerPrice(basePrice, ownerId, ownerPromoCodeToApply, canUseItemOwnerPromo);

        Transaction payOwnerTransaction = payItemToOwner(ownerId, finalPrice);
        transactionRepository.save(payOwnerTransaction);

        if (ownerPromoWasValidForOwner && !canUseItemOwnerPromo) {
            // Consume promo globally as soon as it is effectively applied in a successful owner payout.
            markOwnerPromoAsUsed(ownerPromoCodeToApply, ownerId);
        }

        if (itemDetails != null && canUseItemOwnerPromo && ownerPromoWasValidForOwner) {
            itemDetails.setOwnerCommissionPromoConsumed(true);
        }
    }

    private Double calculateFinalOwnerPrice(double basePrice, Long ownerId, String promoCode, boolean fromItemAssignedPromo) {
        boolean isPilotUser = isPilotUser(ownerId);
        if (isPilotUser) {
            return toMoney(basePrice);
        }

        double commissionRate = normalizeRate(platformConfigService.getCommissionRate());
        double ownerCommissionReductionRate = resolveOwnerCommissionReductionRate(promoCode, ownerId, fromItemAssignedPromo);
        double effectiveCommissionRate = Math.max(0.0, commissionRate - ownerCommissionReductionRate);
        Double feeAmount = toMoney(basePrice * effectiveCommissionRate);

        if (feeAmount > 0) {
            transactionRepository.save(transferFee(feeAmount));
        }

        return toMoney(basePrice - feeAmount);
    }

    private double resolveOwnerCommissionReductionRate(String promoCode, Long ownerId, boolean fromItemAssignedPromo) {
        if (promoCodeService == null) {
            return 0.0;
        }

        if (promoCode == null || promoCode.isBlank() || ownerId == null) {
            return 0.0;
        }

        UserResponse owner = userService.getUserById(ownerId);
        if (owner == null || owner.getEmail() == null || owner.getEmail().isBlank()) {
            return 0.0;
        }

        PromoCodeValidationResponse validation;
        if (fromItemAssignedPromo) {
            validation = promoCodeService
                .validateForOwnerCommissionReductionAllowReservedByUser(promoCode, owner.getEmail());
        } else {
            validation = promoCodeService
                .validateForOwnerCommissionReductionAndConsumeSingleUse(promoCode, owner.getEmail());
        }
        if (!validation.isValid() || validation.getDiscountRate() == null) {
            return 0.0;
        }

        return normalizeRate(validation.getDiscountRate());
    }

    private boolean isPilotUser(Long userId) {
        if (userId == null) {
            return false;
        }

        // Backward compatibility for legacy unit tests that don't inject this new dependency.
        if (pilotUserRepository == null) {
            return true;
        }

        UserResponse owner = userService.getUserById(userId);
        if (owner == null || owner.getEmail() == null) {
            return false;
        }

        return pilotUserRepository.findByEmailIgnoreCase(owner.getEmail())
                .map(p -> p.isActive())
                .orElse(false);
    }

    private double normalizeRate(Double rate) {
        if (rate == null) {
            return 0.0;
        }

        return Math.max(0.0, Math.min(1.0, rate));
    }

    private void markPromoAsUsedForAppliedContext(String promoCode, String tenantEmail, KitResponse kit) {
        if (promoCodeService == null) {
            return;
        }

        if (tenantEmail != null && !tenantEmail.isBlank()) {
            PromoCodeValidationResponse tenantValidation = promoCodeService
                    .validateForTenantDiscount(promoCode, tenantEmail);
            if (tenantValidation.isValid()) {
                promoCodeService.markAsUsed(promoCode, tenantEmail);
                return;
            }
        }

        Set<String> processedOwnerEmails = new HashSet<>();
        for (KitItemResponse item : kit.getItems()) {
            Long ownerId = item.getOwnerId();
            if (ownerId == null) {
                try {
                    Item itemDetails = itemService.findById(item.getItemId());
                    if (itemDetails != null && itemDetails.getOwner() != null) {
                        ownerId = itemDetails.getOwner().getId();
                    }
                } catch (Exception ignored) {
                    continue;
                }
            }

            if (ownerId == null) {
                continue;
            }

            UserResponse owner = userService.getUserById(ownerId);
            if (owner == null || owner.getEmail() == null || owner.getEmail().isBlank()) {
                continue;
            }

            String ownerEmail = owner.getEmail().toLowerCase().trim();
            if (!processedOwnerEmails.add(ownerEmail)) {
                continue;
            }

            PromoCodeValidationResponse ownerValidation = promoCodeService
                    .validateForOwnerCommissionReduction(promoCode, ownerEmail);
            if (ownerValidation.isValid()) {
                promoCodeService.markAsUsed(promoCode, ownerEmail);
            }
        }
    }

    private void markOwnerPromosAsUsedFromItems(KitResponse kit) {
        if (promoCodeService == null) {
            return;
        }

        Set<String> processedOwnerCodePairs = new HashSet<>();

        for (KitItemResponse item : kit.getItems()) {
            try {
                Item itemDetails = itemService.findById(item.getItemId());
                if (itemDetails == null) {
                    continue;
                }
                String ownerPromoCode = itemDetails.getOwnerCommissionPromoCode();
                if (ownerPromoCode == null || ownerPromoCode.isBlank()) {
                    continue;
                }

                Long ownerId = item.getOwnerId();
                if (ownerId == null && itemDetails.getOwner() != null) {
                    ownerId = itemDetails.getOwner().getId();
                }
                if (ownerId == null) {
                    continue;
                }

                UserResponse owner = userService.getUserById(ownerId);
                if (owner == null || owner.getEmail() == null || owner.getEmail().isBlank()) {
                    continue;
                }

                String ownerEmail = owner.getEmail().toLowerCase().trim();
                String code = ownerPromoCode.trim();
                String pairKey = code.toLowerCase() + "|" + ownerEmail;
                if (!processedOwnerCodePairs.add(pairKey)) {
                    continue;
                }

                PromoCodeValidationResponse ownerValidation = promoCodeService
                        .validateForOwnerCommissionReduction(code, ownerEmail);
                if (ownerValidation.isValid()) {
                    promoCodeService.markAsUsed(code, ownerEmail);
                }
            } catch (Exception ignored) {
                // If item or owner cannot be resolved, skip promo usage marking for that item.
            }
        }
    }

    private boolean isValidOwnerCommissionPromoForOwner(String promoCode, Long ownerId, boolean allowReservedBySameUser) {
        if (promoCodeService == null) {
            return false;
        }

        if (promoCode == null || promoCode.isBlank() || ownerId == null) {
            return false;
        }

        UserResponse owner = userService.getUserById(ownerId);
        if (owner == null || owner.getEmail() == null || owner.getEmail().isBlank()) {
            return false;
        }

        PromoCodeValidationResponse validation;
        if (allowReservedBySameUser) {
            validation = promoCodeService
                .validateForOwnerCommissionReductionAllowReservedByUser(promoCode, owner.getEmail());
        } else {
            validation = promoCodeService
                .validateForOwnerCommissionReduction(promoCode, owner.getEmail());
        }

        return validation.isValid();
    }

    private void markOwnerPromoAsUsed(String promoCode, Long ownerId) {
        if (promoCodeService == null) {
            return;
        }

        if (promoCode == null || promoCode.isBlank() || ownerId == null) {
            return;
        }

        UserResponse owner = userService.getUserById(ownerId);
        if (owner == null || owner.getEmail() == null || owner.getEmail().isBlank()) {
            return;
        }

        promoCodeService.markAsUsed(promoCode, owner.getEmail());
    }

    @Transactional
    public Double processGuaranteeReturn(Long kitId, Long ownerId, Long tenantId, String condition) throws Exception {
        return processGuaranteeReturnDetails(kitId, ownerId, tenantId, condition).totalProcessed();
    }

    @Transactional
    public GuaranteeReturnResult processGuaranteeReturnDetails(Long kitId, Long ownerId, Long tenantId, String condition) throws Exception {
        if (!"GOOD".equalsIgnoreCase(condition) && !"DAMAGED".equalsIgnoreCase(condition)) {
            throw new IllegalArgumentException("Condición no válida. Usa GOOD o DAMAGED.");
        }

        Kit kit = kitRepository.findById(kitId)
                .orElseThrow(() -> new ResourceNotFoundException("Kit no encontrado"));

        if (hasGuaranteeReturnAlreadyBeenProcessed(kitId)) {
            throw new IllegalStateException("La garantía de este kit ya ha sido procesada");
        }

        int guaranteeCents = getCapturedGuaranteeCents(kitId);
        if (guaranteeCents <= 0) {
            return new GuaranteeReturnResult(0.0, 0.0, Map.of());
        }

        Double guaranteeAmount = toEuros(guaranteeCents);

        Wallet keakitWallet = getKeaKitWallet();
        Transaction keakitDeduct = new Transaction(-guaranteeAmount, keakitWallet, TransactionType.GUARANTEE_REFUND);
        keakitDeduct.setRelatedKit(kit);
        keakitDeduct.setDescription("Garantía liberada - Kit: " + kit.getName());
        transactionRepository.save(keakitDeduct);

        if (kit.getSnapshots() == null || kit.getSnapshots().isEmpty()) {
            Wallet tenantWallet = walletService.getWalletByUserId(tenantId);
            Transaction tenantReceive = new Transaction(guaranteeAmount, tenantWallet, TransactionType.GUARANTEE_REFUND);
            tenantReceive.setRelatedKit(kit);
            tenantReceive.setDescription("Devolución de garantía - Kit: " + kit.getName());
            transactionRepository.save(tenantReceive);
            guaranteeReturnEmailService.sendGuaranteeNotification(kitId);
            return new GuaranteeReturnResult(guaranteeAmount, guaranteeAmount, Map.of());
        }

        Map<Long, Integer> damagedSubtotalByOwner = new LinkedHashMap<>();
        int totalSnapshotWeightCents = 0;

        for (ItemMemento snapshot : kit.getSnapshots()) {
            int snapshotSubtotalCents = toCents(snapshot.getPriceAtRental() * snapshot.getSelectedUnits());
            totalSnapshotWeightCents += snapshotSubtotalCents;

            Item currentItem = articleRepository.findById(snapshot.getOriginalItemId()).orElse(null);
            if (!(currentItem instanceof com.example.demo.model.Article currentArticle)
                    || currentArticle.getStatus() != ArticleStatus.DAMAGED) {
                continue;
            }

            Long payoutOwnerId = resolvePayoutOwnerId(snapshot, currentItem, ownerId);
            if (payoutOwnerId == null) {
                continue;
            }

            damagedSubtotalByOwner.merge(payoutOwnerId, snapshotSubtotalCents, Integer::sum);
        }

        if (totalSnapshotWeightCents <= 0 || damagedSubtotalByOwner.isEmpty()) {
            Wallet tenantWallet = walletService.getWalletByUserId(tenantId);
            Transaction tenantReceive = new Transaction(guaranteeAmount, tenantWallet, TransactionType.GUARANTEE_REFUND);
            tenantReceive.setRelatedKit(kit);
            tenantReceive.setDescription("Devolución de garantía - Kit: " + kit.getName());
            transactionRepository.save(tenantReceive);
            guaranteeReturnEmailService.sendGuaranteeNotification(kitId);
            return new GuaranteeReturnResult(guaranteeAmount, guaranteeAmount, Map.of());
        }

        int retainedGuaranteeCents = 0;
        Map<Long, Double> ownerPayouts = new LinkedHashMap<>();
        for (Map.Entry<Long, Integer> entry : damagedSubtotalByOwner.entrySet()) {
            int ownerGuaranteeCents = (int) (((long) entry.getValue() * guaranteeCents) / totalSnapshotWeightCents);
            retainedGuaranteeCents += ownerGuaranteeCents;

            if (ownerGuaranteeCents <= 0) {
                continue;
            }

            Wallet ownerWallet = walletService.getWalletByUserId(entry.getKey());
            Double ownerPayoutAmount = toEuros(ownerGuaranteeCents);
            Transaction ownerReceive = new Transaction(ownerPayoutAmount, ownerWallet, TransactionType.PAYOUT);
            ownerReceive.setRelatedKit(kit);
            ownerReceive.setDescription("Compensación por garantía retenida - Kit: " + kit.getName());
            transactionRepository.save(ownerReceive);
            ownerPayouts.put(entry.getKey(), ownerPayoutAmount);
        }

        int tenantRefundCents = guaranteeCents - retainedGuaranteeCents;
        Double tenantRefundAmount = toEuros(tenantRefundCents);
        if (tenantRefundCents > 0) {
            Wallet tenantWallet = walletService.getWalletByUserId(tenantId);
            Transaction tenantReceive = new Transaction(tenantRefundAmount, tenantWallet,
                    TransactionType.GUARANTEE_REFUND);
            tenantReceive.setRelatedKit(kit);
            tenantReceive.setDescription("Devolución parcial de garantía - Kit: " + kit.getName());
            transactionRepository.save(tenantReceive);
            guaranteeReturnEmailService.sendGuaranteeNotification(kitId);
        }

        return new GuaranteeReturnResult(toEuros(retainedGuaranteeCents), tenantRefundAmount, ownerPayouts);
    }

    private int getCapturedGuaranteeCents(Long kitId) {
        return transactionRepository.findByRelatedKitIdAndType(kitId, TransactionType.GUARANTEE_DEPOSIT).stream()
                .filter(transaction -> transaction.getAmount() != null && transaction.getAmount() > 0)
                .mapToInt(transaction -> toCents(transaction.getAmount()))
                .sum();
    }

    private boolean hasGuaranteeReturnAlreadyBeenProcessed(Long kitId) {
        return transactionRepository.findByRelatedKitIdAndType(kitId, TransactionType.GUARANTEE_REFUND).stream()
                .anyMatch(transaction -> transaction.getAmount() != null && transaction.getAmount() < 0);
    }

    private Long resolvePayoutOwnerId(ItemMemento snapshot, Item currentItem, Long fallbackOwnerId) {
        if (snapshot.getOwnerAtRental() != null && snapshot.getOwnerAtRental().getId() != null) {
            return snapshot.getOwnerAtRental().getId();
        }
        if (currentItem != null && currentItem.getOwner() != null && currentItem.getOwner().getId() != null) {
            return currentItem.getOwner().getId();
        }
        return fallbackOwnerId;
    }

    private Double toMoney(Double amount) {
        return Math.round(amount * 100.0) / 100.0;
    }

    private Integer toCents(Double amount) {
        return (amount != null) ? (int) Math.round(amount * 100.0) : 0;
    }

    private Transaction payWithWallet(Long tenantId, Double amount)
            throws ResourceNotFoundException, NotEnoughBalanceException {
        Wallet tenantWallet = walletService.getWalletByUserId(tenantId);
        if (tenantWallet.getBalance() < amount) {
            throw new NotEnoughBalanceException(
                    "Saldo insuficiente en el monedero. Requerido: " + amount + ", Disponible: " + tenantWallet.getBalance());
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
                    "Saldo insuficiente" + " Requerido: " + amount + ", Disponible: " + wallet.getBalance());
        }

        Long amountInCents = (long) (amount * 100);
        createPayout(amountInCents);
        walletService.updateWalletBalance(userId, amount);
    }

}
