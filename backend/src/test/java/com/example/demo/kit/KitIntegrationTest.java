package com.example.demo.kit;

import com.example.demo.model.*;
import com.example.demo.repository.CategoryRepository;
import com.example.demo.repository.ItemRepository;
import com.example.demo.repository.KitRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.JwtUtil;
import com.example.demo.service.AuthService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@Transactional
@ActiveProfiles("test")
class KitIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private KitRepository kitRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @MockBean
    private AuthService authService; 

    private User tenant;
    private Kit savedKit;
    private String authToken;

    @BeforeEach
    void setUp() {
        tenant = new User();
        tenant.setName("Cristina");
        tenant.setEmail("cris@example.com");
        tenant.setPassword("123456");
        tenant.setRole(UserRole.USER);
        tenant.setCountry("España");
        tenant.setCity("Sevilla");
        tenant.setAddress("Calle 123 matame otra vez");
        tenant.setPhone("223456789");
        tenant = userRepository.save(tenant);

        authToken = jwtUtil.generateToken(tenant.getEmail(), tenant.getId(), tenant.getRole());

        when(authService.getAuthenticatedUserId()).thenReturn(tenant.getId());

        savedKit = new Kit();
        savedKit.setName("Kit Inicial");
        savedKit.setCountry("España");
        savedKit.setCity("Sevilla");
        savedKit.setStartDate(LocalDate.now());
        savedKit.setEndDate(LocalDate.now().plusDays(5));
        savedKit.setStatus(KitStatus.ACTIVE);
        savedKit.setTenant(tenant);

        savedKit = kitRepository.save(savedKit);
    }

    private String withAuth() {
        return "Bearer " + authToken;
    }

    private Article createTestArticle(String title, User owner) {
        Category category = categoryRepository.findAll().stream().findFirst().orElseGet(() -> {
            Category cat = new Category();
            cat.setName("TestCat-" + System.nanoTime());
            cat.setDescription("Test category");
            cat.setStatus(CategoryStatus.ACTIVE);
            cat.setMinPrice(0.0);
            cat.setMaxPrice(1000.0);
            return categoryRepository.save(cat);
        });

        Article article = new Article();
        article.setTitle(title);
        article.setDescription("Test description");
        article.setCity("Sevilla");
        article.setPricePerMonth(25.0);
        article.setCategory(category);
        article.setOwner(owner);
        article.setTotalUnits(5);
        article.setStatus(ArticleStatus.AVAILABLE);
        return itemRepository.save(article);
    }

    // ==========================================
    // TESTS DE INTEGRACIÓN PARA KITS, PRINCIPALMENTE PARA LOS ESTADOS DE LOS KITS Y ALGUNAS VALIDACIONES
    // ==========================================

    // ------------------ CREATE ------------------

    @Test
    void testCreateKit_success() throws Exception {
        String json = """
                        {
                  "name": "Kit Nuevo",
                  "country": "España",
                  "city": "Madrid",
                  "startDate": "2026-06-15",
                  "endDate": "2026-06-30",
                  "status": "DRAFT",
                  "deliveryMethod": "MEETING_POINT",
                  "meetingPoint": "Plaza Mayor, bajo la estatua",
                  "tenantId": %d,
                  "itemSelections": [
                  ]
                }
                        """.formatted(tenant.getId());

        mockMvc.perform(post("/api/kits/create")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("DRAFT"))
                .andExpect(jsonPath("$.name").value("Kit Nuevo"));
    }

    @Test
    void testCreateKit_invalidDates() throws Exception {
        String json = """
        {
                  "name": "Kit Nuevo",
                  "country": "España",
                  "city": "Madrid",
                  "startDate": "2026-06-30",
                  "endDate": "2026-06-15",
                  "status": "DRAFT",
                  "deliveryMethod": "MEETING_POINT",
                  "meetingPoint": "Plaza Mayor, bajo la estatua",
                  "tenantId": %d,
                  "itemSelections": [
                  ]
                }
        """.formatted(tenant.getId());

        mockMvc.perform(post("/api/kits/create")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("End date cannot be before start date"));
    }

    // ------------------ GET ------------------

    @Test
    void testGetKit_success() throws Exception {
        mockMvc.perform(get("/api/kits/" + savedKit.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    @Test
    void testGetKit_notFound() throws Exception {
        mockMvc.perform(get("/api/kits/999999"))
                .andExpect(status().isNotFound());
    }

    // ------------------ UPDATE ------------------

    @Test
    void testUpdateKit_changeStatus() throws Exception {
        String json = """
        {
            "status": "FINISHED"
        }
        """;

        mockMvc.perform(put("/api/kits/" + savedKit.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("FINISHED"));

        Kit updated = kitRepository.findById(savedKit.getId()).orElseThrow();
        assertThat(updated.getStatus()).isEqualTo(KitStatus.FINISHED);
    }

    @Test
    void testUpdateKit_invalidDates() throws Exception {
        String json = """
        {
            "startDate": "2024-06-10",
            "endDate": "2024-06-01"
        }
        """;

        mockMvc.perform(put("/api/kits/" + savedKit.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isNotFound());
    }

    // ------------------ DELETE ------------------

    @Test
    void testDeleteKit_success() throws Exception {
        mockMvc.perform(delete("/api/kits/" + savedKit.getId()))
                .andExpect(status().isOk());

        assertThat(kitRepository.existsById(savedKit.getId())).isFalse();
    }

    @Test
    void testDeleteKit_notFound() throws Exception {
        mockMvc.perform(delete("/api/kits/999999"))
                .andExpect(status().isNotFound());
    }

    // ------------------ TENANT FILTER ------------------

    @Test
    void testGetMyKits_success() throws Exception {
        mockMvc.perform(get("/api/kits/my-kits/" + tenant.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    // ------------------ TRACKING ------------------

    @Test
    void testTrackingKit_success() throws Exception {
        mockMvc.perform(get("/api/kits/my-kits/" + tenant.getId() + "/" + savedKit.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    @Test
    void testTrackingKit_wrongTenant() throws Exception {
        mockMvc.perform(get("/api/kits/my-kits/999/" + savedKit.getId()))
                .andExpect(status().isNotFound());
    }

    // ==========================================
    // TESTS HISTÓRICO DE KITS
    // ==========================================

    @Test
    void testGetMyHistory_success() throws Exception {
        Kit kit1 = new Kit();
        kit1.setName("Kit Histórico 1");
        kit1.setCountry("España");
        kit1.setCity("Sevilla");
        kit1.setStartDate(LocalDate.now().minusMonths(3));
        kit1.setEndDate(LocalDate.now().minusMonths(2));
        kit1.setOrderDate(LocalDate.now().minusMonths(3));
        kit1.setStatus(KitStatus.FINISHED);
        kit1.setTenant(tenant);
        kit1 = kitRepository.save(kit1);

        Kit kit2 = new Kit();
        kit2.setName("Kit Activo Actual");
        kit2.setCountry("España");
        kit2.setCity("Sevilla");
        kit2.setStartDate(LocalDate.now());
        kit2.setEndDate(LocalDate.now().plusDays(10));
        kit2.setOrderDate(LocalDate.now());
        kit2.setStatus(KitStatus.ACTIVE);
        kit2.setTenant(tenant);
        kit2 = kitRepository.save(kit2);

        Kit kit3 = new Kit();
        kit3.setName("Kit Borrador");
        kit3.setCountry("España");
        kit3.setCity("Sevilla");
        kit3.setStartDate(LocalDate.now().plusDays(5));
        kit3.setEndDate(LocalDate.now().plusDays(15));
        kit3.setOrderDate(LocalDate.now());
        kit3.setStatus(KitStatus.DRAFT);
        kit3.setTenant(tenant);
        kit3 = kitRepository.save(kit3);

        mockMvc.perform(get("/api/kits/my-history")
                .header("Authorization", withAuth())
                .param("page", "0")
                .param("size", "10"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content.length()").value(3))
            .andExpect(jsonPath("$.totalElements").value(3))
            .andExpect(jsonPath("$.totalPages").value(1));
    }

    @Test
    void testGetMyHistory_withPagination_returnsCorrectPage() throws Exception {
        for (int i = 0; i < 14; i++) {
            Kit kit = new Kit();
            kit.setName("Kit " + i);
            kit.setCountry("España");
            kit.setCity("Sevilla");
            kit.setStartDate(LocalDate.now().minusDays(i));
            kit.setEndDate(LocalDate.now().plusDays(10 - i));
            kit.setOrderDate(LocalDate.now().minusDays(i));
            kit.setStatus(i % 2 == 0 ? KitStatus.FINISHED : KitStatus.ACTIVE);
            kit.setTenant(tenant);
            kitRepository.save(kit);
        }

        mockMvc.perform(get("/api/kits/my-history")
                .header("Authorization", withAuth())
                .param("page", "0")
                .param("size", "5"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content.length()").value(5))
            .andExpect(jsonPath("$.totalElements").value(15))
            .andExpect(jsonPath("$.totalPages").value(3))
            .andExpect(jsonPath("$.number").value(0))
            .andExpect(jsonPath("$.size").value(5));

        mockMvc.perform(get("/api/kits/my-history")
                .header("Authorization", withAuth())
                .param("page", "1")
                .param("size", "5"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content.length()").value(5))
            .andExpect(jsonPath("$.number").value(1));
    }

    @Test
    void testGetMyHistory_withDefaultParams_usesDefaultValues() throws Exception {
        for (int i = 0; i < 4; i++) {
            Kit kit = new Kit();
            kit.setName("Kit " + i);
            kit.setCountry("España");
            kit.setCity("Sevilla");
            kit.setStartDate(LocalDate.now());
            kit.setEndDate(LocalDate.now().plusDays(10));
            kit.setOrderDate(LocalDate.now());
            kit.setStatus(KitStatus.FINISHED);
            kit.setTenant(tenant);
            kitRepository.save(kit);
        }

        mockMvc.perform(get("/api/kits/my-history")
                .header("Authorization", withAuth()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content.length()").value(5))
            .andExpect(jsonPath("$.number").value(0))
            .andExpect(jsonPath("$.size").value(10));
    }

    @Test
    void testGetMyHistory_excludesDraftKits() throws Exception {        
        Kit activeKit = new Kit();
        activeKit.setName("Kit Activo");
        activeKit.setCountry("España");
        activeKit.setCity("Sevilla");
        activeKit.setStartDate(LocalDate.now());
        activeKit.setEndDate(LocalDate.now().plusDays(10));
        activeKit.setOrderDate(LocalDate.now());
        activeKit.setStatus(KitStatus.ACTIVE);
        activeKit.setTenant(tenant);
        kitRepository.save(activeKit);

        Kit finishedKit = new Kit();
        finishedKit.setName("Kit Finalizado");
        finishedKit.setCountry("España");
        finishedKit.setCity("Sevilla");
        finishedKit.setStartDate(LocalDate.now().minusMonths(1));
        finishedKit.setEndDate(LocalDate.now().minusDays(1));
        finishedKit.setOrderDate(LocalDate.now().minusMonths(1));
        finishedKit.setStatus(KitStatus.FINISHED);
        finishedKit.setTenant(tenant);
        kitRepository.save(finishedKit);

        Kit draftKit = new Kit();
        draftKit.setName("Kit Borrador");
        draftKit.setCountry("España");
        draftKit.setCity("Sevilla");
        draftKit.setStartDate(LocalDate.now().plusDays(5));
        draftKit.setEndDate(LocalDate.now().plusDays(15));
        draftKit.setOrderDate(LocalDate.now());
        draftKit.setStatus(KitStatus.DRAFT);
        draftKit.setTenant(tenant);
        kitRepository.save(draftKit);

        mockMvc.perform(get("/api/kits/my-history")
                .header("Authorization", withAuth()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content.length()").value(3))
            .andExpect(jsonPath("$.content[?(@.name=='Kit Inicial')]").exists())
            .andExpect(jsonPath("$.content[?(@.name=='Kit Activo')]").exists())
            .andExpect(jsonPath("$.content[?(@.name=='Kit Finalizado')]").exists())
            .andExpect(jsonPath("$.content[?(@.name=='Kit Borrador')]").doesNotExist());
    }

    @Test
    void testGetMyHistory_withInvalidPage_usesDefault() throws Exception {
        mockMvc.perform(get("/api/kits/my-history")
                .header("Authorization", withAuth())
                .param("page", "-1")
                .param("size", "5"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.number").value(0));
    }

    @Test
    void testGetMyHistory_withInvalidSize_usesDefault() throws Exception {
        mockMvc.perform(get("/api/kits/my-history")
                .header("Authorization", withAuth())
                .param("page", "0")
                .param("size", "0"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.size").value(1));
    }

    @Test
    void testGetMyHistory_whenNoKits_returnsEmptyPage() throws Exception {
        User emptyUser = new User();
        emptyUser.setName("Usuario Sin Kits");
        emptyUser.setEmail("empty@example.com");
        emptyUser.setPassword("123456");
        emptyUser.setRole(UserRole.USER);
        emptyUser.setCountry("España");
        emptyUser.setCity("Madrid");
        emptyUser.setAddress("Calle Vacía");
        emptyUser.setPhone("999999999");
        emptyUser = userRepository.save(emptyUser);
        
        String emptyUserToken = jwtUtil.generateToken(emptyUser.getEmail(), emptyUser.getId(), emptyUser.getRole());
        
        when(authService.getAuthenticatedUserId()).thenReturn(emptyUser.getId());

        mockMvc.perform(get("/api/kits/my-history")
                .header("Authorization", "Bearer " + emptyUserToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content").isEmpty())
            .andExpect(jsonPath("$.totalElements").value(0))
            .andExpect(jsonPath("$.totalPages").value(0));
        
        when(authService.getAuthenticatedUserId()).thenReturn(tenant.getId());
    }

    @Test
    void testGetMyHistory_returnsOrderedByOrderDateDesc() throws Exception {
        User testUser = new User();
        testUser.setName("Usuario Test Orden");
        testUser.setEmail("testorden@example.com");
        testUser.setPassword("123456");
        testUser.setRole(UserRole.USER);
        testUser.setCountry("España");
        testUser.setCity("Madrid");
        testUser.setAddress("Calle Test");
        testUser.setPhone("888888888");
        testUser = userRepository.save(testUser);
        
        String testUserToken = jwtUtil.generateToken(testUser.getEmail(), testUser.getId(), testUser.getRole());
        
        when(authService.getAuthenticatedUserId()).thenReturn(testUser.getId());
        
        LocalDate today = LocalDate.now();
        
        Kit newestKit = new Kit();
        newestKit.setName("Kit Nuevo (Hoy)");
        newestKit.setOrderDate(today);
        newestKit.setStartDate(today);
        newestKit.setEndDate(today.plusDays(10));
        newestKit.setStatus(KitStatus.ACTIVE);
        newestKit.setTenant(testUser);
        newestKit.setCountry("España");
        newestKit.setCity("Sevilla");
        newestKit = kitRepository.save(newestKit);
        
        Kit middleKit = new Kit();
        middleKit.setName("Kit Medio (Hace 2 días)");
        middleKit.setOrderDate(today.minusDays(2));
        middleKit.setStartDate(today.minusDays(2));
        middleKit.setEndDate(today.plusDays(5));
        middleKit.setStatus(KitStatus.ACTIVE);
        middleKit.setTenant(testUser);
        middleKit.setCountry("España");
        middleKit.setCity("Sevilla");
        middleKit = kitRepository.save(middleKit);
        
        Kit oldestKit = new Kit();
        oldestKit.setName("Kit Antiguo (Hace 10 días)");
        oldestKit.setOrderDate(today.minusDays(10));
        oldestKit.setStartDate(today.minusDays(10));
        oldestKit.setEndDate(today.minusDays(3));
        oldestKit.setStatus(KitStatus.FINISHED);
        oldestKit.setTenant(testUser);
        oldestKit.setCountry("España");
        oldestKit.setCity("Sevilla");
        oldestKit = kitRepository.save(oldestKit);
        
        Thread.sleep(100);
        
        mockMvc.perform(get("/api/kits/my-history")
                .header("Authorization", "Bearer " + testUserToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content.length()").value(3))
            .andExpect(jsonPath("$.content[0].name").value("Kit Nuevo (Hoy)"))
            .andExpect(jsonPath("$.content[1].name").value("Kit Medio (Hace 2 días)"))
            .andExpect(jsonPath("$.content[2].name").value("Kit Antiguo (Hace 10 días)"));
        
        when(authService.getAuthenticatedUserId()).thenReturn(tenant.getId());
    }
    
    @Test
    void testGetMyHistory_whenAuthFails_returnsBadRequest() throws Exception {
        when(authService.getAuthenticatedUserId()).thenThrow(new RuntimeException("No autenticado"));
        
        mockMvc.perform(get("/api/kits/my-history")
                .header("Authorization", withAuth()))
            .andExpect(status().isBadRequest())
            .andExpect(content().string("No autenticado"));
    }

    // ==========================================
    // TESTS INTEGRACIÓN CU-ARRENDATARIO-07
    // Modificar kits predeterminados (añadir/eliminar productos)
    // ==========================================

    @Test
    void testAddItemToKit_success() throws Exception {
        User owner = new User();
        owner.setName("Dueño");
        owner.setEmail("owner-add@test.com");
        owner.setPassword("123456");
        owner.setRole(UserRole.USER);
        owner.setCountry("España");
        owner.setCity("Sevilla");
        owner.setAddress("Calle A");
        owner.setPhone("600000001");
        owner = userRepository.save(owner);

        Article article = createTestArticle("Taladro Test", owner);

        mockMvc.perform(post("/api/kits/" + savedKit.getId() + "/items/" + article.getId())
                .param("userId", tenant.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isArray())
                .andExpect(jsonPath("$.items.length()").value(1))
                .andExpect(jsonPath("$.items[0].itemId").value(article.getId()));
    }

    @Test
    void testAddItemToKit_duplicateItem_returnsBadRequest() throws Exception {
        User owner = new User();
        owner.setName("Dueño2");
        owner.setEmail("owner-dup@test.com");
        owner.setPassword("123456");
        owner.setRole(UserRole.USER);
        owner.setCountry("España");
        owner.setCity("Sevilla");
        owner.setAddress("Calle B");
        owner.setPhone("600000002");
        owner = userRepository.save(owner);

        Article article = createTestArticle("Sierra", owner);

        mockMvc.perform(post("/api/kits/" + savedKit.getId() + "/items/" + article.getId())
                .param("userId", tenant.getId().toString()))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/kits/" + savedKit.getId() + "/items/" + article.getId())
                .param("userId", tenant.getId().toString()))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("This item is already in the kit"));
    }

    @Test
    void testAddItemToKit_itemNotFound_returnsBadRequest() throws Exception {
        mockMvc.perform(post("/api/kits/" + savedKit.getId() + "/items/999999")
                .param("userId", tenant.getId().toString()))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Item not found"));
    }

    @Test
    void testRemoveItemFromKit_success() throws Exception {
        User owner = new User();
        owner.setName("Dueño3");
        owner.setEmail("owner-rem@test.com");
        owner.setPassword("123456");
        owner.setRole(UserRole.USER);
        owner.setCountry("España");
        owner.setCity("Sevilla");
        owner.setAddress("Calle C");
        owner.setPhone("600000003");
        owner = userRepository.save(owner);

        Article article1 = createTestArticle("Martillo", owner);
        Article article2 = createTestArticle("Destornillador", owner);

        mockMvc.perform(post("/api/kits/" + savedKit.getId() + "/items/" + article1.getId())
                .param("userId", tenant.getId().toString()))
                .andExpect(status().isOk());
        mockMvc.perform(post("/api/kits/" + savedKit.getId() + "/items/" + article2.getId())
                .param("userId", tenant.getId().toString()))
                .andExpect(status().isOk());

        mockMvc.perform(delete("/api/kits/" + savedKit.getId() + "/items/" + article1.getId())
                .param("userId", tenant.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(1))
                .andExpect(jsonPath("$.items[0].itemId").value(article2.getId()));
    }

    @Test
    void testRemoveItemFromKit_lastItem_returnsBadRequest() throws Exception {
        User owner = new User();
        owner.setName("Dueño4");
        owner.setEmail("owner-last@test.com");
        owner.setPassword("123456");
        owner.setRole(UserRole.USER);
        owner.setCountry("España");
        owner.setCity("Sevilla");
        owner.setAddress("Calle D");
        owner.setPhone("600000004");
        owner = userRepository.save(owner);

        Article article = createTestArticle("Único item", owner);

        mockMvc.perform(post("/api/kits/" + savedKit.getId() + "/items/" + article.getId())
                .param("userId", tenant.getId().toString()))
                .andExpect(status().isOk());

        mockMvc.perform(delete("/api/kits/" + savedKit.getId() + "/items/" + article.getId())
                .param("userId", tenant.getId().toString()))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("A kit cannot be empty. It must contain at least one item."));
    }

    @Test
    void testRemoveItemFromKit_itemNotInKit_returnsBadRequest() throws Exception {
        User owner = new User();
        owner.setName("Dueño5");
        owner.setEmail("owner-not@test.com");
        owner.setPassword("123456");
        owner.setRole(UserRole.USER);
        owner.setCountry("España");
        owner.setCity("Sevilla");
        owner.setAddress("Calle E");
        owner.setPhone("600000005");
        owner = userRepository.save(owner);

        Article inKit = createTestArticle("En kit", owner);
        Article notInKit = createTestArticle("No en kit", owner);

        mockMvc.perform(post("/api/kits/" + savedKit.getId() + "/items/" + inKit.getId())
                .param("userId", tenant.getId().toString()))
                .andExpect(status().isOk());

        mockMvc.perform(delete("/api/kits/" + savedKit.getId() + "/items/" + notInKit.getId())
                .param("userId", tenant.getId().toString()))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Item is not part of this kit"));
    }

    @Test
    void testAddAndRemoveItem_roundTrip() throws Exception {
        User owner = new User();
        owner.setName("Dueño6");
        owner.setEmail("owner-rt@test.com");
        owner.setPassword("123456");
        owner.setRole(UserRole.USER);
        owner.setCountry("España");
        owner.setCity("Sevilla");
        owner.setAddress("Calle F");
        owner.setPhone("600000006");
        owner = userRepository.save(owner);

        Article article1 = createTestArticle("Item A", owner);
        Article article2 = createTestArticle("Item B", owner);

        mockMvc.perform(post("/api/kits/" + savedKit.getId() + "/items/" + article1.getId())
                .param("userId", tenant.getId().toString()))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/kits/" + savedKit.getId() + "/items/" + article2.getId())
                .param("userId", tenant.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(2));

        mockMvc.perform(delete("/api/kits/" + savedKit.getId() + "/items/" + article1.getId())
                .param("userId", tenant.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(1))
                .andExpect(jsonPath("$.items[0].itemId").value(article2.getId()));

        mockMvc.perform(get("/api/kits/" + savedKit.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(1));
    }
}