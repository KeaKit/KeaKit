package com.example.demo.article;

import com.example.demo.dto.CityCoordinatesDTO;
import com.example.demo.model.*;
import com.example.demo.repository.ArticleRepository;
import com.example.demo.repository.CategoryRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.AuthService;
import com.example.demo.service.CityService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Tests de integración para CU-ARRENDATARIO-10: Ampliación de búsqueda geográfica
 *
 * Verifican el flujo completo desde el controlador HTTP hasta la base de datos H2,
 * mockeando únicamente el servicio externo de geolocalización (Nominatim).
 *
 * Reglas de negocio cubiertas:
 * - RN-KIT-24: Seleccionar ciudad destino para ver objetos disponibles
 * - RN-KIT-25: Filtrar productos por ciudad y territorio ampliado
 * - RN-ENT-04: Tarifa fija de envío courier
 */
@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@Transactional
@ActiveProfiles("test")
class NearbyArticleIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ArticleRepository articleRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private CategoryRepository categoryRepository;

    @MockitoBean private AuthService authService;
    @MockitoBean private CityService cityService;

    private User savedOwner;
    private Category savedCategory;

    private static final LocalDate FROM = LocalDate.now().plusDays(1);
    private static final LocalDate UNTIL = LocalDate.now().plusDays(30);

    // Coordenadas de ciudades españolas
    private static final CityCoordinatesDTO SEVILLA =
        new CityCoordinatesDTO("Sevilla", "España", 37.3886, -5.9823);
    private static final CityCoordinatesDTO CORDOBA =
        new CityCoordinatesDTO("Córdoba", "España", 37.8882, -4.7794);
    private static final CityCoordinatesDTO MADRID =
        new CityCoordinatesDTO("Madrid", "España", 40.4168, -3.7038);
    private static final CityCoordinatesDTO BARCELONA =
        new CityCoordinatesDTO("Barcelona", "España", 41.3874, 2.1686);

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

        Category cat = new Category("Bricolaje", "Herramientas", 5.0, 500.0);
        cat.setStatus(CategoryStatus.ACTIVE);
        savedCategory = categoryRepository.save(cat);
    }

    private Article saveArticle(String title, String city, double price, ArticleStatus status) {
        Article a = new Article();
        a.setTitle(title);
        a.setDescription("Descripción de " + title);
        a.setCity(city);
        a.setCountry("España");
        a.setPricePerMonth(price);
        a.setStatus(status);
        a.setAvailableFrom(FROM);
        a.setAvailableUntil(UNTIL);
        a.setOwner(savedOwner);
        a.setCategory(savedCategory);
        return articleRepository.save(a);
    }

    // =====================================================
    // GET /api/article/nearby — flujo completo
    // =====================================================

    @Test
    void nearby_integration_returnsArticlesFromNearbyCities() throws Exception {
        saveArticle("Taladro Córdoba", "Córdoba", 30.0, ArticleStatus.AVAILABLE);
        saveArticle("Sierra Barcelona", "Barcelona", 45.0, ArticleStatus.AVAILABLE);

        when(cityService.getCityCoordinates("Sevilla", "España")).thenReturn(SEVILLA);
        when(cityService.getCityCoordinates("Córdoba", "España")).thenReturn(CORDOBA);
        when(cityService.getCityCoordinates("Barcelona", "España")).thenReturn(BARCELONA);

        // Córdoba ~130km de Sevilla (dentro), Barcelona ~830km (fuera)
        mockMvc.perform(get("/api/article/nearby")
                .param("city", "Sevilla")
                .param("country", "España")
                .param("radiusKm", "150"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].title").value("Taladro Córdoba"))
            .andExpect(jsonPath("$[0].city").value("Córdoba"))
            .andExpect(jsonPath("$[0].distanceKm").isNumber());
    }

    @Test
    void nearby_integration_expandedRadiusIncludesMoreCities() throws Exception {
        saveArticle("Taladro Córdoba", "Córdoba", 30.0, ArticleStatus.AVAILABLE);
        saveArticle("Sierra Madrid", "Madrid", 45.0, ArticleStatus.AVAILABLE);

        when(cityService.getCityCoordinates("Sevilla", "España")).thenReturn(SEVILLA);
        when(cityService.getCityCoordinates("Córdoba", "España")).thenReturn(CORDOBA);
        when(cityService.getCityCoordinates("Madrid", "España")).thenReturn(MADRID);

        // Con radio de 500km, Madrid (~390km) también entra
        mockMvc.perform(get("/api/article/nearby")
                .param("city", "Sevilla")
                .param("country", "España")
                .param("radiusKm", "500"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void nearby_integration_excludesNonAvailableArticles() throws Exception {
        saveArticle("Taladro disponible", "Córdoba", 30.0, ArticleStatus.AVAILABLE);
        saveArticle("Taladro alquilado", "Córdoba", 35.0, ArticleStatus.RENTED);
        saveArticle("Taladro inactivo", "Córdoba", 40.0, ArticleStatus.INACTIVE);

        when(cityService.getCityCoordinates("Sevilla", "España")).thenReturn(SEVILLA);
        when(cityService.getCityCoordinates("Córdoba", "España")).thenReturn(CORDOBA);

        mockMvc.perform(get("/api/article/nearby")
                .param("city", "Sevilla")
                .param("country", "España"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].title").value("Taladro disponible"));
    }

    @Test
    void nearby_integration_excludesArticlesInTargetCity() throws Exception {
        saveArticle("Taladro local", "Sevilla", 30.0, ArticleStatus.AVAILABLE);
        saveArticle("Taladro cercano", "Córdoba", 35.0, ArticleStatus.AVAILABLE);

        when(cityService.getCityCoordinates("Sevilla", "España")).thenReturn(SEVILLA);
        when(cityService.getCityCoordinates("Córdoba", "España")).thenReturn(CORDOBA);

        mockMvc.perform(get("/api/article/nearby")
                .param("city", "Sevilla")
                .param("country", "España"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].city").value("Córdoba"));
    }

    @Test
    void nearby_integration_unknownCity_returnsEmpty() throws Exception {
        saveArticle("Taladro", "Córdoba", 30.0, ArticleStatus.AVAILABLE);

        when(cityService.getCityCoordinates("CiudadFantasma", "España")).thenReturn(null);

        mockMvc.perform(get("/api/article/nearby")
                .param("city", "CiudadFantasma")
                .param("country", "España"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void nearby_integration_noArticlesNearby_returnsEmpty() throws Exception {
        saveArticle("Taladro lejano", "Barcelona", 30.0, ArticleStatus.AVAILABLE);

        when(cityService.getCityCoordinates("Sevilla", "España")).thenReturn(SEVILLA);
        when(cityService.getCityCoordinates("Barcelona", "España")).thenReturn(BARCELONA);

        mockMvc.perform(get("/api/article/nearby")
                .param("city", "Sevilla")
                .param("country", "España")
                .param("radiusKm", "50"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void nearby_integration_responseContainsDistanceInfo() throws Exception {
        saveArticle("Taladro", "Córdoba", 30.0, ArticleStatus.AVAILABLE);

        when(cityService.getCityCoordinates("Sevilla", "España")).thenReturn(SEVILLA);
        when(cityService.getCityCoordinates("Córdoba", "España")).thenReturn(CORDOBA);

        mockMvc.perform(get("/api/article/nearby")
                .param("city", "Sevilla")
                .param("country", "España"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].distanceKm").isNumber())
            .andExpect(jsonPath("$[0].cityLat").isNumber())
            .andExpect(jsonPath("$[0].cityLng").isNumber());
    }

    // =====================================================
    // GET /api/article/map — flujo completo
    // =====================================================

    @Test
    void map_integration_returnsAllAvailableArticlesWithCoords() throws Exception {
        saveArticle("Taladro Madrid", "Madrid", 30.0, ArticleStatus.AVAILABLE);
        saveArticle("Sierra Barcelona", "Barcelona", 45.0, ArticleStatus.AVAILABLE);
        saveArticle("Martillo inactivo", "Madrid", 15.0, ArticleStatus.INACTIVE);

        when(cityService.getCityCoordinates("Madrid", "España")).thenReturn(MADRID);
        when(cityService.getCityCoordinates("Barcelona", "España")).thenReturn(BARCELONA);

        mockMvc.perform(get("/api/article/map")
                .param("country", "España"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(2))
            .andExpect(jsonPath("$[0].cityLat").isNumber())
            .andExpect(jsonPath("$[0].cityLng").isNumber());
    }

    @Test
    void map_integration_withoutCountryParam_returnsAll() throws Exception {
        Article a = saveArticle("Taladro", "Madrid", 30.0, ArticleStatus.AVAILABLE);

        when(cityService.getCityCoordinates("Madrid", "España")).thenReturn(MADRID);

        mockMvc.perform(get("/api/article/map"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void map_integration_noArticles_returnsEmpty() throws Exception {
        mockMvc.perform(get("/api/article/map")
                .param("country", "España"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(0));
    }

    // =====================================================
    // Edge cases integración
    // =====================================================

    @Test
    void nearby_integration_caseInsensitiveCityExclusion() throws Exception {
        saveArticle("Taladro local", "Sevilla", 30.0, ArticleStatus.AVAILABLE);
        saveArticle("Taladro cercano", "Córdoba", 35.0, ArticleStatus.AVAILABLE);

        when(cityService.getCityCoordinates("sevilla", "España")).thenReturn(
            new CityCoordinatesDTO("sevilla", "España", 37.3886, -5.9823));
        when(cityService.getCityCoordinates("Córdoba", "España")).thenReturn(CORDOBA);

        // Buscar con "sevilla" (minúscula) debe excluir "Sevilla" de la BD
        mockMvc.perform(get("/api/article/nearby")
                .param("city", "sevilla")
                .param("country", "España"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[?(@.city == 'Sevilla')]").doesNotExist());
    }

    @Test
    void nearby_integration_multipleArticlesSameCityReturnAll() throws Exception {
        saveArticle("Taladro 1", "Córdoba", 30.0, ArticleStatus.AVAILABLE);
        saveArticle("Taladro 2", "Córdoba", 35.0, ArticleStatus.AVAILABLE);
        saveArticle("Taladro 3", "Córdoba", 40.0, ArticleStatus.AVAILABLE);

        when(cityService.getCityCoordinates("Sevilla", "España")).thenReturn(SEVILLA);
        when(cityService.getCityCoordinates("Córdoba", "España")).thenReturn(CORDOBA);

        mockMvc.perform(get("/api/article/nearby")
                .param("city", "Sevilla")
                .param("country", "España"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(3));
    }

    @Test
    void nearby_integration_zeroRadius_returnsEmpty() throws Exception {
        saveArticle("Taladro", "Córdoba", 30.0, ArticleStatus.AVAILABLE);

        when(cityService.getCityCoordinates("Sevilla", "España")).thenReturn(SEVILLA);
        when(cityService.getCityCoordinates("Córdoba", "España")).thenReturn(CORDOBA);

        mockMvc.perform(get("/api/article/nearby")
                .param("city", "Sevilla")
                .param("country", "España")
                .param("radiusKm", "0"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void nearby_integration_responseDTOContainsAllFields() throws Exception {
        Article a = saveArticle("Taladro Pro", "Córdoba", 49.99, ArticleStatus.AVAILABLE);

        when(cityService.getCityCoordinates("Sevilla", "España")).thenReturn(SEVILLA);
        when(cityService.getCityCoordinates("Córdoba", "España")).thenReturn(CORDOBA);

        mockMvc.perform(get("/api/article/nearby")
                .param("city", "Sevilla")
                .param("country", "España"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].id").isNumber())
            .andExpect(jsonPath("$[0].itemType").value("ARTICLE"))
            .andExpect(jsonPath("$[0].title").value("Taladro Pro"))
            .andExpect(jsonPath("$[0].city").value("Córdoba"))
            .andExpect(jsonPath("$[0].pricePerMonth").value(49.99))
            .andExpect(jsonPath("$[0].category").value("Bricolaje"))
            .andExpect(jsonPath("$[0].ownerName").value("Juan"))
            .andExpect(jsonPath("$[0].status").value("AVAILABLE"))
            .andExpect(jsonPath("$[0].distanceKm").isNumber())
            .andExpect(jsonPath("$[0].cityLat").isNumber())
            .andExpect(jsonPath("$[0].cityLng").isNumber());
    }

    @Test
    void map_integration_responseDTOContainsAllFields() throws Exception {
        saveArticle("Taladro Madrid", "Madrid", 30.0, ArticleStatus.AVAILABLE);

        when(cityService.getCityCoordinates("Madrid", "España")).thenReturn(MADRID);

        mockMvc.perform(get("/api/article/map")
                .param("country", "España"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].id").isNumber())
            .andExpect(jsonPath("$[0].itemType").value("ARTICLE"))
            .andExpect(jsonPath("$[0].title").value("Taladro Madrid"))
            .andExpect(jsonPath("$[0].city").value("Madrid"))
            .andExpect(jsonPath("$[0].pricePerMonth").value(30.0))
            .andExpect(jsonPath("$[0].status").value("AVAILABLE"))
            .andExpect(jsonPath("$[0].distanceKm").value(0.0))
            .andExpect(jsonPath("$[0].cityLat").isNumber())
            .andExpect(jsonPath("$[0].cityLng").isNumber());
    }

    @Test
    void map_integration_excludesNonAvailableArticles() throws Exception {
        saveArticle("Taladro disponible", "Madrid", 30.0, ArticleStatus.AVAILABLE);
        saveArticle("Taladro alquilado", "Madrid", 35.0, ArticleStatus.RENTED);

        when(cityService.getCityCoordinates("Madrid", "España")).thenReturn(MADRID);

        mockMvc.perform(get("/api/article/map")
                .param("country", "España"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].title").value("Taladro disponible"));
    }
}
