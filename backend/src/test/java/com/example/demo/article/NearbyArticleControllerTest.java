package com.example.demo.article;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.example.demo.controller.ArticleController;
import com.example.demo.dto.ArticleNearbyDTO;
import com.example.demo.repository.CategoryRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.CustomUserDetailsService;
import com.example.demo.security.JwtUtil;
import com.example.demo.security.TokenBlacklistService;
import com.example.demo.service.ArticleAvailabilityRequestService;
import com.example.demo.service.ArticleService;
import com.example.demo.service.AuthService;
import com.example.demo.service.NotificationService;

/**
 * Tests unitarios de controlador para CU-ARRENDATARIO-10: Ampliación de búsqueda geográfica
 *
 * Reglas de negocio cubiertas:
 * - RN-KIT-24: Seleccionar ciudad destino para ver objetos disponibles
 * - RN-KIT-25: Filtrar productos por ciudad con territorio ampliado
 */
@WebMvcTest(
    controllers = ArticleController.class,
    excludeAutoConfiguration = {
        SecurityAutoConfiguration.class,
        SecurityFilterAutoConfiguration.class
    }
)
class NearbyArticleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean private ArticleService articleService;
    @MockitoBean private ArticleAvailabilityRequestService availabilityRequestService;
    @MockitoBean private NotificationService notificationService;
    @MockitoBean private UserRepository userRepository;
    @MockitoBean private CustomUserDetailsService customUserDetailsService;
    @MockitoBean private TokenBlacklistService tokenBlacklistService;
    @MockitoBean private CategoryRepository categoryRepository;
    @MockitoBean private AuthService authService;
    @MockitoBean private JwtUtil jwtUtil;

    private static final LocalDate FROM = LocalDate.now().plusDays(1);
    private static final LocalDate UNTIL = LocalDate.now().plusDays(30);

    private ArticleNearbyDTO sampleDTO(Long id, String city, double distance) {
        return new ArticleNearbyDTO(
            id, "ARTICLE", "Taladro " + id, "Descripción", city,
            30.0, FROM, UNTIL, "Bricolaje", 1, 1L, "Owner",
            "AVAILABLE", null, 37.88, -4.77, distance
        );
    }

    // =====================================================
    // GET /api/article/nearby
    // =====================================================

    @Test
    void getNearbyArticles_success_returnsListOfArticles() throws Exception {
        List<ArticleNearbyDTO> articles = List.of(
            sampleDTO(1L, "Córdoba", 130.5),
            sampleDTO(2L, "Huelva", 90.2)
        );
        when(articleService.findNearbyArticles("Sevilla", "España", 150.0))
            .thenReturn(articles);

        mockMvc.perform(get("/api/article/nearby")
                .param("city", "Sevilla")
                .param("country", "España")
                .param("radiusKm", "150"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(2))
            .andExpect(jsonPath("$[0].city").value("Córdoba"))
            .andExpect(jsonPath("$[0].distanceKm").value(130.5))
            .andExpect(jsonPath("$[1].city").value("Huelva"))
            .andExpect(jsonPath("$[1].distanceKm").value(90.2));
    }

    @Test
    void getNearbyArticles_defaultRadius_is150() throws Exception {
        when(articleService.findNearbyArticles("Sevilla", "España", 150.0))
            .thenReturn(List.of(sampleDTO(1L, "Córdoba", 130.0)));

        mockMvc.perform(get("/api/article/nearby")
                .param("city", "Sevilla")
                .param("country", "España"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void getNearbyArticles_customRadius_accepted() throws Exception {
        when(articleService.findNearbyArticles("Sevilla", "España", 500.0))
            .thenReturn(List.of(
                sampleDTO(1L, "Córdoba", 130.0),
                sampleDTO(2L, "Madrid", 390.0)
            ));

        mockMvc.perform(get("/api/article/nearby")
                .param("city", "Sevilla")
                .param("country", "España")
                .param("radiusKm", "500"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void getNearbyArticles_noResults_returnsEmptyList() throws Exception {
        when(articleService.findNearbyArticles("Sevilla", "España", 150.0))
            .thenReturn(List.of());

        mockMvc.perform(get("/api/article/nearby")
                .param("city", "Sevilla")
                .param("country", "España"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void getNearbyArticles_missingCityParam_returnsError() throws Exception {
        mockMvc.perform(get("/api/article/nearby")
                .param("country", "España"))
            .andExpect(status().is5xxServerError());
    }

    @Test
    void getNearbyArticles_missingCountryParam_returnsError() throws Exception {
        mockMvc.perform(get("/api/article/nearby")
                .param("city", "Sevilla"))
            .andExpect(status().is5xxServerError());
    }

    @Test
    void getNearbyArticles_serviceThrowsException_returns500() throws Exception {
        when(articleService.findNearbyArticles(anyString(), anyString(), anyDouble()))
            .thenThrow(new RuntimeException("Error interno"));

        mockMvc.perform(get("/api/article/nearby")
                .param("city", "Sevilla")
                .param("country", "España"))
            .andExpect(status().isInternalServerError());
    }

    @Test
    void getNearbyArticles_responseDTOFieldsAreCorrect() throws Exception {
        ArticleNearbyDTO dto = new ArticleNearbyDTO(
            1L, "ARTICLE", "Taladro Pro", "Taladro con percutor", "Córdoba",
            49.99, FROM, UNTIL, "Bricolaje", 3, 5L, "Juan García",
            "AVAILABLE", "http://img.test/foto.jpg", 37.88, -4.77, 132.4
        );
        when(articleService.findNearbyArticles("Sevilla", "España", 150.0))
            .thenReturn(List.of(dto));

        mockMvc.perform(get("/api/article/nearby")
                .param("city", "Sevilla")
                .param("country", "España"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].id").value(1))
            .andExpect(jsonPath("$[0].itemType").value("ARTICLE"))
            .andExpect(jsonPath("$[0].title").value("Taladro Pro"))
            .andExpect(jsonPath("$[0].description").value("Taladro con percutor"))
            .andExpect(jsonPath("$[0].city").value("Córdoba"))
            .andExpect(jsonPath("$[0].pricePerMonth").value(49.99))
            .andExpect(jsonPath("$[0].category").value("Bricolaje"))
            .andExpect(jsonPath("$[0].totalUnits").value(3))
            .andExpect(jsonPath("$[0].ownerId").value(5))
            .andExpect(jsonPath("$[0].ownerName").value("Juan García"))
            .andExpect(jsonPath("$[0].status").value("AVAILABLE"))
            .andExpect(jsonPath("$[0].imageUrl").value("http://img.test/foto.jpg"))
            .andExpect(jsonPath("$[0].cityLat").value(37.88))
            .andExpect(jsonPath("$[0].cityLng").value(-4.77))
            .andExpect(jsonPath("$[0].distanceKm").value(132.4));
    }

    // =====================================================
    // GET /api/article/map
    // =====================================================

    @Test
    void getArticlesForMap_success_returnsList() throws Exception {
        when(articleService.findAllWithCoords("España"))
            .thenReturn(List.of(sampleDTO(1L, "Madrid", 0.0)));

        mockMvc.perform(get("/api/article/map")
                .param("country", "España"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].city").value("Madrid"));
    }

    @Test
    void getArticlesForMap_whenIncludeRentedTrue_usesExpandedMapQuery() throws Exception {
        when(articleService.findAllWithCoords("España", true))
            .thenReturn(List.of(sampleDTO(1L, "Madrid", 0.0)));

        mockMvc.perform(get("/api/article/map")
                .param("country", "España")
                .param("includeRented", "true"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(1));

        verify(articleService).findAllWithCoords("España", true);
        verify(articleService, never()).findAllWithCoords("España");
    }

    @Test
    void getArticlesForMap_withoutCountry_returnsAll() throws Exception {
        when(articleService.findAllWithCoords(null))
            .thenReturn(List.of(
                sampleDTO(1L, "Madrid", 0.0),
                sampleDTO(2L, "Paris", 0.0)
            ));

        mockMvc.perform(get("/api/article/map"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void getArticlesForMap_noResults_returnsEmptyList() throws Exception {
        when(articleService.findAllWithCoords("España")).thenReturn(List.of());

        mockMvc.perform(get("/api/article/map")
                .param("country", "España"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void getArticlesForMap_serviceThrowsException_returns500() throws Exception {
        when(articleService.findAllWithCoords(anyString()))
            .thenThrow(new RuntimeException("Error interno"));

        mockMvc.perform(get("/api/article/map")
                .param("country", "España"))
            .andExpect(status().isInternalServerError());
    }

    // =====================================================
    // Edge cases
    // =====================================================

    @Test
    void getNearbyArticles_withSpecialCharactersInCity_handledCorrectly() throws Exception {
        when(articleService.findNearbyArticles("São Paulo", "España", 150.0))
            .thenReturn(List.of());

        mockMvc.perform(get("/api/article/nearby")
                .param("city", "São Paulo")
                .param("country", "España"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void getNearbyArticles_withZeroRadius_accepted() throws Exception {
        when(articleService.findNearbyArticles("Sevilla", "España", 0.0))
            .thenReturn(List.of());

        mockMvc.perform(get("/api/article/nearby")
                .param("city", "Sevilla")
                .param("country", "España")
                .param("radiusKm", "0"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void getNearbyArticles_withLargeRadius_accepted() throws Exception {
        when(articleService.findNearbyArticles("Sevilla", "España", 10000.0))
            .thenReturn(List.of(sampleDTO(1L, "Madrid", 390.0)));

        mockMvc.perform(get("/api/article/nearby")
                .param("city", "Sevilla")
                .param("country", "España")
                .param("radiusKm", "10000"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void getArticlesForMap_withSpecialCharactersInCountry_handledCorrectly() throws Exception {
        when(articleService.findAllWithCoords("São Paulo"))
            .thenReturn(List.of());

        mockMvc.perform(get("/api/article/map")
                .param("country", "São Paulo"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void getArticlesForMap_responseDTOFieldsCorrect() throws Exception {
        ArticleNearbyDTO dto = new ArticleNearbyDTO(
            1L, "ARTICLE", "Taladro", "Descripción", "Madrid",
            25.0, FROM, UNTIL, "Bricolaje", 2, 3L, "Owner",
            "AVAILABLE", "http://img.test/foto.jpg", 40.41, -3.70, 0.0
        );
        when(articleService.findAllWithCoords("España"))
            .thenReturn(List.of(dto));

        mockMvc.perform(get("/api/article/map")
                .param("country", "España"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].id").value(1))
            .andExpect(jsonPath("$[0].itemType").value("ARTICLE"))
            .andExpect(jsonPath("$[0].title").value("Taladro"))
            .andExpect(jsonPath("$[0].city").value("Madrid"))
            .andExpect(jsonPath("$[0].pricePerMonth").value(25.0))
            .andExpect(jsonPath("$[0].cityLat").value(40.41))
            .andExpect(jsonPath("$[0].cityLng").value(-3.70))
            .andExpect(jsonPath("$[0].distanceKm").value(0.0));
    }

    @Test
    void getNearbyArticles_returnsNullBodyOnServiceError() throws Exception {
        when(articleService.findNearbyArticles(anyString(), anyString(), anyDouble()))
            .thenThrow(new RuntimeException("Fallo"));

        mockMvc.perform(get("/api/article/nearby")
                .param("city", "Sevilla")
                .param("country", "España"))
            .andExpect(status().isInternalServerError())
            .andExpect(jsonPath("$").doesNotExist());
    }
}
