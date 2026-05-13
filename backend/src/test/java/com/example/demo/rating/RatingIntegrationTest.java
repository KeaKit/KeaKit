package com.example.demo.rating;

import com.example.demo.model.*;
import com.example.demo.repository.*;
import com.example.demo.security.JwtUtil;
import com.example.demo.service.AuthService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@Transactional
@ActiveProfiles("test")
@TestPropertySource(properties = "jwt.secret=TestSecretKeyForJWTTesting123456789012345678901234567890")
class RatingIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private RatingRepository ratingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private KitRepository kitRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @MockitoBean
    private AuthService authService;

    private User tenant;
    private User owner;
    private User thirdUser;

    private Kit finishedKit;

    private String tenantToken;
    private String ownerToken;
    private String thirdUserToken;

    @BeforeEach
    void setUp() {
        tenant = buildUser("Ana Tenant", "tenant-rating@example.com", "600000100");
        owner  = buildUser("Carlos Owner", "owner-rating@example.com", "600000101");
        thirdUser = buildUser("Pedro Ajeno", "third-rating@example.com", "600000102");

        tenant    = userRepository.save(tenant);
        owner     = userRepository.save(owner);
        thirdUser = userRepository.save(thirdUser);

        walletRepository.save(new Wallet(tenant));
        walletRepository.save(new Wallet(owner));
        walletRepository.save(new Wallet(thirdUser));

        tenantToken    = jwtUtil.generateToken(tenant.getEmail(), tenant.getId(), tenant.getRole(), tenant.getTokenVersion());
        ownerToken     = jwtUtil.generateToken(owner.getEmail(), owner.getId(), owner.getRole(), owner.getTokenVersion());
        thirdUserToken = jwtUtil.generateToken(thirdUser.getEmail(), thirdUser.getId(), thirdUser.getRole(), thirdUser.getTokenVersion());

        when(authService.getAuthenticatedUserEmail()).thenReturn(tenant.getEmail());
        when(authService.getAuthenticatedUserId()).thenReturn(tenant.getId());

        Category category = buildCategory();
        category = categoryRepository.save(category);

        Article article = buildArticle("Portátil HP", owner, category);
        article = (Article) itemRepository.save(article);

        finishedKit = new Kit();
        finishedKit.setName("Kit Terminado");
        finishedKit.setCountry("Spain");
        finishedKit.setCity("Sevilla");
        finishedKit.setStartDate(LocalDate.now().minusMonths(2));
        finishedKit.setEndDate(LocalDate.now().minusMonths(1));
        finishedKit.setOrderDate(LocalDate.now().minusMonths(2));
        finishedKit.setStatus(KitStatus.FINISHED);
        finishedKit.setTenant(tenant);
        finishedKit.setAppliedCommissionRate(0.2);
        finishedKit.setAppliedGuaranteeRate(0.2);
        finishedKit = kitRepository.save(finishedKit);

        ItemMemento snapshot = article.createSnapshot(1, DeliveryMethod.COURIER, 9.99, null);
        snapshot.setKit(finishedKit);
        snapshot.setPriceAtRental(article.getPricePerMonth());
        finishedKit.setSnapshots(java.util.List.of(snapshot));
        finishedKit = kitRepository.save(finishedKit);
    }

    private User buildUser(String name, String email, String phone) {
        User u = new User();
        u.setName(name);
        u.setEmail(email);
        u.setPassword("password123");
        u.setRole(UserRole.USER);
        u.setCountry("Spain");
        u.setCity("Sevilla");
        u.setAddress("Calle Test 1");
        u.setPhone(phone);
        return u;
    }

    private Category buildCategory() {
        Category cat = new Category();
        cat.setName("Tecnología-" + System.nanoTime());
        cat.setDescription("Dispositivos y servicios tecnológicos");
        cat.setStatus(CategoryStatus.ACTIVE);
        cat.setMinPrice(0.0);
        cat.setMaxPrice(2000.0);
        return cat;
    }

    private Article buildArticle(String title, User itemOwner, Category category) {
        Article a = new Article();
        a.setTitle(title);
        a.setDescription("Descripción del artículo de prueba");
        a.setCity("Sevilla");
        a.setCountry("Spain");
        a.setPricePerMonth(100.0);
        a.setCategory(category);
        a.setOwner(itemOwner);
        a.setTotalUnits(2);
        a.setStatus(ArticleStatus.AVAILABLE);
        a.setAvailableFrom(LocalDate.now());
        a.setAvailableUntil(LocalDate.now().plusMonths(6));
        return a;
    }

    private String withAuth(String token) {
        return "Bearer " + token;
    }

    private Kit createFinishedKitFor(User kitTenant, User kitOwner, Category category) {
        Article article = buildArticle("Artículo Extra", kitOwner, category);
        article = (Article) itemRepository.save(article);

        Kit kit = new Kit();
        kit.setName("Kit Extra");
        kit.setCountry("Spain");
        kit.setCity("Sevilla");
        kit.setStartDate(LocalDate.now().minusMonths(3));
        kit.setEndDate(LocalDate.now().minusMonths(2));
        kit.setOrderDate(LocalDate.now().minusMonths(3));
        kit.setStatus(KitStatus.FINISHED);
        kit.setTenant(kitTenant);
        kit.setAppliedCommissionRate(0.2);
        kit.setAppliedGuaranteeRate(0.2);
        kit = kitRepository.save(kit);

        ItemMemento snapshot = article.createSnapshot(1, DeliveryMethod.COURIER, 9.99, null);
        snapshot.setKit(kit);
        snapshot.setPriceAtRental(article.getPricePerMonth());
        kit.setSnapshots(java.util.List.of(snapshot));
        return kitRepository.save(kit);
    }

    @Test
    void createRating_tenantRatesOwner_success() throws Exception {
        when(authService.getAuthenticatedUserEmail()).thenReturn(tenant.getEmail());

        String json = """
            {
              "revieweeId": %d,
              "kitId": %d,
              "score": 5,
              "comment": "Excelente propietario, muy profesional."
            }
            """.formatted(owner.getId(), finishedKit.getId());

        mockMvc.perform(post("/api/ratings")
                .header("Authorization", withAuth(tenantToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.score").value(5))
            .andExpect(jsonPath("$.reviewerId").value(tenant.getId()))
            .andExpect(jsonPath("$.revieweeId").value(owner.getId()))
            .andExpect(jsonPath("$.kitId").value(finishedKit.getId()))
            .andExpect(jsonPath("$.type").value("RENTER_TO_OWNER"))
            .andExpect(jsonPath("$.comment").value("Excelente propietario, muy profesional."));
    }

    @Test
    void createRating_ownerRatesTenant_success() throws Exception {
        when(authService.getAuthenticatedUserEmail()).thenReturn(owner.getEmail());

        String json = """
            {
              "revieweeId": %d,
              "kitId": %d,
              "score": 4,
              "comment": "Arrendatario responsable."
            }
            """.formatted(tenant.getId(), finishedKit.getId());

        mockMvc.perform(post("/api/ratings")
                .header("Authorization", withAuth(ownerToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.score").value(4))
            .andExpect(jsonPath("$.type").value("OWNER_TO_RENTER"));
    }

    @Test
    void createRating_withoutComment_success() throws Exception {
        when(authService.getAuthenticatedUserEmail()).thenReturn(tenant.getEmail());

        String json = """
            {
              "revieweeId": %d,
              "kitId": %d,
              "score": 3
            }
            """.formatted(owner.getId(), finishedKit.getId());

        mockMvc.perform(post("/api/ratings")
                .header("Authorization", withAuth(tenantToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.score").value(3))
            .andExpect(jsonPath("$.comment").isEmpty());
    }

    @Test
    void createRating_scoreBelowMin_returnsBadRequest() throws Exception {
        when(authService.getAuthenticatedUserEmail()).thenReturn(tenant.getEmail());

        String json = """
            {
              "revieweeId": %d,
              "kitId": %d,
              "score": 0
            }
            """.formatted(owner.getId(), finishedKit.getId());

        mockMvc.perform(post("/api/ratings")
                .header("Authorization", withAuth(tenantToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(status().isBadRequest());
    }

    @Test
    void createRating_scoreAboveMax_returnsBadRequest() throws Exception {
        when(authService.getAuthenticatedUserEmail()).thenReturn(tenant.getEmail());

        String json = """
            {
              "revieweeId": %d,
              "kitId": %d,
              "score": 6
            }
            """.formatted(owner.getId(), finishedKit.getId());

        mockMvc.perform(post("/api/ratings")
                .header("Authorization", withAuth(tenantToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(status().isBadRequest());
    }

    @Test
    void createRating_scoreMissing_returnsBadRequest() throws Exception {
        when(authService.getAuthenticatedUserEmail()).thenReturn(tenant.getEmail());

        String json = """
            {
              "revieweeId": %d,
              "kitId": %d
            }
            """.formatted(owner.getId(), finishedKit.getId());

        mockMvc.perform(post("/api/ratings")
                .header("Authorization", withAuth(tenantToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(status().isBadRequest());
    }

    @Test
    void createRating_revieweeIdMissing_returnsBadRequest() throws Exception {
        when(authService.getAuthenticatedUserEmail()).thenReturn(tenant.getEmail());

        String json = """
            {
              "kitId": %d,
              "score": 4
            }
            """.formatted(finishedKit.getId());

        mockMvc.perform(post("/api/ratings")
                .header("Authorization", withAuth(tenantToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(status().isBadRequest());
    }

    @Test
    void createRating_userRatesThemself_returnsConflictOrBadRequest() throws Exception {
        when(authService.getAuthenticatedUserEmail()).thenReturn(tenant.getEmail());

        String json = """
            {
              "revieweeId": %d,
              "kitId": %d,
              "score": 5
            }
            """.formatted(tenant.getId(), finishedKit.getId());

        mockMvc.perform(post("/api/ratings")
                .header("Authorization", withAuth(tenantToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(status().isBadRequest());
    }

    @Test
    void createRating_kitNotFinished_returnsBadRequest() throws Exception {
        Kit activeKit = new Kit();
        activeKit.setName("Kit Activo");
        activeKit.setCountry("Spain");
        activeKit.setCity("Sevilla");
        activeKit.setStartDate(LocalDate.now());
        activeKit.setEndDate(LocalDate.now().plusMonths(1));
        activeKit.setStatus(KitStatus.ACTIVE);
        activeKit.setTenant(tenant);
        activeKit = kitRepository.save(activeKit);

        when(authService.getAuthenticatedUserEmail()).thenReturn(tenant.getEmail());

        String json = """
            {
              "revieweeId": %d,
              "kitId": %d,
              "score": 4
            }
            """.formatted(owner.getId(), activeKit.getId());

        mockMvc.perform(post("/api/ratings")
                .header("Authorization", withAuth(tenantToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(status().isBadRequest());
    }

    @Test
    void createRating_kitNotFound_returnsInternalError() throws Exception {
        when(authService.getAuthenticatedUserEmail()).thenReturn(tenant.getEmail());

        String json = """
            {
              "revieweeId": %d,
              "kitId": 999999,
              "score": 4
            }
            """.formatted(owner.getId());

        mockMvc.perform(post("/api/ratings")
                .header("Authorization", withAuth(tenantToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(status().is5xxServerError());
    }

    @Test
    void createRating_revieweeNotFound_returnsNotFound() throws Exception {
        when(authService.getAuthenticatedUserEmail()).thenReturn(tenant.getEmail());

        String json = """
            {
              "revieweeId": 999999,
              "kitId": %d,
              "score": 4
            }
            """.formatted(finishedKit.getId());

        mockMvc.perform(post("/api/ratings")
                .header("Authorization", withAuth(tenantToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(status().isNotFound());
    }

    @Test
    void createRating_duplicate_returnsConflict() throws Exception {
        when(authService.getAuthenticatedUserEmail()).thenReturn(tenant.getEmail());

        String json = """
            {
              "revieweeId": %d,
              "kitId": %d,
              "score": 5,
              "comment": "Primera valoración"
            }
            """.formatted(owner.getId(), finishedKit.getId());

        mockMvc.perform(post("/api/ratings")
                .header("Authorization", withAuth(tenantToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(status().isCreated());

        mockMvc.perform(post("/api/ratings")
                .header("Authorization", withAuth(tenantToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(status().isConflict());
    }

    @Test
    void createRating_thirdUserNotParty_returnsBadRequest() throws Exception {
        when(authService.getAuthenticatedUserEmail()).thenReturn(thirdUser.getEmail());

        String json = """
            {
              "revieweeId": %d,
              "kitId": %d,
              "score": 3
            }
            """.formatted(owner.getId(), finishedKit.getId());

        mockMvc.perform(post("/api/ratings")
                .header("Authorization", withAuth(thirdUserToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(status().isBadRequest());
    }

    @Test
    void createRating_commentExceedsMaxLength_returnsBadRequest() throws Exception {
        when(authService.getAuthenticatedUserEmail()).thenReturn(tenant.getEmail());

        String longComment = "A".repeat(1001);
        String json = """
            {
              "revieweeId": %d,
              "kitId": %d,
              "score": 4,
              "comment": "%s"
            }
            """.formatted(owner.getId(), finishedKit.getId(), longComment);

        mockMvc.perform(post("/api/ratings")
                .header("Authorization", withAuth(tenantToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(status().isBadRequest());
    }

    @Test
    void getRatingsForUser_returnsAllReceivedRatings() throws Exception {
        persistRating(tenant, owner, finishedKit, 4, "Buen trato", RatingType.RENTER_TO_OWNER);

        mockMvc.perform(get("/api/ratings/user/" + owner.getId())
                .header("Authorization", withAuth(ownerToken)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].revieweeId").value(owner.getId()))
            .andExpect(jsonPath("$[0].score").value(4));
    }

    @Test
    void getRatingsForUser_noRatings_returnsEmptyList() throws Exception {
        mockMvc.perform(get("/api/ratings/user/" + thirdUser.getId())
                .header("Authorization", withAuth(thirdUserToken)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void getRatingsForUser_multipleRatings_returnsAll() throws Exception {
        Category cat = buildCategory();
        cat = categoryRepository.save(cat);
        Kit secondKit = createFinishedKitFor(tenant, owner, cat);

        persistRating(tenant, owner, finishedKit, 5, "Perfecto", RatingType.RENTER_TO_OWNER);
        persistRating(tenant, owner, secondKit, 3, "Aceptable", RatingType.RENTER_TO_OWNER);

        mockMvc.perform(get("/api/ratings/user/" + owner.getId())
                .header("Authorization", withAuth(ownerToken)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void getRatingsByUser_returnsSentRatings() throws Exception {
        persistRating(tenant, owner, finishedKit, 5, "Excelente", RatingType.RENTER_TO_OWNER);

        mockMvc.perform(get("/api/ratings/given/" + tenant.getId())
                .header("Authorization", withAuth(tenantToken)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].reviewerId").value(tenant.getId()));
    }

    @Test
    void getRatingsByUser_noRatingsGiven_returnsEmptyList() throws Exception {
        mockMvc.perform(get("/api/ratings/given/" + thirdUser.getId())
                .header("Authorization", withAuth(thirdUserToken)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void getRatingById_success() throws Exception {
        Rating rating = persistRating(tenant, owner, finishedKit, 4, "Bien", RatingType.RENTER_TO_OWNER);

        mockMvc.perform(get("/api/ratings/" + rating.getId())
                .header("Authorization", withAuth(tenantToken)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(rating.getId()))
            .andExpect(jsonPath("$.score").value(4))
            .andExpect(jsonPath("$.comment").value("Bien"))
            .andExpect(jsonPath("$.reviewerName").value(tenant.getName()))
            .andExpect(jsonPath("$.revieweeName").value(owner.getName()))
            .andExpect(jsonPath("$.kitName").value(finishedKit.getName()));
    }

    @Test
    void getRatingById_notFound_returnsNotFound() throws Exception {
        mockMvc.perform(get("/api/ratings/999999")
                .header("Authorization", withAuth(tenantToken)))
            .andExpect(status().isNotFound());
    }

    @Test
    void deleteRating_byReviewer_success() throws Exception {
        when(authService.getAuthenticatedUserEmail()).thenReturn(tenant.getEmail());
        Rating rating = persistRating(tenant, owner, finishedKit, 3, "Pasable", RatingType.RENTER_TO_OWNER);

        mockMvc.perform(delete("/api/ratings/" + rating.getId())
                .header("Authorization", withAuth(tenantToken)))
            .andExpect(status().isOk());

        assertThat(ratingRepository.existsById(rating.getId())).isFalse();
    }

    @Test
    void deleteRating_byAdmin_success() throws Exception {
        User admin = buildUser("Admin User", "admin-del@example.com", "600000199");
        admin.setRole(UserRole.ADMIN);
        admin = userRepository.save(admin);
        walletRepository.save(new Wallet(admin));
        String adminToken = jwtUtil.generateToken(admin.getEmail(), admin.getId(), admin.getRole(), admin.getTokenVersion());

        when(authService.getAuthenticatedUserEmail()).thenReturn(admin.getEmail());

        Rating rating = persistRating(tenant, owner, finishedKit, 5, "OK", RatingType.RENTER_TO_OWNER);

        mockMvc.perform(delete("/api/ratings/" + rating.getId())
                .header("Authorization", withAuth(adminToken)))
            .andExpect(status().isOk());

        assertThat(ratingRepository.existsById(rating.getId())).isFalse();
    }

    @Test
    void deleteRating_byNonOwner_returnsBadRequest() throws Exception {
        when(authService.getAuthenticatedUserEmail()).thenReturn(thirdUser.getEmail());
        Rating rating = persistRating(tenant, owner, finishedKit, 5, "Original", RatingType.RENTER_TO_OWNER);

        mockMvc.perform(delete("/api/ratings/" + rating.getId())
                .header("Authorization", withAuth(thirdUserToken)))
            .andExpect(status().isBadRequest());

        assertThat(ratingRepository.existsById(rating.getId())).isTrue();
    }

    @Test
    void deleteRating_notFound_returnsNotFound() throws Exception {
        when(authService.getAuthenticatedUserEmail()).thenReturn(tenant.getEmail());

        mockMvc.perform(delete("/api/ratings/999999")
                .header("Authorization", withAuth(tenantToken)))
            .andExpect(status().isNotFound());
    }

    @Test
    void hasReviewedItems_notYetReviewed_returnsFalse() throws Exception {
        Long itemId = finishedKit.getSnapshots().get(0).getOriginalItemId();

        mockMvc.perform(get("/api/ratings/has-reviewed")
                .header("Authorization", withAuth(tenantToken))
                .param("reviewerId", tenant.getId().toString())
                .param("kitId", finishedKit.getId().toString())
                .param("itemIds", itemId.toString()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$." + itemId).value(false));
    }

    @Test
    void hasReviewedItems_alreadyReviewed_returnsTrue() throws Exception {
        persistRating(tenant, owner, finishedKit, 5, "Ya valoré", RatingType.RENTER_TO_OWNER);
        Long itemId = finishedKit.getSnapshots().get(0).getOriginalItemId();

        mockMvc.perform(get("/api/ratings/has-reviewed")
                .header("Authorization", withAuth(tenantToken))
                .param("reviewerId", tenant.getId().toString())
                .param("kitId", finishedKit.getId().toString())
                .param("itemIds", itemId.toString()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$." + itemId).value(true));
    }

    @Test
    void hasReviewedItems_itemNotInKit_returnsFalse() throws Exception {
        mockMvc.perform(get("/api/ratings/has-reviewed")
                .header("Authorization", withAuth(tenantToken))
                .param("reviewerId", tenant.getId().toString())
                .param("kitId", finishedKit.getId().toString())
                .param("itemIds", "999999"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.999999").value(false));
    }

    @Test
    void hasReviewedItemInKits_notYetReviewed_returnsFalse() throws Exception {
        Long itemId = finishedKit.getSnapshots().get(0).getOriginalItemId();

        mockMvc.perform(get("/api/ratings/has-reviewed-kit")
                .header("Authorization", withAuth(ownerToken))
                .param("reviewerId", owner.getId().toString())
                .param("itemId", itemId.toString())
                .param("kitIds", finishedKit.getId().toString()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$." + finishedKit.getId()).value(false));
    }

    @Test
    void hasReviewedItemInKits_alreadyReviewed_returnsTrue() throws Exception {
        persistRating(owner, tenant, finishedKit, 4, "Ya valorado", RatingType.OWNER_TO_RENTER);
        Long itemId = finishedKit.getSnapshots().get(0).getOriginalItemId();

        mockMvc.perform(get("/api/ratings/has-reviewed-kit")
                .header("Authorization", withAuth(ownerToken))
                .param("reviewerId", owner.getId().toString())
                .param("itemId", itemId.toString())
                .param("kitIds", finishedKit.getId().toString()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$." + finishedKit.getId()).value(true));
    }

    @Test
    void hasReviewedItemInKits_kitNotFound_returnsFalse() throws Exception {
        Long itemId = finishedKit.getSnapshots().get(0).getOriginalItemId();

        mockMvc.perform(get("/api/ratings/has-reviewed-kit")
                .header("Authorization", withAuth(ownerToken))
                .param("reviewerId", owner.getId().toString())
                .param("itemId", itemId.toString())
                .param("kitIds", "999999"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.999999").value(false));
    }

    @Test
    void fullFlow_bothPartiesRate_success() throws Exception {
        when(authService.getAuthenticatedUserEmail()).thenReturn(tenant.getEmail());
        String jsonTenant = """
            {
              "revieweeId": %d,
              "kitId": %d,
              "score": 5,
              "comment": "Propietario excelente"
            }
            """.formatted(owner.getId(), finishedKit.getId());

        mockMvc.perform(post("/api/ratings")
                .header("Authorization", withAuth(tenantToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonTenant))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.type").value("RENTER_TO_OWNER"));

        when(authService.getAuthenticatedUserEmail()).thenReturn(owner.getEmail());
        String jsonOwner = """
            {
              "revieweeId": %d,
              "kitId": %d,
              "score": 4,
              "comment": "Arrendatario puntual"
            }
            """.formatted(tenant.getId(), finishedKit.getId());

        mockMvc.perform(post("/api/ratings")
                .header("Authorization", withAuth(ownerToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonOwner))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.type").value("OWNER_TO_RENTER"));

        mockMvc.perform(get("/api/ratings/user/" + owner.getId())
                .header("Authorization", withAuth(ownerToken)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(1));

        mockMvc.perform(get("/api/ratings/user/" + tenant.getId())
                .header("Authorization", withAuth(tenantToken)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void fullFlow_createAndDelete_ratingsAreGone() throws Exception {
        when(authService.getAuthenticatedUserEmail()).thenReturn(tenant.getEmail());

        String json = """
            {
              "revieweeId": %d,
              "kitId": %d,
              "score": 2,
              "comment": "Podría mejorar"
            }
            """.formatted(owner.getId(), finishedKit.getId());

        String response = mockMvc.perform(post("/api/ratings")
                .header("Authorization", withAuth(tenantToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(status().isCreated())
            .andReturn()
            .getResponse()
            .getContentAsString();

        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
        Long ratingId = mapper.readTree(response).get("id").asLong();

        mockMvc.perform(delete("/api/ratings/" + ratingId)
                .header("Authorization", withAuth(tenantToken)))
            .andExpect(status().isOk());

        assertThat(ratingRepository.existsById(ratingId)).isFalse();

        mockMvc.perform(get("/api/ratings/user/" + owner.getId())
                .header("Authorization", withAuth(ownerToken)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(0));
    }

    private Rating persistRating(User reviewer, User reviewee, Kit kit,
                                  int score, String comment, RatingType type) {
        Rating rating = new Rating();
        rating.setReviewer(reviewer);
        rating.setReviewee(reviewee);
        rating.setKit(kit);
        rating.setScore(score);
        rating.setComment(comment);
        rating.setType(type);
        rating.setCreatedAt(LocalDateTime.now());
        return ratingRepository.save(rating);
    }
}