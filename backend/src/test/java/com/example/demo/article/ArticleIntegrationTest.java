package com.example.demo.article;

import com.example.demo.model.*;
import com.example.demo.repository.ArticleRepository;
import com.example.demo.repository.CategoryRepository;
import com.example.demo.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@Transactional
@ActiveProfiles("test")
class ArticleIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ArticleRepository articleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private ObjectMapper objectMapper;

    private User savedOwner;
    private Article savedArticle;
    private Category savedCategory; 


    @BeforeEach
    void setUp() {
        articleRepository.deleteAll();
        User owner = new User();
        owner.setName("Juan");
        owner.setEmail("juan@example.com");
        owner.setPassword("123");
        owner.setRole(UserRole.USER);
        owner.setCountry("España");
        owner.setCity("Sevilla");
        owner.setAddress("Calle 123 matame otra vez");
        owner.setPhone("123456789");
        savedOwner = userRepository.save(owner);

        Category category = new Category("Bricolaje", "Cosas de taller", 5.0, 500.0);
        category.setStatus(CategoryStatus.ACTIVE);
        savedCategory = categoryRepository.save(category);

        Article article = new Article();
        article.setTitle("Taladro");
        article.setDescription("Un taladro potente");
        article.setCity("Madrid");
        article.setPricePerMonth(50.0);
        article.setStatus(ArticleStatus.AVAILABLE);
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
        newArticle.setCategory(savedCategory);

        mockMvc.perform(post("/api/article/upload")
                .param("ownerId", savedOwner.getId().toString())
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
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newArticle)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Owner not found"));
    }

    @Test
    void testUploadArticle_Integration_Failure_MissingTitle() throws Exception {
        Article newArticle = new Article();
        newArticle.setDescription("Descripcion");
        newArticle.setCity("Valencia");
        newArticle.setPricePerMonth(20.0);

        mockMvc.perform(post("/api/article/upload")
                .param("ownerId", savedOwner.getId().toString())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newArticle)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Title is required"));
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
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newArticle)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("pricePerMonth must be >= 0"));
    }

    @Test
    void testUploadArticle_Integration_Failure_InvalidDateRange() throws Exception {
        Article newArticle = new Article();
        newArticle.setTitle("Fresadora");
        newArticle.setDescription("Fresadora CNC");
        newArticle.setCity("Bilbao");
        newArticle.setPricePerMonth(100.0);
        newArticle.setAvailableFrom(LocalDate.now().plusDays(10));
        newArticle.setAvailableUntil(LocalDate.now());

        mockMvc.perform(post("/api/article/upload")
                .param("ownerId", savedOwner.getId().toString())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newArticle)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("availableFrom must be before or equal to availableUntil"));
    }

    // ------------ GET /api/article/all ------------

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
        second.setCategory(savedCategory);
        second.setOwner(savedOwner);
        articleRepository.save(second);

        mockMvc.perform(get("/api/article/all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    // ------------ PUT /api/article/{id} ------------

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
    void testUpdateArticle_Integration_Failure_ArticleNotFound() throws Exception {
        Article updateData = new Article();
        updateData.setTitle("Nuevo titulo");

        mockMvc.perform(put("/api/article/999999")
                .param("ownerId", savedOwner.getId().toString())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateData)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Article not found"));
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
                .andExpect(content().string("Article is currently rented and cannot be edited"));
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
                .andExpect(content().string("Only the owner can modify this article"));
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
                .andExpect(content().string("Cannot change status via update; use toggleRent endpoint"));
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
                .andExpect(content().string("Only the owner can delete this article"));

        assertThat(articleRepository.existsById(savedArticle.getId())).isTrue();
    }

    @Test
    void testDeleteArticle_Failure_ArticleNotFound() throws Exception {
        mockMvc.perform(delete("/api/article/999999")
                .param("ownerId", savedOwner.getId().toString()))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Article not found"));
    }

    @Test
    void testDeleteArticle_Failure_Rented() throws Exception {
        savedArticle.setStatus(ArticleStatus.RENTED);
        articleRepository.save(savedArticle);

        mockMvc.perform(delete("/api/article/" + savedArticle.getId())
                .param("ownerId", savedOwner.getId().toString()))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Article is currently rented and cannot be deleted"));

        assertThat(articleRepository.existsById(savedArticle.getId())).isTrue();
    }

    // ------------ POST /api/article/{id}/toggle-rent ------------

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
                .andExpect(content().string("Inactive articles cannot be rented"));
    }

    @Test
    void testToggleRent_Integration_Failure_OwnerMismatch() throws Exception {
        mockMvc.perform(post("/api/article/" + savedArticle.getId() + "/toggle-rent")
                .param("ownerId", "999"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Only the owner can change rental status"));
    }

    @Test
    void testToggleRent_Integration_Failure_ArticleNotFound() throws Exception {
        mockMvc.perform(post("/api/article/999999/toggle-rent")
                .param("ownerId", savedOwner.getId().toString()))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Article not found"));
    }

    // ------------ GET "/api/article/category/{id}/count")------------

    @Test
    void testGetArticleCountByCategory_Integration() throws Exception {
        mockMvc.perform(get("/api/article/category/" + savedCategory.getId() + "/count"))
                .andExpect(status().isOk())
                .andExpect(content().string("1")); // Debe haber 1 artículo
    }

    // ------------ GET "/api/article/category/{id}/latest")------------

    @Test
    void testGetLatestArticlesByCategory_Integration() throws Exception {
        mockMvc.perform(get("/api/article/category/" + savedCategory.getId() + "/latest"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].title").value("Taladro"));
    }
}
