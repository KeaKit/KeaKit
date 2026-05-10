package com.example.demo.payment;

import static org.junit.jupiter.api.Assertions.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.mockito.ArgumentMatchers.isNull;
import org.springframework.test.util.ReflectionTestUtils;

import com.example.demo.TestDataFactory;

import com.example.demo.dto.KitPaymentDTO;
import com.example.demo.dto.KitResponse;
import com.example.demo.dto.UserResponse;

import com.example.demo.model.Article;
import com.example.demo.model.ArticleStatus;
import com.example.demo.model.ItemMemento;
import com.example.demo.model.Kit;
import com.example.demo.model.KitStatus;
import com.example.demo.model.TransactionType;
import com.example.demo.model.User;
import com.example.demo.model.Wallet;
import com.example.demo.model.Transaction;
import com.example.demo.repository.ArticleRepository;
import com.example.demo.repository.KitRepository;
import com.example.demo.repository.PilotUserRepository;
import com.example.demo.repository.TransactionRepository;

import com.example.demo.service.ItemService;
import com.example.demo.service.KitService;
import com.example.demo.service.OrderConfirmationEmailService;
import com.example.demo.service.PlatformConfigService;
import com.example.demo.service.PromoCodeService;
import com.example.demo.service.UserService;
import com.example.demo.service.WalletService;
import com.example.demo.service.GuaranteeReturnEmailService;
import com.example.demo.service.PaymentService;

import com.stripe.model.PaymentIntent;

import com.example.demo.exception.NotEnoughBalanceException;
import com.example.demo.exception.ResourceNotFoundException;
import com.stripe.exception.StripeException;

import com.stripe.model.Payout;

@ExtendWith(MockitoExtension.class)
public class PaymentServiceTest {

    @Mock
    private PlatformConfigService platformConfigService;

    @Mock
    private WalletService walletService;

    @Mock
    private KitService kitService;

    @Mock
    private ItemService itemService;

    @Mock
    private OrderConfirmationEmailService emailService;

    @Mock
    private UserService userService;

    @Mock
    private GuaranteeReturnEmailService guaranteeReturnEmailService;

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private KitRepository kitRepository;

    @Mock 
    private PromoCodeService promoCodeService;

    @Mock 
    private PilotUserRepository pilotUserRepository;

    @Mock
    private ArticleRepository articleRepository;

    private PaymentService paymentService;

    @BeforeEach
    void setUp() {
        paymentService = spy(new PaymentService(guaranteeReturnEmailService));
        ReflectionTestUtils.setField(paymentService, "platformConfigService", platformConfigService);
        ReflectionTestUtils.setField(paymentService, "walletService", walletService);
        ReflectionTestUtils.setField(paymentService, "kitService", kitService);
        ReflectionTestUtils.setField(paymentService, "itemService", itemService);
        ReflectionTestUtils.setField(paymentService, "emailService", emailService);
        ReflectionTestUtils.setField(paymentService, "userService", userService);
        ReflectionTestUtils.setField(paymentService, "transactionRepository", transactionRepository);
        ReflectionTestUtils.setField(paymentService, "kitRepository", kitRepository);
        ReflectionTestUtils.setField(paymentService, "stripeApiKey", STRIPE_API_KEY);
        ReflectionTestUtils.setField(paymentService, "KEAKIT_ADMIN_EMAIL", ADMIN_EMAIL);
        ReflectionTestUtils.setField(paymentService, "promoCodeService", promoCodeService);
        ReflectionTestUtils.setField(paymentService, "pilotUserRepository", pilotUserRepository);
        ReflectionTestUtils.setField(paymentService, "articleRepository", articleRepository);
        paymentService.init();
    }

    // Datos de prueba

    private final String STRIPE_API_KEY = "sk_test_mock";

    private final User TENANT = TestDataFactory.createMockTenantUser();
    private final User OWNER = TestDataFactory.createMockOwnerUser();
    private final User ADMIN = TestDataFactory.createMockAdminUser();
    private final UserResponse ADMIN_RESPONSE = TestDataFactory.createMockUserResponse(ADMIN);
    private final Long ADMIN_ID = ADMIN_RESPONSE.getId();
    private final String ADMIN_EMAIL = ADMIN_RESPONSE.getEmail();

    private final Kit KIT = TestDataFactory.createMockKit(TENANT, KitStatus.DRAFT);
    private final KitResponse KIT_RESPONSE = TestDataFactory.createMockKitResponse();
    private final KitPaymentDTO KIT_PAYMENT = TestDataFactory.createDefaultKitPaymentDTO();
    private final Long KIT_ID = KIT_RESPONSE.getId();

    private final Wallet TENANT_WALLET = TestDataFactory.createMockWallet(10L, TENANT, 200.0);
    private final Wallet OWNER_WALLET = TestDataFactory.createMockWallet(20L, OWNER, 100.0);
    private final Wallet ADMIN_WALLET = TestDataFactory.createMockWallet(ADMIN_ID, ADMIN, 1000.0);

    @Test
    void createPaymentIntent_ShouldReturnIntent() throws StripeException {
        Long amountInCents = 20000L; // 200.00€

        // Mock de la respuesta que daría Stripe
        PaymentIntent mockIntent = mock(PaymentIntent.class);
        when(mockIntent.getId()).thenReturn("pi_mock_123");
        when(mockIntent.getClientSecret()).thenReturn("secret_mock_123");
        doReturn(mockIntent).when(paymentService).createStripePaymentIntent(any());

        PaymentIntent result = paymentService.createPaymentIntent(amountInCents);

        assertNotNull(result);
        assertEquals("pi_mock_123", result.getId());
        assertEquals("secret_mock_123", result.getClientSecret());
        verify(paymentService).createStripePaymentIntent(any());
    }

    // ====== Happy Paths processPayment ======

    @Test
    void processPayment_ShouldCompleteSuccessfully_WhenPayWithWalletIsTrue() throws Exception {
        // Mocks de servicios
        when(kitService.findById(KIT_ID)).thenReturn(KIT_RESPONSE);
        when(kitService.getKitPayment(eq(KIT_ID), isNull(), isNull())).thenReturn(KIT_PAYMENT);
        when(userService.getUserByEmail(anyString())).thenReturn(ADMIN_RESPONSE);
        when(walletService.getWalletByUserId(TENANT.getId())).thenReturn(TENANT_WALLET);
        when(walletService.getWalletByUserId(ADMIN_ID)).thenReturn(ADMIN_WALLET);
        when(walletService.getWalletByUserId(OWNER.getId())).thenReturn(OWNER_WALLET);
        when(kitRepository.findById(KIT_ID)).thenReturn(Optional.of(KIT));

        // 2. Act
        assertDoesNotThrow(() -> paymentService.processPayment(KIT_ID, true));

        // 3. Assert: Verificamos interacciones clave
        verify(transactionRepository, atLeast(3)).save(any(Transaction.class)); // Pago, Fianza, Pago Owner
        verify(kitService).markAsPaid(KIT_ID);
        verify(emailService).sendOrderConfirmation(eq(KIT), anyDouble(), isNull());
    }

    @Test
    void processPayment_ShouldCompleteSuccessfully_WhenPayWithWalletIsFalse() throws Exception {
        // Mocks de servicios
        when(kitService.findById(KIT_ID)).thenReturn(KIT_RESPONSE);
        when(kitService.getKitPayment(eq(KIT_ID), isNull(), isNull())).thenReturn(KIT_PAYMENT);
        when(userService.getUserByEmail(anyString())).thenReturn(ADMIN_RESPONSE);
        when(walletService.getWalletByUserId(ADMIN_ID)).thenReturn(ADMIN_WALLET);
        when(walletService.getWalletByUserId(OWNER.getId())).thenReturn(OWNER_WALLET);

        when(kitRepository.findById(KIT_ID)).thenReturn(Optional.of(KIT));

        assertDoesNotThrow(() -> paymentService.processPayment(KIT_ID, false));

        verify(transactionRepository, atLeast(2)).save(any(Transaction.class)); // Fianza, Pago Owner
        verify(kitService).markAsPaid(KIT_ID);
        verify(emailService).sendOrderConfirmation(eq(KIT), anyDouble(), isNull());
    }

    // ====== Sad Paths processPayment ======

    @Test
    void processPayment_ShouldThrowException_WhenKitNotFound() {
        when(kitService.findById(KIT_ID))
                .thenThrow(new ResourceNotFoundException("Kit not found with id: " + KIT_ID));

        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                () -> paymentService.processPayment(KIT_ID, true));

        assertTrue(exception.getMessage().contains("Kit not found with id: " + KIT_ID));

        verify(transactionRepository, never()).save(any());
    }

    @Test
    void processPayment_ShouldThrowException_WhenUserNotFound() {
        when(kitService.findById(KIT_ID)).thenReturn(KIT_RESPONSE);
        when(kitService.getKitPayment(eq(KIT_ID), isNull(), isNull())).thenReturn(KIT_PAYMENT);
        when(userService.getUserByEmail(anyString())).thenReturn(ADMIN_RESPONSE);
        when(walletService.getWalletByUserId(TENANT.getId())).thenReturn(TENANT_WALLET);
        when(userService.getUserByEmail(anyString()))
                .thenThrow(new ResourceNotFoundException("User not found with email: " + ADMIN_EMAIL));

        assertNotNull(KIT_RESPONSE.getItems());

        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                () -> paymentService.processPayment(KIT_ID, true));

        assertThat(exception.getMessage()).contains("User not found");
    }

    @Test
    void processPayment_ShouldThrowException_WhenNotEnoughBalance() {
        Wallet notEnoughBalanceWallet = TestDataFactory.createMockWallet(4L, TENANT, 10.0);
        when(kitService.findById(KIT_ID)).thenReturn(KIT_RESPONSE);
        when(kitService.getKitPayment(eq(KIT_ID), isNull(), isNull())).thenReturn(KIT_PAYMENT);
        when(walletService.getWalletByUserId(TENANT.getId())).thenReturn(notEnoughBalanceWallet);

        assertEquals(walletService.getWalletByUserId(TENANT.getId()).getBalance(), 10.0);

        NotEnoughBalanceException exception = assertThrows(NotEnoughBalanceException.class,
                () -> paymentService.processPayment(KIT_ID, true));

    assertThat(exception.getMessage()).contains("Saldo insuficiente");
    }


    @Test
    void processPayment_ShouldProcessMultipleItems_WhenKitHasThreeItems() throws Exception {
        assertEquals(3, KIT_RESPONSE.getItems().size(), "El kit de prueba debería tener 3 items");

        com.example.demo.model.PilotUser activePilot = new com.example.demo.model.PilotUser("owner@test.com");
        activePilot.setActive(true);

        when(kitService.findById(KIT_ID)).thenReturn(KIT_RESPONSE);
        when(kitService.getKitPayment(eq(KIT_ID), isNull(), isNull())).thenReturn(KIT_PAYMENT);
        when(userService.getUserByEmail(anyString())).thenReturn(ADMIN_RESPONSE);
        when(walletService.getWalletByUserId(ADMIN_ID)).thenReturn(ADMIN_WALLET);
        when(walletService.getWalletByUserId(OWNER.getId())).thenReturn(OWNER_WALLET);
        when(kitRepository.findById(KIT_ID)).thenReturn(Optional.of(KIT));
        // Con promoCodeService inyectado, itemService.findById se llama → mockear el item
        when(userService.getUserById(OWNER.getId())).thenReturn(TestDataFactory.createMockUserResponse(OWNER));
        when(pilotUserRepository.findByEmailIgnoreCase("owner@test.com")).thenReturn(Optional.of(activePilot));
        when(itemService.findById(anyLong())).thenReturn(TestDataFactory.createDefaultItem());

        paymentService.processPayment(KIT_ID, false, null, null);

        // Con promoCodeService inyectado, itemService SÍ se llama (para markOwnerPromosAsUsedFromItems)
        verify(itemService, atLeast(3)).findById(anyLong());
        verify(transactionRepository, atLeast(3)).save(any(Transaction.class));
        verify(emailService).sendOrderConfirmation(any(), anyDouble(), isNull());
    }

    @Test
    void processPayment_ShouldCompleteSuccessfully_WhenPilotUserTierBronze() throws Exception {
        com.example.demo.model.PilotUser activePilot = new com.example.demo.model.PilotUser("owner@test.com");
        activePilot.setActive(true);

        when(kitService.findById(KIT_ID)).thenReturn(KIT_RESPONSE);
        when(kitService.getKitPayment(eq(KIT_ID), isNull(), isNull())).thenReturn(KIT_PAYMENT);
        when(userService.getUserByEmail(ADMIN_EMAIL)).thenReturn(ADMIN_RESPONSE);
        when(walletService.getWalletByUserId(TENANT.getId())).thenReturn(TENANT_WALLET);
        when(walletService.getWalletByUserId(ADMIN_ID)).thenReturn(ADMIN_WALLET);
        when(walletService.getWalletByUserId(OWNER.getId())).thenReturn(OWNER_WALLET);
        when(kitRepository.findById(KIT_ID)).thenReturn(Optional.of(KIT));
        // Mock para isPilotUser: getUserById devuelve el owner, pilotUserRepository lo encuentra activo
        when(userService.getUserById(OWNER.getId())).thenReturn(TestDataFactory.createMockUserResponse(OWNER));
        when(pilotUserRepository.findByEmailIgnoreCase("owner@test.com")).thenReturn(Optional.of(activePilot));

        assertDoesNotThrow(() -> paymentService.processPayment(KIT_ID, true));

        verify(transactionRepository, atLeast(3)).save(any(Transaction.class));
        verify(platformConfigService, never()).getCommissionRate();
        verify(emailService).sendOrderConfirmation(eq(KIT), anyDouble(), isNull());
    }

    @Test
    void processPayment_ShouldCompleteSuccessfully_WhenPilotUserTierSilver() throws Exception {
        com.example.demo.model.PilotUser activePilot = new com.example.demo.model.PilotUser("owner@test.com");
        activePilot.setActive(true);

        when(kitService.findById(KIT_ID)).thenReturn(KIT_RESPONSE);
        when(kitService.getKitPayment(eq(KIT_ID), isNull(), isNull())).thenReturn(KIT_PAYMENT);
        when(userService.getUserByEmail(ADMIN_EMAIL)).thenReturn(ADMIN_RESPONSE);
        when(walletService.getWalletByUserId(TENANT.getId())).thenReturn(TENANT_WALLET);
        when(walletService.getWalletByUserId(ADMIN_ID)).thenReturn(ADMIN_WALLET);
        when(walletService.getWalletByUserId(OWNER.getId())).thenReturn(OWNER_WALLET);
        when(kitRepository.findById(KIT_ID)).thenReturn(Optional.of(KIT));
        when(userService.getUserById(OWNER.getId())).thenReturn(TestDataFactory.createMockUserResponse(OWNER));
        when(pilotUserRepository.findByEmailIgnoreCase("owner@test.com")).thenReturn(Optional.of(activePilot));

        assertDoesNotThrow(() -> paymentService.processPayment(KIT_ID, true));

        verify(transactionRepository, atLeast(3)).save(any(Transaction.class));
        verify(platformConfigService, never()).getCommissionRate();
        verify(emailService).sendOrderConfirmation(eq(KIT), anyDouble(), isNull());
    }

    @Test
    void processPayment_ShouldCompleteSuccessfully_WhenPilotUserTierGold() throws Exception {
        com.example.demo.model.PilotUser activePilot = new com.example.demo.model.PilotUser("owner@test.com");
        activePilot.setActive(true);

        when(kitService.findById(KIT_ID)).thenReturn(KIT_RESPONSE);
        when(kitService.getKitPayment(eq(KIT_ID), isNull(), isNull())).thenReturn(KIT_PAYMENT);
        when(userService.getUserByEmail(ADMIN_EMAIL)).thenReturn(ADMIN_RESPONSE);
        when(walletService.getWalletByUserId(TENANT.getId())).thenReturn(TENANT_WALLET);
        when(walletService.getWalletByUserId(ADMIN_ID)).thenReturn(ADMIN_WALLET);
        when(walletService.getWalletByUserId(OWNER.getId())).thenReturn(OWNER_WALLET);
        when(kitRepository.findById(KIT_ID)).thenReturn(Optional.of(KIT));
        when(userService.getUserById(OWNER.getId())).thenReturn(TestDataFactory.createMockUserResponse(OWNER));
        when(pilotUserRepository.findByEmailIgnoreCase("owner@test.com")).thenReturn(Optional.of(activePilot));

        assertDoesNotThrow(() -> paymentService.processPayment(KIT_ID, true));

        verify(transactionRepository, atLeast(3)).save(any(Transaction.class));
        verify(platformConfigService, never()).getCommissionRate();
        verify(emailService).sendOrderConfirmation(eq(KIT), anyDouble(), isNull());
    }

    @Test
    void createPayout_ShouldReturnPayout_WhenSuccessful() throws StripeException {
        Long amountInCents = 5000L;
        Payout mockPayout = mock(Payout.class);
        when(mockPayout.getId()).thenReturn("po_mock_123");
        doReturn(mockPayout).when(paymentService).createStripePayout(any());

        Payout result = paymentService.createPayout(amountInCents);

        assertNotNull(result);
        assertEquals("po_mock_123", result.getId());
        verify(paymentService).createStripePayout(any());
    }

    @Test
    void withdrawToBank_ShouldCreatePayoutAndUpdateWallet_WhenBalanceIsEnough() throws Exception {
        Double amount = 50.0;
        String bankAccount = "ES9121000418450200051332";
        Wallet wallet = TestDataFactory.createMockWallet(10L, TENANT, 200.0);

        when(walletService.getWalletByUserId(TENANT.getId())).thenReturn(wallet);

        Payout mockPayout = mock(Payout.class);
        doReturn(mockPayout).when(paymentService).createStripePayout(any());

        assertDoesNotThrow(() -> paymentService.withdrawToBank(TENANT.getId(), amount, bankAccount));

        verify(paymentService).createStripePayout(any());
        verify(walletService).updateWalletBalance(TENANT.getId(), amount);
    }

    @Test
    void withdrawToBank_ShouldThrowNotEnoughBalance_WhenWalletHasInsufficientFunds() throws Exception {
        Double amount = 200.0;
        String bankAccount = "ES9121000418450200051332";
        Wallet wallet = TestDataFactory.createMockWallet(10L, TENANT, 50.0);

        when(walletService.getWalletByUserId(TENANT.getId())).thenReturn(wallet);

        NotEnoughBalanceException ex = assertThrows(NotEnoughBalanceException.class,
                () -> paymentService.withdrawToBank(TENANT.getId(), amount, bankAccount));

    assertThat(ex.getMessage()).contains("Saldo insuficiente");
        verify(paymentService, never()).createStripePayout(any());
        verify(walletService, never()).updateWalletBalance(anyLong(), any());
    }

    @Test
    void withdrawToBank_ShouldThrowIllegalArgumentException_WhenIbanIsInvalid() throws Exception {
        Double amount = 50.0;
        String invalidBankAccount = "ES001234";

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> paymentService.withdrawToBank(TENANT.getId(), amount, invalidBankAccount));

        assertThat(ex.getMessage()).contains("IBAN valido");
        verify(walletService, never()).getWalletByUserId(anyLong());
    }
    
    @Test
    void processPayment_WithNullPromoCode_SendsEmailWithZeroDiscount() throws Exception {
        when(kitService.findById(KIT_ID)).thenReturn(KIT_RESPONSE);
        when(kitService.getKitPayment(eq(KIT_ID), isNull(), isNull())).thenReturn(KIT_PAYMENT);
        when(userService.getUserByEmail(anyString())).thenReturn(ADMIN_RESPONSE);
        when(walletService.getWalletByUserId(ADMIN_ID)).thenReturn(ADMIN_WALLET);
        when(walletService.getWalletByUserId(OWNER.getId())).thenReturn(OWNER_WALLET);
        when(kitRepository.findById(KIT_ID)).thenReturn(Optional.of(KIT));
    
        paymentService.processPayment(KIT_ID, false, null, null);
    
        verify(emailService).sendOrderConfirmation(eq(KIT), eq(0.0), isNull());
    }
    
    @Test
    void processPayment_WithBlankPromoCode_TreatedAsNoPromo() throws Exception {
        when(kitService.findById(KIT_ID)).thenReturn(KIT_RESPONSE);
        when(kitService.getKitPayment(eq(KIT_ID), eq(""), isNull())).thenReturn(KIT_PAYMENT);
        when(userService.getUserByEmail(anyString())).thenReturn(ADMIN_RESPONSE);
        when(walletService.getWalletByUserId(ADMIN_ID)).thenReturn(ADMIN_WALLET);
        when(walletService.getWalletByUserId(OWNER.getId())).thenReturn(OWNER_WALLET);
        when(kitRepository.findById(KIT_ID)).thenReturn(Optional.of(KIT));
    
        assertDoesNotThrow(() -> paymentService.processPayment(KIT_ID, false, "", null));
    }
    
    @Test
    void processPayment_OwnerIsPilotUser_NoCommissionApplied() throws Exception {
        com.example.demo.model.PilotUser activePilot = new com.example.demo.model.PilotUser("owner@test.com");
        activePilot.setActive(true);
    
        when(kitService.findById(KIT_ID)).thenReturn(KIT_RESPONSE);
        when(kitService.getKitPayment(eq(KIT_ID), isNull(), isNull())).thenReturn(KIT_PAYMENT);
        when(userService.getUserByEmail(anyString())).thenReturn(ADMIN_RESPONSE);
        when(walletService.getWalletByUserId(ADMIN_ID)).thenReturn(ADMIN_WALLET);
        when(walletService.getWalletByUserId(OWNER.getId())).thenReturn(OWNER_WALLET);
        when(kitRepository.findById(KIT_ID)).thenReturn(Optional.of(KIT));
    
        UserResponse ownerResponse = TestDataFactory.createMockUserResponse(OWNER);
        when(userService.getUserById(OWNER.getId())).thenReturn(ownerResponse);
        when(pilotUserRepository.findByEmailIgnoreCase("owner@test.com"))
                .thenReturn(Optional.of(activePilot));
    
        paymentService.processPayment(KIT_ID, false);
    
        verify(platformConfigService, never()).getCommissionRate();
    }
    
    @Test
    void processPayment_OwnerIsNotPilotUser_CommissionApplied() throws Exception {
        when(kitService.findById(KIT_ID)).thenReturn(KIT_RESPONSE);
        when(kitService.getKitPayment(eq(KIT_ID), isNull(), isNull())).thenReturn(KIT_PAYMENT);
        when(userService.getUserByEmail(anyString())).thenReturn(ADMIN_RESPONSE);
        when(walletService.getWalletByUserId(ADMIN_ID)).thenReturn(ADMIN_WALLET);
        when(walletService.getWalletByUserId(OWNER.getId())).thenReturn(OWNER_WALLET);
        when(kitRepository.findById(KIT_ID)).thenReturn(Optional.of(KIT));
    
        UserResponse ownerResponse = TestDataFactory.createMockUserResponse(OWNER);
        when(userService.getUserById(OWNER.getId())).thenReturn(ownerResponse);
        when(pilotUserRepository.findByEmailIgnoreCase("owner@test.com"))
                .thenReturn(Optional.empty());  // no es piloto
        when(platformConfigService.getCommissionRate()).thenReturn(0.20);
    
        paymentService.processPayment(KIT_ID, false);
    
        verify(platformConfigService, atLeast(1)).getCommissionRate();
    }

    @Test
    void processGuaranteeReturn_GoodCondition_RefundsTenant() throws Exception {
        KitPaymentDTO paymentInfo = new KitPaymentDTO(12000, 8000, 2000, 999, 0);
        when(kitService.getKitPayment(KIT_ID)).thenReturn(paymentInfo);
        KIT.setStartDate(LocalDate.now().minusDays(30));
        KIT.setEndDate(LocalDate.now());
        ItemMemento snapshot = new ItemMemento();
        snapshot.setOriginalItemId(100L);
        snapshot.setPriceAtRental(80.0);
        snapshot.setSelectedUnits(1);
        KIT.setSnapshots(List.of(snapshot));
        when(kitRepository.findById(KIT_ID)).thenReturn(Optional.of(KIT));
        Article article = new Article();
        article.setId(100L);
        article.setStatus(ArticleStatus.AVAILABLE);
        when(articleRepository.findById(100L)).thenReturn(Optional.of(article));
        when(userService.getUserByEmail(anyString())).thenReturn(ADMIN_RESPONSE);
        when(walletService.getWalletByUserId(ADMIN_ID)).thenReturn(ADMIN_WALLET);
    
        Wallet tenantWallet = TestDataFactory.createMockWallet(10L, TENANT, 100.0);
        when(walletService.getWalletByUserId(TENANT.getId())).thenReturn(tenantWallet);
    
        Double result = paymentService.processGuaranteeReturn(KIT_ID, OWNER.getId(), TENANT.getId(), "GOOD");
    
        assertThat(result).isEqualTo(20.0); // 2000 céntimos = 20€
        // Fianza se devuelve al tenant: keakit -20, tenant +20
        verify(transactionRepository, times(2)).save(any(Transaction.class));
    }
    
    @Test
    void processGuaranteeReturn_DamagedCondition_CompensatesOwner() throws Exception {
        KitPaymentDTO paymentInfo = new KitPaymentDTO(12000, 8000, 2000, 999, 0);
        when(kitService.getKitPayment(KIT_ID)).thenReturn(paymentInfo);
        KIT.setStartDate(LocalDate.now().minusDays(30));
        KIT.setEndDate(LocalDate.now());
        ItemMemento snapshot = new ItemMemento();
        snapshot.setOriginalItemId(200L);
        snapshot.setPriceAtRental(80.0);
        snapshot.setSelectedUnits(1);
        snapshot.setOwnerAtRental(OWNER);
        KIT.setSnapshots(List.of(snapshot));
        when(kitRepository.findById(KIT_ID)).thenReturn(Optional.of(KIT));
        Article article = new Article();
        article.setId(200L);
        article.setStatus(ArticleStatus.DAMAGED);
        article.setOwner(OWNER);
        when(articleRepository.findById(200L)).thenReturn(Optional.of(article));
        when(userService.getUserByEmail(anyString())).thenReturn(ADMIN_RESPONSE);
        when(walletService.getWalletByUserId(ADMIN_ID)).thenReturn(ADMIN_WALLET);
    
        Wallet ownerWallet = TestDataFactory.createMockWallet(20L, OWNER, 100.0);
        when(walletService.getWalletByUserId(OWNER.getId())).thenReturn(ownerWallet);
    
        Double result = paymentService.processGuaranteeReturn(KIT_ID, OWNER.getId(), TENANT.getId(), "DAMAGED");
    
        assertThat(result).isEqualTo(20.0);
        verify(transactionRepository, times(2)).save(any(Transaction.class));
    }

    @Test
    void processGuaranteeReturn_PartialDamage_SplitsGuaranteeBetweenOwnerAndTenant() throws Exception {
        User secondOwner = new User();
        secondOwner.setId(30L);
        secondOwner.setEmail("second-owner@test.com");

        KitPaymentDTO paymentInfo = new KitPaymentDTO(48000, 40000, 8000, 0, 0);
        when(kitService.getKitPayment(KIT_ID)).thenReturn(paymentInfo);

        KIT.setStartDate(LocalDate.now().minusDays(60));
        KIT.setEndDate(LocalDate.now().minusDays(1));

        ItemMemento goodSnapshot = new ItemMemento();
        goodSnapshot.setOriginalItemId(301L);
        goodSnapshot.setPriceAtRental(50.0);
        goodSnapshot.setSelectedUnits(1);
        goodSnapshot.setOwnerAtRental(OWNER);

        ItemMemento damagedSnapshot = new ItemMemento();
        damagedSnapshot.setOriginalItemId(302L);
        damagedSnapshot.setPriceAtRental(50.0);
        damagedSnapshot.setSelectedUnits(1);
        damagedSnapshot.setOwnerAtRental(secondOwner);

        ItemMemento goodExpensiveSnapshot = new ItemMemento();
        goodExpensiveSnapshot.setOriginalItemId(303L);
        goodExpensiveSnapshot.setPriceAtRental(100.0);
        goodExpensiveSnapshot.setSelectedUnits(1);
        goodExpensiveSnapshot.setOwnerAtRental(OWNER);

        KIT.setSnapshots(List.of(goodSnapshot, damagedSnapshot, goodExpensiveSnapshot));
        when(kitRepository.findById(KIT_ID)).thenReturn(Optional.of(KIT));

        Article firstGood = new Article();
        firstGood.setId(301L);
        firstGood.setStatus(ArticleStatus.AVAILABLE);
        firstGood.setOwner(OWNER);

        Article damaged = new Article();
        damaged.setId(302L);
        damaged.setStatus(ArticleStatus.DAMAGED);
        damaged.setOwner(secondOwner);

        Article secondGood = new Article();
        secondGood.setId(303L);
        secondGood.setStatus(ArticleStatus.AVAILABLE);
        secondGood.setOwner(OWNER);

        when(articleRepository.findById(301L)).thenReturn(Optional.of(firstGood));
        when(articleRepository.findById(302L)).thenReturn(Optional.of(damaged));
        when(articleRepository.findById(303L)).thenReturn(Optional.of(secondGood));
        when(userService.getUserByEmail(anyString())).thenReturn(ADMIN_RESPONSE);
        when(walletService.getWalletByUserId(ADMIN_ID)).thenReturn(ADMIN_WALLET);
        when(walletService.getWalletByUserId(TENANT.getId())).thenReturn(TENANT_WALLET);
        when(walletService.getWalletByUserId(secondOwner.getId())).thenReturn(TestDataFactory.createMockWallet(30L, secondOwner, 0.0));

        Double result = paymentService.processGuaranteeReturn(KIT_ID, OWNER.getId(), TENANT.getId(), "DAMAGED");

        assertThat(result).isEqualTo(20.0);

        ArgumentCaptor<Transaction> transactionCaptor = ArgumentCaptor.forClass(Transaction.class);
        verify(transactionRepository, times(3)).save(transactionCaptor.capture());
        List<Transaction> savedTransactions = transactionCaptor.getAllValues();

        assertThat(savedTransactions.get(0).getAmount()).isEqualTo(-80.0);
        assertThat(savedTransactions.get(0).getType()).isEqualTo(TransactionType.GUARANTEE_REFUND);
        assertThat(savedTransactions.get(1).getAmount()).isEqualTo(20.0);
        assertThat(savedTransactions.get(1).getType()).isEqualTo(TransactionType.PAYOUT);
        assertThat(savedTransactions.get(2).getAmount()).isEqualTo(60.0);
        assertThat(savedTransactions.get(2).getType()).isEqualTo(TransactionType.GUARANTEE_REFUND);
    }
    
    @Test
    void processGuaranteeReturn_InvalidCondition_ThrowsIllegalArgumentException() {
        assertThrows(Exception.class,
                () -> paymentService.processGuaranteeReturn(KIT_ID, OWNER.getId(), TENANT.getId(), "INVALID"));
    }

    }
