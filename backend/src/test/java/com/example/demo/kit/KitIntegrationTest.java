package com.example.demo.kit;

import com.example.demo.model.*;
import com.example.demo.repository.CategoryRepository;
import com.example.demo.repository.ItemRepository;
import com.example.demo.repository.KitRepository;
import com.example.demo.repository.UserRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;

import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
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


    private User tenant;
    private Kit savedKit;

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

    // TESTS DE INTEGRACIÓN PARA KITS, PRINCIPALMENTE PARA LOS ESTADOS DE LOS KITS Y ALGUNAS VALIDACIONES

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
                .andExpect(status().isNotFound()); // el controller devuelve NOT_FOUND en errores
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
    // TESTS INTEGRACIÓN CU-ARRENDATARIO-07
    // Modificar kits predeterminados (añadir/eliminar productos)
    // ==========================================

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

        // El kit savedKit ya tiene al tenant como arrendatario
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

        // Añadir primera vez
        mockMvc.perform(post("/api/kits/" + savedKit.getId() + "/items/" + article.getId())
                .param("userId", tenant.getId().toString()))
                .andExpect(status().isOk());

        // Intentar añadir de nuevo → duplicado
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

        // Añadir dos items al kit
        mockMvc.perform(post("/api/kits/" + savedKit.getId() + "/items/" + article1.getId())
                .param("userId", tenant.getId().toString()))
                .andExpect(status().isOk());
        mockMvc.perform(post("/api/kits/" + savedKit.getId() + "/items/" + article2.getId())
                .param("userId", tenant.getId().toString()))
                .andExpect(status().isOk());

        // Eliminar uno
        mockMvc.perform(delete("/api/kits/" + savedKit.getId() + "/items/" + article1.getId())
                .param("userId", tenant.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(1))
                .andExpect(jsonPath("$.items[0].itemId").value(article2.getId()));
    }

    @Test
    void testRemoveItemFromKit_lastItem_returnsBadRequest() throws Exception {
        // RN-KIT-11: El kit debe tener al menos un ítem
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

        // Añadir un solo item
        mockMvc.perform(post("/api/kits/" + savedKit.getId() + "/items/" + article.getId())
                .param("userId", tenant.getId().toString()))
                .andExpect(status().isOk());

        // Intentar eliminarlo → kit quedaría vacío
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

        // Añadir solo uno
        mockMvc.perform(post("/api/kits/" + savedKit.getId() + "/items/" + inKit.getId())
                .param("userId", tenant.getId().toString()))
                .andExpect(status().isOk());

        // Intentar eliminar el que no está
        mockMvc.perform(delete("/api/kits/" + savedKit.getId() + "/items/" + notInKit.getId())
                .param("userId", tenant.getId().toString()))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Item is not part of this kit"));
    }

    @Test
    void testAddAndRemoveItem_roundTrip() throws Exception {
        // CU-ARRENDATARIO-07: flujo completo añadir + eliminar
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

        // Añadir ambos
        mockMvc.perform(post("/api/kits/" + savedKit.getId() + "/items/" + article1.getId())
                .param("userId", tenant.getId().toString()))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/kits/" + savedKit.getId() + "/items/" + article2.getId())
                .param("userId", tenant.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(2));

        // Eliminar el primero
        mockMvc.perform(delete("/api/kits/" + savedKit.getId() + "/items/" + article1.getId())
                .param("userId", tenant.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(1))
                .andExpect(jsonPath("$.items[0].itemId").value(article2.getId()));

        // Verificar persistencia leyendo el kit
        mockMvc.perform(get("/api/kits/" + savedKit.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(1));
    }
}
