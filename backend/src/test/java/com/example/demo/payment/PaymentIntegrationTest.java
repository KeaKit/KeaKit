package com.example.demo.payment;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.time.LocalDate;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.model.*;
import com.example.demo.repository.*;

import jakarta.persistence.EntityManager;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
@Transactional
@Sql(scripts = "/cleanup.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
public class PaymentIntegrationTest {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private WalletRepository walletRepository;

	@Autowired
	private KitRepository kitRepository;

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private TransactionRepository transactionRepository;

	@Autowired
	private CategoryRepository categoryRepository;

	@Autowired
	private ArticleRepository articleRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Autowired
	private EntityManager entityManager;

	private User tenant;
	private Kit kit;

	@BeforeEach
	void setUp() {
		tenant = userRepository.save(createCompleteUser("Tenant", "tenant.payment@keakit.com", UserRole.USER));
		User owner = userRepository.save(createCompleteUser("Owner", "owner.payment@keakit.com", UserRole.USER));
		User admin = userRepository.save(createCompleteUser("Admin", "admin@keakit.com", UserRole.ADMIN));

		saveSimpleWallet(tenant);
		saveSimpleWallet(owner);
		saveSimpleWallet(admin);

		Wallet tenantWallet = walletRepository.findByUserId(tenant.getId())
				.orElseThrow(() -> new RuntimeException("Wallet no encontrada"));

		Transaction deposit = new Transaction();
		ReflectionTestUtils.setField(deposit, "destinationWallet", tenantWallet);
		ReflectionTestUtils.setField(deposit, "amount", 1000.0);
		ReflectionTestUtils.setField(deposit, "type", TransactionType.PAYOUT);
		transactionRepository.saveAndFlush(deposit);

		Category category = new Category("Bricolaje", "Taller", 5.0, 500.0);
		category.setStatus(CategoryStatus.ACTIVE);
		Category savedCategory = categoryRepository.saveAndFlush(category);

		Article article = new Article();
		article.setTitle("Taladro Percutor");
		article.setPricePerMonth(369.99);
		article.setOwner(owner);
		article.setCategory(savedCategory);
		article.setStatus(ArticleStatus.AVAILABLE);
		article.setDescription("Taladro de alta potencia");
		article.setCity("Madrid");
		Article savedArticle = articleRepository.saveAndFlush(article);

		kit = new Kit();
		// define a 1-month rental period so payment calculations work with the service
		kit.setStartDate(LocalDate.now());
		kit.setEndDate(LocalDate.now().plusMonths(1));
		kit.setTenant(tenant);
		kit.setStatus(KitStatus.DRAFT);
		kit.setAppliedCommissionRate(0.10);
		kit.setAppliedGuaranteeRate(0.05);
		kit = kitRepository.saveAndFlush(kit);

		ItemMemento memento = new ItemMemento();
		memento.setOriginalItemId(savedArticle.getId());
		memento.setNameAtRental(savedArticle.getTitle());
		memento.setPriceAtRental(369.99);
		memento.setOwnerAtRental(owner);
		memento.setSelectedUnits(1);
		memento.setCategoryAtRental(savedCategory);
		memento.setSelectedMethod(DeliveryMethod.MEETING_POINT);
		memento.setKit(kit);

		kit = kitRepository.findById(kit.getId()).orElseThrow();
		kit.getSnapshots().add(memento);
		kitRepository.saveAndFlush(kit);

		entityManager.flush();
		entityManager.clear();
	}

	private void saveSimpleWallet(User user) {
		Wallet wallet = new Wallet();
		ReflectionTestUtils.setField(wallet, "user", user);
		ReflectionTestUtils.setField(wallet, "transactions", List.of());
		walletRepository.saveAndFlush(wallet);
	}

	private User createCompleteUser(String name, String email, UserRole role) {
		User user = new User();
		user.setName(name);
		user.setEmail(email);
		user.setRole(role);
		user.setAddress("Calle Inventada 123");
		user.setCity("Madrid");
		user.setCountry("Spain");
		user.setPhone("600123456");
		user.setPassword(passwordEncoder.encode("password123"));
		ReflectionTestUtils.setField(user, "isPilotUser", false);
		return user;
	}

	@Test
	void processWalletPayment_ShouldReturn200AndMarkKitAsPaid() throws Exception {
		mockMvc.perform(post("/api/payments/process/wallet/{kitId}", kit.getId())
				.contentType(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk())
				.andExpect(content().string("Pago con billetera procesado correctamente"));

		Kit updatedKit = kitRepository.findById(kit.getId()).orElseThrow();
		assertThat(updatedKit.getStatus()).isEqualTo(KitStatus.PAID);
	}

	@Test
	void processStripePayment_ShouldReturn200_WhenStatusSucceeded() throws Exception {
		mockMvc.perform(post("/api/payments/process/stripe/{kitId}", kit.getId())
				.contentType(MediaType.APPLICATION_JSON)
				.content("\"succeeded\""))
				.andExpect(status().isOk())
				.andExpect(content().string("Pago procesado correctamente"));

		Kit updatedKit = kitRepository.findById(kit.getId()).orElseThrow();
		assertThat(updatedKit.getStatus()).isEqualTo(KitStatus.PAID);
	}

	@Test
	void processStripePayment_ShouldReturn400_WhenStatusIsNotSucceeded() throws Exception {
		mockMvc.perform(post("/api/payments/process/stripe/{kitId}", kit.getId())
				.contentType(MediaType.APPLICATION_JSON)
				.content("\"failed\""))
				.andExpect(status().isBadRequest())
				.andExpect(content().string(org.hamcrest.Matchers.containsString("Se esperaba un estado de pago succeeded")));

		Kit updatedKit = kitRepository.findById(kit.getId()).orElseThrow();
		assertThat(updatedKit.getStatus()).isEqualTo(KitStatus.DRAFT);
	}

	@Test
	void processWalletPayment_ShouldReturn500_WhenKitDoesNotExist() throws Exception {
		mockMvc.perform(post("/api/payments/process/wallet/{kitId}", 999999L)
				.contentType(MediaType.APPLICATION_JSON))
				.andExpect(status().isInternalServerError())
				.andExpect(content().string(org.hamcrest.Matchers.containsString("Error al procesar el pago con billetera")));
	}
}
