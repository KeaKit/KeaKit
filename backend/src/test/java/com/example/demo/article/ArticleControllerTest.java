package com.example.demo.article;

import com.example.demo.controller.ArticleController;
import com.example.demo.dto.UserArticle;
import com.example.demo.model.*;
import com.example.demo.security.JwtUtil;
import com.example.demo.service.*;
import com.example.demo.repository.*;
import com.example.demo.security.CustomUserDetailsService;
import com.example.demo.security.TokenBlacklistService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.doThrow;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = ArticleController.class, excludeAutoConfiguration = {
        SecurityAutoConfiguration.class,
        SecurityFilterAutoConfiguration.class
})
class ArticleControllerTest {

@Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ArticleService articleService;

    // --- MOCKS FALTANTES O NECESARIOS PARA EL CONTEXTO ---
    @MockitoBean
    private ArticleAvailabilityRequestService availabilityRequestService; 

    @MockitoBean
    private NotificationService notificationService;
    // ----------------------------------------------------

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @MockitoBean
    private TokenBlacklistService tokenBlacklistService;

    @MockitoBean
    private CategoryRepository categoryRepository;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private JwtUtil jwtUtil;

    private Article sample;
    private User owner;

    @BeforeEach
    void setUp() {
        owner = new User();
        owner.setId(1L);
        owner.setName("Test Owner");
        
        // Mock básico para evitar NullPointer si el controlador busca categorías
        when(categoryRepository.findById(any())).thenReturn(Optional.of(new Category()));

        sample = new Article();
        sample.setId(1L);
        sample.setTitle("t");
        sample.setDescription("d");
        sample.setCity("c");
        sample.setPricePerMonth(10.0);
        sample.setStatus(ArticleStatus.AVAILABLE);
        sample.setAvailableFrom(LocalDate.now().plusDays(1)); 
        sample.setAvailableUntil(LocalDate.now().plusDays(10));
    }


    @Test
    void uploadArticle_success() throws Exception {
        when(userRepository.findById(1L)).thenReturn(Optional.of(owner));
        when(articleService.save(any(Article.class))).thenReturn(sample);

        mockMvc.perform(post("/api/article/upload")
                .param("ownerId", "1")
                .param("categoryId", "1")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"t\",\"description\":\"d\",\"city\":\"c\",\"pricePerMonth\":10.0}"))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.title").value("t"));
    }

    @Test
    void uploadArticle_withOwnerCommissionPromoCode_sendsFieldToServiceAndResponseIncludesIt() throws Exception {
        Article saved = new Article();
        saved.setId(10L);
        saved.setTitle("Taladro");
        saved.setDescription("d");
        saved.setCity("c");
        saved.setPricePerMonth(10.0);
        saved.setStatus(ArticleStatus.AVAILABLE);
        saved.setOwnerCommissionPromoCode("OWNER10");

        when(userRepository.findById(1L)).thenReturn(Optional.of(owner));
        when(articleService.save(any(Article.class))).thenReturn(saved);

        mockMvc.perform(post("/api/article/upload")
                .param("ownerId", "1")
                .param("categoryId", "1")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"Taladro\",\"description\":\"d\",\"city\":\"c\",\"pricePerMonth\":10.0,\"ownerCommissionPromoCode\":\"OWNER10\"}"))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.ownerCommissionPromoCode").value("OWNER10"));

        ArgumentCaptor<Article> captor = ArgumentCaptor.forClass(Article.class);
        verify(articleService).save(captor.capture());
        assertThat(captor.getValue().getOwnerCommissionPromoCode()).isEqualTo("OWNER10");
    }

    @Test
    void uploadArticle_ownerNotFound_returnsBadRequest() throws Exception {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        mockMvc.perform(post("/api/article/upload")
                .param("ownerId", "99")
                .param("categoryId", "1")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"t\",\"description\":\"d\",\"city\":\"c\",\"pricePerMonth\":10.0}"))
            .andExpect(status().isBadRequest())
            .andExpect(content().string("Propietario no encontrado"));
    }

    @Test
    void uploadArticle_serviceThrows_returnsBadRequest() throws Exception {
        when(userRepository.findById(1L)).thenReturn(Optional.of(owner));
        when(articleService.save(any(Article.class))).thenThrow(new RuntimeException("Title is required"));

        mockMvc.perform(post("/api/article/upload")
                .param("ownerId", "1")
                .param("categoryId", "1")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"description\":\"d\",\"city\":\"c\",\"pricePerMonth\":10.0}"))
            .andExpect(status().isBadRequest())
            .andExpect(content().string("Title is required"));
    }

    @Test
    void uploadArticle_descriptionTooLong_returnsBadRequest() throws Exception {
        when(userRepository.findById(1L)).thenReturn(Optional.of(owner));
        when(articleService.save(any(Article.class)))
            .thenThrow(new RuntimeException("Description cannot exceed 1000 characters"));

        String longDesc = "a".repeat(1001);
        mockMvc.perform(post("/api/article/upload")
                .param("ownerId", "1")
                .param("categoryId", "1")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"t\",\"description\":\"" + longDesc + "\",\"city\":\"c\",\"pricePerMonth\":10.0}"))
            .andExpect(status().isBadRequest())
            .andExpect(content().string("Description cannot exceed 1000 characters"));
    }

    @Test
    void uploadArticle_priceOutOfCategoryRange_returnsBadRequest() throws Exception {
        when(userRepository.findById(1L)).thenReturn(Optional.of(owner));
        when(articleService.save(any(Article.class)))
            .thenThrow(new RuntimeException("pricePerMonth must be between 5.0 and 500.0 for this category"));

        mockMvc.perform(post("/api/article/upload")
                .param("ownerId", "1")
                .param("categoryId", "1")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"t\",\"description\":\"d\",\"city\":\"c\",\"pricePerMonth\":9999.0}"))
            .andExpect(status().isBadRequest())
            .andExpect(content().string("pricePerMonth must be between 5.0 and 500.0 for this category"));
    }


    @Test
    void getAllArticles_success() throws Exception {
        Article art = new Article();
        art.setId(2L);
        art.setTitle("second");
        art.setStatus(ArticleStatus.RENTED);

        when(articleService.findAll()).thenReturn(List.of(sample, art));
        mockMvc.perform(get("/api/article/all"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(2))
            .andExpect(jsonPath("$[0].title").value("t"))
            .andExpect(jsonPath("$[1].title").value("second"));
    }

    @Test
    void getAllArticles_emptyList_returnsOk() throws Exception {
        when(articleService.findAll()).thenReturn(List.of());

        mockMvc.perform(get("/api/article/all"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void getAllArticles_serviceThrows_returnsInternalServerError() throws Exception {
        when(articleService.findAll()).thenThrow(new RuntimeException("DB error"));

        mockMvc.perform(get("/api/article/all"))
            .andExpect(status().isInternalServerError())
            .andExpect(content().string("DB error"));
    }

    @Test
    void getArticleById_withOwnerCommissionPromoCode_returnsField() throws Exception {
        Article articleWithOwnerPromo = new Article();
        articleWithOwnerPromo.setId(1L);
        articleWithOwnerPromo.setTitle("Taladro");
        articleWithOwnerPromo.setDescription("d");
        articleWithOwnerPromo.setCity("c");
        articleWithOwnerPromo.setPricePerMonth(10.0);
        articleWithOwnerPromo.setStatus(ArticleStatus.AVAILABLE);
        articleWithOwnerPromo.setOwnerCommissionPromoCode("OWNER10");

        when(articleService.findById(1L)).thenReturn(articleWithOwnerPromo);

        mockMvc.perform(get("/api/article/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.ownerCommissionPromoCode").value("OWNER10"));
    }


    @Test
    void updateArticle_success() throws Exception {
        Article returned = new Article();
        returned.setId(1L);
        returned.setTitle("newtitle");

        when(articleService.update(eq(1L), eq(100L), any(Article.class)))
            .thenReturn(returned);

        mockMvc.perform(put("/api/article/1")
                .param("ownerId", "100")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"newtitle\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.title").value("newtitle"));
    }

    @Test
    void updateArticle_failureReturnsBadRequest() throws Exception {
        when(articleService.update(eq(1L), eq(100L), any(Article.class)))
            .thenThrow(new RuntimeException("bad"));

        mockMvc.perform(put("/api/article/1")
                .param("ownerId", "100")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"x\"}"))
            .andExpect(status().isBadRequest())
            .andExpect(content().string("bad"));
    }

    @Test
    void updateArticle_descriptionTooLong_returnsBadRequest() throws Exception {
        when(articleService.update(eq(1L), eq(100L), any(Article.class)))
            .thenThrow(new RuntimeException("Description cannot exceed 1000 characters"));

        String longDesc = "a".repeat(1001);
        mockMvc.perform(put("/api/article/1")
                .param("ownerId", "100")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"description\":\"" + longDesc + "\"}"))
            .andExpect(status().isBadRequest())
            .andExpect(content().string("Description cannot exceed 1000 characters"));
    }

    @Test
    void updateArticle_cannotChangeStatus_returnsBadRequest() throws Exception {
        when(articleService.update(eq(1L), eq(100L), any(Article.class)))
            .thenThrow(new RuntimeException("Cannot change status via update; use toggleRent endpoint"));

        mockMvc.perform(put("/api/article/1")
                .param("ownerId", "100")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"status\":\"RENTED\"}"))
            .andExpect(status().isBadRequest())
            .andExpect(content().string("Cannot change status via update; use toggleRent endpoint"));
    }


    @Test
    void deleteArticle_success() throws Exception {
        mockMvc.perform(delete("/api/article/2")
                .param("ownerId", "200"))
            .andExpect(status().isNoContent());
    }

    @Test
    void deleteArticle_failureReturnsBadRequest() throws Exception {
        doThrow(new RuntimeException("oops"))
            .when(articleService).deleteById(3L, 300L);

        mockMvc.perform(delete("/api/article/3")
                .param("ownerId", "300"))
            .andExpect(status().isBadRequest())
            .andExpect(content().string("oops"));
    }


    @Test
    void toggleRent_success() throws Exception {
        Article toggled = new Article();
        toggled.setId(5L);
        toggled.setStatus(ArticleStatus.RENTED);
        when(articleService.toggleRent(5L, 500L)).thenReturn(toggled);

        mockMvc.perform(post("/api/article/5/toggle-rent")
                .param("ownerId", "500"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("RENTED"));
    }

    @Test
    void toggleRent_failure() throws Exception {
        when(articleService.toggleRent(6L, 600L)).thenThrow(new RuntimeException("nope"));

        mockMvc.perform(post("/api/article/6/toggle-rent")
                .param("ownerId", "600"))
            .andExpect(status().isBadRequest())
            .andExpect(content().string("nope"));
    }

    @Test
    void toggleRent_inactiveArticle_returnsBadRequest() throws Exception {
        when(articleService.toggleRent(7L, 700L))
            .thenThrow(new RuntimeException("Inactive articles cannot be rented"));

        mockMvc.perform(post("/api/article/7/toggle-rent")
                .param("ownerId", "700"))
            .andExpect(status().isBadRequest())
            .andExpect(content().string("Inactive articles cannot be rented"));
    }


    @Test
    void getMyArticles_success() throws Exception {
        UserArticle dto1 = new UserArticle(10L, "Taladro", "url1", 15.0, "AVAILABLE", null, null);
        UserArticle dto2 = new UserArticle(11L, "Bicicleta", "url2", 30.0, "RENTED", LocalDate.of(2026, 12, 31), null);

        when(articleService.findArticlesByUserId(eq(1L), any(), any(), any(), any())).thenReturn(List.of(dto1, dto2));

        mockMvc.perform(get("/api/article/my-articles/1"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.length()").value(2))
            .andExpect(jsonPath("$[0].title").value("Taladro"))
            .andExpect(jsonPath("$[0].status").value("AVAILABLE"))
            .andExpect(jsonPath("$[0].rentedUntil").doesNotExist())
            .andExpect(jsonPath("$[1].title").value("Bicicleta"))
            .andExpect(jsonPath("$[1].status").value("RENTED"))
            .andExpect(jsonPath("$[1].rentedUntil").value("2026-12-31"));
    }

    @Test
    void getMyArticles_withOwnerCommissionPromoCode_returnsField() throws Exception {
        UserArticle dto = new UserArticle(10L, "Taladro", "url1", 15.0, "AVAILABLE", null, "OWNER10");

        when(articleService.findArticlesByUserId(eq(1L), any(), any(), any(), any())).thenReturn(List.of(dto));

        mockMvc.perform(get("/api/article/my-articles/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].title").value("Taladro"))
            .andExpect(jsonPath("$[0].ownerCommissionPromoCode").value("OWNER10"));
    }

    @Test
    void getMyArticles_emptyList_returnsOk() throws Exception {
        when(articleService.findArticlesByUserId(eq(2L), any(), any(), any(), any())).thenReturn(List.of());

        mockMvc.perform(get("/api/article/my-articles/2"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void getMyArticles_serviceThrows_returnsInternalServerError() throws Exception {
        when(articleService.findArticlesByUserId(eq(3L), any(), any(), any(), any())).thenThrow(new RuntimeException("Error fetching articles"));

        mockMvc.perform(get("/api/article/my-articles/3"))
            .andExpect(status().isInternalServerError())
            .andExpect(jsonPath("$.message").value("Error fetching articles"))
            .andExpect(jsonPath("$.status").value(500));
    }

    @Test
    void getArticleCountByCategory_success() throws Exception {
        when(articleService.countArticlesByCategory(1L)).thenReturn(5L);

        mockMvc.perform(get("/api/article/category/1/count"))
            .andExpect(status().isOk())
            .andExpect(content().string("5"));
    }

    @Test
    void getArticleCountByCategory_serviceThrows_returnsZero() throws Exception {
        when(articleService.countArticlesByCategory(2L)).thenThrow(new RuntimeException("DB Error"));

        mockMvc.perform(get("/api/article/category/2/count"))
            .andExpect(status().isInternalServerError())
            .andExpect(content().string("0"));
    }


    @Test
    void getLatestArticlesByCategory_success() throws Exception {
        UserArticle dto = new UserArticle(10L, "Taladro de prueba", "url_img", 15.0, "AVAILABLE", null, null);

        when(articleService.findLatestArticlesByCategory(1L)).thenReturn(List.of(dto));

        mockMvc.perform(get("/api/article/category/1/latest"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].title").value("Taladro de prueba"))
            .andExpect(jsonPath("$[0].status").value("AVAILABLE"));
    }


    // Test filtros MyArticles
    @Test
    void getMyArticles_withAllFilters_success() throws Exception {
        UserArticle dtoFiltered = new UserArticle(12L, "Taladro Nuevo", "url3", 25.0, "AVAILABLE", null, null);

      
        when(articleService.findArticlesByUserId(eq(1L), eq(5L), eq("NEW"), eq(10.0), eq(50.0)))
            .thenReturn(List.of(dtoFiltered));

        mockMvc.perform(get("/api/article/my-articles/1")
                .param("categoryId", "5")
                .param("condition", "NEW")
                .param("minPrice", "10.0")
                .param("maxPrice", "50.0"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].title").value("Taladro Nuevo"))
            .andExpect(jsonPath("$[0].status").value("AVAILABLE"));
    }

    @Test
    void getMyArticles_withPartialFilters_success() throws Exception {
        UserArticle dtoFiltered = new UserArticle(13L, "Bicicleta Barata", "url4", 15.0, "AVAILABLE", null, null);

       
        when(articleService.findArticlesByUserId(eq(1L), isNull(), eq("USED"), isNull(), eq(20.0)))
            .thenReturn(List.of(dtoFiltered));

        mockMvc.perform(get("/api/article/my-articles/1")
                .param("condition", "USED")
                .param("maxPrice", "20.0"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].title").value("Bicicleta Barata"));}

    @Test
    void getArticleRecord_success() throws Exception {
        sample.setOwner(owner);

        when(authService.getAuthenticatedUserId()).thenReturn(1L);
        when(articleService.findById(1L)).thenReturn(sample);
        when(articleService.findArticleRecord(1L)).thenReturn(List.of());

        mockMvc.perform(get("/api/article/record/1"))
            .andExpect(status().isOk());
    }

    @Test
    void getArticleRecord_notFound() throws Exception {
        when(authService.getAuthenticatedUserId()).thenReturn(1L);
        when(articleService.findById(1L)).thenReturn(null);

        mockMvc.perform(get("/api/article/record/1"))
            .andExpect(status().isNotFound());
    }

    @Test
    void getArticleRecord_forbidden() throws Exception {
        User other = new User();
        other.setId(2L);
        sample.setOwner(other);

        when(authService.getAuthenticatedUserId()).thenReturn(1L);
        when(articleService.findById(1L)).thenReturn(sample);

        mockMvc.perform(get("/api/article/record/1"))
            .andExpect(status().isForbidden());
    }

    @Test
    void getArticleRecord_internalError() throws Exception {
        when(authService.getAuthenticatedUserId()).thenThrow(new RuntimeException());

        mockMvc.perform(get("/api/article/record/1"))
            .andExpect(status().isInternalServerError());

    }
}
