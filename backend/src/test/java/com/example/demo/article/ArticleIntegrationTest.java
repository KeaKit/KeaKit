package com.example.demo.article;

import com.example.demo.model.*;
import com.example.demo.repository.ArticleRepository;
import com.example.demo.repository.CategoryRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@Transactional
@ActiveProfiles("test")
class ArticleIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ArticleRepository articleRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private CategoryRepository categoryRepository;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private EntityManager entityManager;

    @MockitoBean private AuthService authService;

    private User savedOwner;
    private Article savedArticle;
    private Category savedCategory;

    // Fechas futuras reutilizables (RN-ART-10)
    private static final LocalDate FROM  = LocalDate.now().plusDays(1);
    private static final LocalDate UNTIL = LocalDate.now().plusDays(30);

    @BeforeEach
    void setUp() {
        articleRepository.deleteAll();

        User owner = new User();
        owner.setName("Juan");
        owner.setEmail("juan@example.com");
        owner.setPassword("123456");
        owner.setRole(UserRole.USER);
        owner.setCountry("España");
        owner.setCity("Sevilla");
        owner.setAddress("Calle 123");
        owner.setPhone("123456789");
        savedOwner = userRepository.save(owner);

        // Rango 5–500 para probar RN-ART-06
        Category category = new Category("Bricolaje", "Cosas de taller", 5.0, 500.0);
        category.setStatus(CategoryStatus.ACTIVE);
        savedCategory = categoryRepository.save(category);

        Article article = new Article();
        article.setTitle("Taladro");
        article.setDescription("Un taladro potente");
        article.setCity("Madrid");
        article.setPricePerMonth(50.0);
        article.setStatus(ArticleStatus.AVAILABLE);
        article.setAvailableFrom(FROM);     // RN-ART-10
        article.setAvailableUntil(UNTIL);
        article.setOwner(savedOwner);
        article.setCategory(savedCategory);
        savedArticle = articleRepository.save(article);
    }

    // ------------ POST /api/article/upload ------------

    @Test
    void testUploadArticle_Integration_Success() throws Exception {
        Article newArticle = new Article();
        newArticle.setTitle("Escalera");
        newArticle.setDescription("Escalera de aluminio");
        newArticle.setCity("Barcelona");
        newArticle.setPricePerMonth(30.0);
        newArticle.setAvailableFrom(FROM);
        newArticle.setAvailableUntil(UNTIL);

        mockMvc.perform(post("/api/article/upload")
                .param("ownerId", savedOwner.getId().toString())
                .param("categoryId", savedCategory.getId().toString())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newArticle)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.title").value("Escalera"))
            .andExpect(jsonPath("$.city").value("Barcelona"));
    }

    @Test
    void testUploadArticle_Integration_Failure_OwnerNotFound() throws Exception {
        Article newArticle = new Article();
        newArticle.setTitle("Escalera");
        newArticle.setDescription("Escalera de aluminio");
        newArticle.setCity("Barcelona");
        newArticle.setPricePerMonth(30.0);

        mockMvc.perform(post("/api/article/upload")
                .param("ownerId", "999999")
                .param("categoryId", savedCategory.getId().toString())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newArticle)))
            .andExpect(status().isBadRequest())
            .andExpect(content().string("Propietario no encontrado"));
    }

    @Test
    void testUploadArticle_Integration_Failure_MissingTitle() throws Exception {
        Article newArticle = new Article();
        newArticle.setDescription("Descripcion");
        newArticle.setCity("Valencia");
        newArticle.setPricePerMonth(20.0);

        mockMvc.perform(post("/api/article/upload")
                .param("ownerId", savedOwner.getId().toString())
                .param("categoryId", savedCategory.getId().toString())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newArticle)))
            .andExpect(status().isBadRequest())
            .andExpect(content().string("Título requerido"));
    }

    @Test
    void testUploadArticle_Integration_Failure_NegativePrice() throws Exception {
        Article newArticle = new Article();
        newArticle.setTitle("Martillo");
        newArticle.setDescription("Martillo de carpintero");
        newArticle.setCity("Sevilla");
        newArticle.setPricePerMonth(-5.0);

        mockMvc.perform(post("/api/article/upload")
                .param("ownerId", savedOwner.getId().toString())
                .param("categoryId", savedCategory.getId().toString())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newArticle)))
            .andExpect(status().isBadRequest())
            .andExpect(content().string("El precio por mes debe ser un valor positivo"));
    }

    // RN-ART-06: precio fuera del rango de la categoría (5–500)
    @Test
    void testUploadArticle_Integration_Failure_PriceOutOfCategoryRange() throws Exception {
        Article newArticle = new Article();
        newArticle.setTitle("Grúa");
        newArticle.setDescription("Grúa industrial");
        newArticle.setCity("Bilbao");
        newArticle.setPricePerMonth(9999.0);  // > maxPrice 500

        mockMvc.perform(post("/api/article/upload")
                .param("ownerId", savedOwner.getId().toString())
                .param("categoryId", savedCategory.getId().toString())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newArticle)))
            .andExpect(status().isBadRequest())
            .andExpect(content().string(org.hamcrest.Matchers.containsString("El precio por mes debe estar entre")));
    }

    // RN-ART-03: descripción > 1000 caracteres
    @Test
    void testUploadArticle_Integration_Failure_DescriptionTooLong() throws Exception {
        Article newArticle = new Article();
        newArticle.setTitle("Taladro");
        newArticle.setDescription("a".repeat(1001));
        newArticle.setCity("Madrid");
        newArticle.setPricePerMonth(50.0);

        mockMvc.perform(post("/api/article/upload")
                .param("ownerId", savedOwner.getId().toString())
                .param("categoryId", savedCategory.getId().toString())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newArticle)))
            .andExpect(status().isBadRequest())
            .andExpect(content().string("La descripción no puede exceder los 1000 caracteres"));
    }

    // RN-ART-11: availableFrom posterior a availableUntil
    @Test
    void testUploadArticle_Integration_Failure_InvalidDateRange() throws Exception {
        Article newArticle = new Article();
        newArticle.setTitle("Fresadora");
        newArticle.setDescription("Fresadora CNC");
        newArticle.setCity("Bilbao");
        newArticle.setPricePerMonth(100.0);
        newArticle.setAvailableFrom(LocalDate.now().plusDays(10));
        newArticle.setAvailableUntil(LocalDate.now().plusDays(1));  

        mockMvc.perform(post("/api/article/upload")
                .param("ownerId", savedOwner.getId().toString())
                .param("categoryId", savedCategory.getId().toString())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newArticle)))
            .andExpect(status().isBadRequest())
            .andExpect(content().string("La fecha de inicio de disponibilidad debe ser posterior o igual a la fecha de finalización"));
    }

    @Test
    void testUploadArticle_Integration_Failure_AvailableFromInPast() throws Exception {
        Article newArticle = new Article();
        newArticle.setTitle("Sierra");
        newArticle.setDescription("Sierra circular");
        newArticle.setCity("Madrid");
        newArticle.setPricePerMonth(50.0);
        newArticle.setAvailableFrom(LocalDate.now().minusDays(1));  
        newArticle.setAvailableUntil(LocalDate.now().plusDays(30));

        mockMvc.perform(post("/api/article/upload")
                .param("ownerId", savedOwner.getId().toString())
                .param("categoryId", savedCategory.getId().toString())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newArticle)))
            .andExpect(status().isBadRequest())
            .andExpect(content().string("La fecha de inicio de disponibilidad no puede ser pasada a la actual"));
    }


    @Test
    void testGetAllArticles_Integration() throws Exception {
        mockMvc.perform(get("/api/article/all"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].title").value("Taladro"));
    }

    @Test
    void testGetAllArticles_Integration_MultipleArticles() throws Exception {
        Article second = new Article();
        second.setTitle("Sierra");
        second.setDescription("Sierra eléctrica");
        second.setCity("Zaragoza");
        second.setPricePerMonth(40.0);
        second.setStatus(ArticleStatus.AVAILABLE);
        second.setAvailableFrom(FROM);
        second.setAvailableUntil(UNTIL);
        second.setCategory(savedCategory);
        second.setOwner(savedOwner);
        articleRepository.save(second);

        mockMvc.perform(get("/api/article/all"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(2));
    }


    @Test
    void testUpdateArticle_Integration() throws Exception {
        Article updateData = new Article();
        updateData.setTitle("Taladro Percutor");

        mockMvc.perform(put("/api/article/" + savedArticle.getId())
                .param("ownerId", savedOwner.getId().toString())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateData)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.title").value("Taladro Percutor"));

        Article inDb = articleRepository.findById(savedArticle.getId()).orElseThrow();
        assertThat(inDb.getTitle()).isEqualTo("Taladro Percutor");
    }

    @Test
    void testUpdateArticle_Integration_Failure_DescriptionTooLong() throws Exception {
        Article updateData = new Article();
        updateData.setDescription("a".repeat(1001));

        mockMvc.perform(put("/api/article/" + savedArticle.getId())
                .param("ownerId", savedOwner.getId().toString())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateData)))
            .andExpect(status().isBadRequest())
            .andExpect(content().string("La descripción no puede exceder 1000 caracteres"));
    }

    @Test
    void testUpdateArticle_Integration_Failure_PriceOutOfCategoryRange() throws Exception {
        Article updateData = new Article();
        updateData.setPricePerMonth(9999.0);

        mockMvc.perform(put("/api/article/" + savedArticle.getId())
                .param("ownerId", savedOwner.getId().toString())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateData)))
            .andExpect(status().isBadRequest())
            .andExpect(content().string(org.hamcrest.Matchers.containsString("El precio por mes debe estar entre")));
    }

    @Test
    void testUpdateArticle_Integration_Failure_ArticleNotFound() throws Exception {
        Article updateData = new Article();
        updateData.setTitle("Nuevo titulo");

        mockMvc.perform(put("/api/article/999999")
                .param("ownerId", savedOwner.getId().toString())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateData)))
            .andExpect(status().isBadRequest())
            .andExpect(content().string("Artículo no encontrado"));
    }

    @Test
    void testUpdateArticle_Integration_Failure_Rented() throws Exception {
        savedArticle.setStatus(ArticleStatus.RENTED);
        articleRepository.save(savedArticle);

        Article updateData = new Article();
        updateData.setTitle("Nuevo titulo");

        mockMvc.perform(put("/api/article/" + savedArticle.getId())
                .param("ownerId", savedOwner.getId().toString())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateData)))
            .andExpect(status().isBadRequest())
            .andExpect(content().string("El artículo está actualmente alquilado y no puede ser editado"));
    }

    @Test
    void testUpdateArticle_Integration_Failure_OwnerMismatch() throws Exception {
        Article updateData = new Article();
        updateData.setTitle("Intento fallido");

        mockMvc.perform(put("/api/article/" + savedArticle.getId())
                .param("ownerId", "999")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateData)))
            .andExpect(status().isBadRequest())
            .andExpect(content().string("Solo el propietario puede modificar este artículo"));
    }

    @Test
    void testUpdateArticle_Integration_Failure_CannotChangeStatus() throws Exception {
        Article updateData = new Article();
        updateData.setStatus(ArticleStatus.RENTED);

        mockMvc.perform(put("/api/article/" + savedArticle.getId())
                .param("ownerId", savedOwner.getId().toString())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateData)))
            .andExpect(status().isBadRequest())
            .andExpect(content().string("No se puede cambiar el estado a través de la actualización; use el endpoint toggleRent"));
    }

    // ------------ DELETE /api/article/{id} ------------

    @Test
    void testDeleteArticle_Integration() throws Exception {
        mockMvc.perform(delete("/api/article/" + savedArticle.getId())
                .param("ownerId", savedOwner.getId().toString()))
            .andExpect(status().isNoContent());

        assertThat(articleRepository.findById(savedArticle.getId())).isEmpty();
    }

    @Test
    void testDeleteArticle_Failure_OwnerMismatch() throws Exception {
        mockMvc.perform(delete("/api/article/" + savedArticle.getId())
                .param("ownerId", "999"))
            .andExpect(status().isBadRequest())
            .andExpect(content().string("Solo el propietario puede eliminar este artículo"));

        assertThat(articleRepository.existsById(savedArticle.getId())).isTrue();
    }

    @Test
    void testDeleteArticle_Failure_ArticleNotFound() throws Exception {
        mockMvc.perform(delete("/api/article/999999")
                .param("ownerId", savedOwner.getId().toString()))
            .andExpect(status().isBadRequest())
            .andExpect(content().string("Artículo no encontrado"));
    }

    @Test
    void testDeleteArticle_Failure_Rented() throws Exception {
        savedArticle.setStatus(ArticleStatus.RENTED);
        articleRepository.save(savedArticle);

        mockMvc.perform(delete("/api/article/" + savedArticle.getId())
                .param("ownerId", savedOwner.getId().toString()))
            .andExpect(status().isBadRequest())
            .andExpect(content().string("El artículo está actualmente alquilado y no puede ser eliminado"));

        assertThat(articleRepository.existsById(savedArticle.getId())).isTrue();
    }


    @Test
    void testToggleRent_Integration() throws Exception {
        mockMvc.perform(post("/api/article/" + savedArticle.getId() + "/toggle-rent")
                .param("ownerId", savedOwner.getId().toString()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("RENTED"));

        Article rentedInDb = articleRepository.findById(savedArticle.getId()).orElseThrow();
        assertThat(rentedInDb.getStatus()).isEqualTo(ArticleStatus.RENTED);
    }

    @Test
    void testToggleRent_Integration_RentedBackToAvailable() throws Exception {
        savedArticle.setStatus(ArticleStatus.RENTED);
        articleRepository.save(savedArticle);

        mockMvc.perform(post("/api/article/" + savedArticle.getId() + "/toggle-rent")
                .param("ownerId", savedOwner.getId().toString()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("AVAILABLE"));

        Article inDb = articleRepository.findById(savedArticle.getId()).orElseThrow();
        assertThat(inDb.getStatus()).isEqualTo(ArticleStatus.AVAILABLE);
    }

    @Test
    void testToggleRent_Integration_Failure_Inactive() throws Exception {
        savedArticle.setStatus(ArticleStatus.INACTIVE);
        articleRepository.save(savedArticle);

        mockMvc.perform(post("/api/article/" + savedArticle.getId() + "/toggle-rent")
                .param("ownerId", savedOwner.getId().toString()))
            .andExpect(status().isBadRequest())
            .andExpect(content().string("Los artículos inactivos no pueden ser alquilados"));
    }

    @Test
    void testToggleRent_Integration_Failure_OwnerMismatch() throws Exception {
        mockMvc.perform(post("/api/article/" + savedArticle.getId() + "/toggle-rent")
                .param("ownerId", "999"))
            .andExpect(status().isBadRequest())
            .andExpect(content().string("Solo el propietario puede cambiar el estado de alquiler"));
    }

    @Test
    void testToggleRent_Integration_Failure_ArticleNotFound() throws Exception {
        mockMvc.perform(post("/api/article/999999/toggle-rent")
                .param("ownerId", savedOwner.getId().toString()))
            .andExpect(status().isBadRequest())
        .andExpect(content().string("Artículo no encontrado"));
    }


    @Test
    void testGetArticleCountByCategory_Integration() throws Exception {
        mockMvc.perform(get("/api/article/category/" + savedCategory.getId() + "/count"))
            .andExpect(status().isOk())
            .andExpect(content().string("1"));
    }


    @Test
    void testGetLatestArticlesByCategory_Integration() throws Exception {
        mockMvc.perform(get("/api/article/category/" + savedCategory.getId() + "/latest"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].title").value("Taladro"));
    }

    @Test
    void testGetMyArticles_Integration_ReturnsPersistedOwnerCommissionPromoCode() throws Exception {
        savedArticle.setOwnerCommissionPromoCode("OWNER10");
        articleRepository.saveAndFlush(savedArticle);
        entityManager.clear();

        Article persisted = articleRepository.findById(savedArticle.getId()).orElseThrow();
        assertThat(persisted.getOwnerCommissionPromoCode()).isEqualTo("OWNER10");

        mockMvc.perform(get("/api/article/" + savedArticle.getId()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.ownerCommissionPromoCode").value("OWNER10"));

        mockMvc.perform(get("/api/article/my-articles/" + savedOwner.getId()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].id").value(savedArticle.getId()))
            .andExpect(jsonPath("$[0].ownerCommissionPromoCode").value("OWNER10"));
    }

    // Test Filtros My Articles 
@Test
    void testGetMyArticles_Integration_WithFilters_Success() throws Exception {
        
        Article article1 = new Article();
        article1.setTitle("Taladro Nuevo");
        article1.setDescription("Taladro en perfectas condiciones");
        article1.setCity("Madrid"); 
        article1.setOwner(savedOwner);
        article1.setCategory(savedCategory);
        article1.setCondition(ArticleCondition.NEW); 
        article1.setPricePerMonth(20.0);
        articleRepository.save(article1); 

        Article article2 = new Article();
        article2.setTitle("Taladro Usado");
        article2.setDescription("Taladro con algunas marcas de uso"); 
        article2.setCity("Barcelona"); 
        article2.setOwner(savedOwner);
        article2.setCategory(savedCategory);
        article2.setCondition(ArticleCondition.USED); 
        article2.setPricePerMonth(10.0);
        articleRepository.save(article2); 

        Article article3 = new Article();
        article3.setTitle("Bicicleta Cara");
        article3.setDescription("Bicicleta de montaña profesional");
        article3.setCity("Valencia"); 
        article3.setOwner(savedOwner);
        article3.setCategory(savedCategory);
        article3.setCondition(ArticleCondition.NEW);
        article3.setPricePerMonth(100.0);
        articleRepository.save(article3); 

   
        mockMvc.perform(get("/api/article/my-articles/" + savedOwner.getId())
                .param("categoryId", savedCategory.getId().toString())
                .param("condition", "NEW")
                .param("maxPrice", "50.0"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].title").value("Taladro Nuevo"));
    }

   @Test
    void testGetMyArticles_Integration_FilterByPriceRange_Success() throws Exception {

        Article cheap = new Article();
        cheap.setTitle("Barato");
        cheap.setDescription("Descripción del artículo barato"); 
        cheap.setCity("Sevilla");                               
        cheap.setCondition(ArticleCondition.USED);              
        cheap.setCategory(savedCategory);                        
        cheap.setOwner(savedOwner);
        cheap.setPricePerMonth(5.0);
        articleRepository.save(cheap);

  
        Article medium = new Article();
        medium.setTitle("Medio");
        medium.setDescription("Descripción del artículo medio");  
        medium.setCity("Madrid");                                 
        medium.setCondition(ArticleCondition.NEW);                
        medium.setCategory(savedCategory);                        
        medium.setOwner(savedOwner);
        medium.setPricePerMonth(15.0);
        articleRepository.save(medium);

  
        mockMvc.perform(get("/api/article/my-articles/" + savedOwner.getId())
                .param("minPrice", "10.0")
                .param("maxPrice", "20.0"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].title").value("Medio"));} 

    @Test
    void testGetArticleRecord_Integration_Success() throws Exception {
        // Simulamos que el usuario autenticado es el dueño del artículo
        when(authService.getAuthenticatedUserId()).thenReturn(savedOwner.getId());

        // El servicio findArticleRecord ya fue testeado en los unitarios, 
        // aquí comprobamos que el flujo completo del endpoint funcione.
        mockMvc.perform(get("/api/article/record/" + savedArticle.getId()))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray());
                
    }

    @Test
    void testGetArticleRecord_Integration_Failure_Forbidden() throws Exception {
        when(authService.getAuthenticatedUserId()).thenReturn(999L);

        mockMvc.perform(get("/api/article/record/" + savedArticle.getId()))
                .andExpect(status().isForbidden());
    }
}
