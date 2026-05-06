package com.example.demo.article;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import com.example.demo.dto.ArticleNearbyDTO;
import com.example.demo.dto.CityCoordinatesDTO;
import com.example.demo.model.*;
import com.example.demo.repository.ArticleRepository;
import com.example.demo.service.ArticleService;
import com.example.demo.service.CityService;

/**
 * Tests unitarios de servicio para CU-ARRENDATARIO-10: Ampliación de búsqueda geográfica
 *
 * Reglas de negocio cubiertas:
 * - RN-KIT-24: El arrendatario puede seleccionar la ciudad destino para ver objetos disponibles
 * - RN-KIT-25: El arrendatario puede filtrar productos por ciudad con territorio ampliado
 * - RN-ENT-04: Tarifa fija de envío courier €9.99 por kit
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class NearbyArticleServiceTest {

    @Mock
    private ArticleRepository articleRepository;

    @Mock
    private CityService cityService;

    @InjectMocks
    private ArticleService articleService;

    private static final LocalDate FROM = LocalDate.now().plusDays(1);
    private static final LocalDate UNTIL = LocalDate.now().plusDays(30);

    // Coordenadas reales de ciudades españolas para tests
    private static final CityCoordinatesDTO SEVILLA_COORDS =
        new CityCoordinatesDTO("Sevilla", "España", 37.3886, -5.9823);
    private static final CityCoordinatesDTO CORDOBA_COORDS =
        new CityCoordinatesDTO("Córdoba", "España", 37.8882, -4.7794);
    private static final CityCoordinatesDTO MADRID_COORDS =
        new CityCoordinatesDTO("Madrid", "España", 40.4168, -3.7038);
    private static final CityCoordinatesDTO BARCELONA_COORDS =
        new CityCoordinatesDTO("Barcelona", "España", 41.3874, 2.1686);

    private User owner;
    private Category category;

    @BeforeEach
    void setUp() {
        owner = new User();
        owner.setId(1L);
        owner.setName("Owner");

        category = new Category("Bricolaje", "Desc", 5.0, 500.0);
        category.setId(1L);
        category.setStatus(CategoryStatus.ACTIVE);
    }

    private Article createArticle(Long id, String title, String city, Double price) {
        Article a = new Article();
        a.setId(id);
        a.setTitle(title);
        a.setDescription("Descripción de " + title);
        a.setCity(city);
        a.setPricePerMonth(price);
        a.setStatus(ArticleStatus.AVAILABLE);
        a.setAvailableFrom(FROM);
        a.setAvailableUntil(UNTIL);
        a.setOwner(owner);
        a.setCategory(category);
        a.setTotalUnits(1);
        return a;
    }

    // =====================================================
    // findNearbyArticles - Búsqueda de artículos cercanos
    // =====================================================

    @Test
    void findNearbyArticles_returnArticlesWithinRadius() {
        // Sevilla → Córdoba ~130km (dentro de 150km por defecto)
        when(cityService.getCityCoordinates("Sevilla", "España")).thenReturn(SEVILLA_COORDS);
        when(cityService.getCityCoordinates("Córdoba", "España")).thenReturn(CORDOBA_COORDS);
        when(articleRepository.findDistinctCitiesByStatus(ArticleStatus.AVAILABLE))
            .thenReturn(List.of("Córdoba", "Madrid", "Barcelona"));

        Article cordobaArticle = createArticle(1L, "Taladro", "Córdoba", 30.0);
        when(articleRepository.findByStatusAndCityIn(eq(ArticleStatus.AVAILABLE), anyList()))
            .thenReturn(List.of(cordobaArticle));

        List<ArticleNearbyDTO> result = articleService.findNearbyArticles("Sevilla", "España", 150);

        assertFalse(result.isEmpty());
        assertEquals("Córdoba", result.get(0).city());
        assertTrue(result.get(0).distanceKm() > 0);
        assertTrue(result.get(0).distanceKm() <= 150);
    }

    @Test
    void findNearbyArticles_excludesTargetCity() {
        when(cityService.getCityCoordinates("Sevilla", "España")).thenReturn(SEVILLA_COORDS);
        when(articleRepository.findDistinctCitiesByStatus(ArticleStatus.AVAILABLE))
            .thenReturn(List.of("Sevilla", "Córdoba"));
        when(cityService.getCityCoordinates("Córdoba", "España")).thenReturn(CORDOBA_COORDS);

        Article cordobaArticle = createArticle(1L, "Taladro", "Córdoba", 30.0);
        when(articleRepository.findByStatusAndCityIn(eq(ArticleStatus.AVAILABLE), anyList()))
            .thenReturn(List.of(cordobaArticle));

        List<ArticleNearbyDTO> result = articleService.findNearbyArticles("Sevilla", "España", 150);

        // No debe incluir artículos de Sevilla (ciudad objetivo)
        result.forEach(dto -> assertNotEquals("Sevilla", dto.city()));
    }

    @Test
    void findNearbyArticles_excludesCitiesBeyondRadius() {
        // Sevilla → Barcelona ~830km (fuera de 150km)
        when(cityService.getCityCoordinates("Sevilla", "España")).thenReturn(SEVILLA_COORDS);
        when(cityService.getCityCoordinates("Barcelona", "España")).thenReturn(BARCELONA_COORDS);
        when(articleRepository.findDistinctCitiesByStatus(ArticleStatus.AVAILABLE))
            .thenReturn(List.of("Barcelona"));

        List<ArticleNearbyDTO> result = articleService.findNearbyArticles("Sevilla", "España", 150);

        assertTrue(result.isEmpty());
    }

    @Test
    void findNearbyArticles_withCustomRadius_expandsSearch() {
        // Sevilla → Madrid ~390km; con radio 500km debería incluirse
        when(cityService.getCityCoordinates("Sevilla", "España")).thenReturn(SEVILLA_COORDS);
        when(cityService.getCityCoordinates("Madrid", "España")).thenReturn(MADRID_COORDS);
        when(articleRepository.findDistinctCitiesByStatus(ArticleStatus.AVAILABLE))
            .thenReturn(List.of("Madrid"));

        Article madridArticle = createArticle(1L, "Sierra", "Madrid", 45.0);
        when(articleRepository.findByStatusAndCityIn(eq(ArticleStatus.AVAILABLE), anyList()))
            .thenReturn(List.of(madridArticle));

        List<ArticleNearbyDTO> result = articleService.findNearbyArticles("Sevilla", "España", 500);

        assertFalse(result.isEmpty());
        assertEquals("Madrid", result.get(0).city());
    }

    @Test
    void findNearbyArticles_returnsEmptyWhenTargetCityNotFound() {
        when(cityService.getCityCoordinates("CiudadInexistente", "España")).thenReturn(null);

        List<ArticleNearbyDTO> result = articleService.findNearbyArticles("CiudadInexistente", "España", 150);

        assertTrue(result.isEmpty());
    }

    @Test
    void findNearbyArticles_returnsEmptyWhenNoAvailableCities() {
        when(cityService.getCityCoordinates("Sevilla", "España")).thenReturn(SEVILLA_COORDS);
        when(articleRepository.findDistinctCitiesByStatus(ArticleStatus.AVAILABLE))
            .thenReturn(List.of());

        List<ArticleNearbyDTO> result = articleService.findNearbyArticles("Sevilla", "España", 150);

        assertTrue(result.isEmpty());
    }

    @Test
    void findNearbyArticles_returnsEmptyWhenNearbyCityHasNullCoordinates() {
        when(cityService.getCityCoordinates("Sevilla", "España")).thenReturn(SEVILLA_COORDS);
        when(cityService.getCityCoordinates("CiudadSinCoords", "España")).thenReturn(null);
        when(articleRepository.findDistinctCitiesByStatus(ArticleStatus.AVAILABLE))
            .thenReturn(List.of("CiudadSinCoords"));

        List<ArticleNearbyDTO> result = articleService.findNearbyArticles("Sevilla", "España", 150);

        assertTrue(result.isEmpty());
    }

    @Test
    void findNearbyArticles_distanceIsRoundedToOneDecimal() {
        when(cityService.getCityCoordinates("Sevilla", "España")).thenReturn(SEVILLA_COORDS);
        when(cityService.getCityCoordinates("Córdoba", "España")).thenReturn(CORDOBA_COORDS);
        when(articleRepository.findDistinctCitiesByStatus(ArticleStatus.AVAILABLE))
            .thenReturn(List.of("Córdoba"));

        Article cordobaArticle = createArticle(1L, "Taladro", "Córdoba", 30.0);
        when(articleRepository.findByStatusAndCityIn(eq(ArticleStatus.AVAILABLE), anyList()))
            .thenReturn(List.of(cordobaArticle));

        List<ArticleNearbyDTO> result = articleService.findNearbyArticles("Sevilla", "España", 200);

        assertFalse(result.isEmpty());
        double distance = result.get(0).distanceKm();
        assertEquals(distance, Math.round(distance * 10.0) / 10.0, 0.001);
    }

    @Test
    void findNearbyArticles_mapsAllDTOFieldsCorrectly() {
        when(cityService.getCityCoordinates("Sevilla", "España")).thenReturn(SEVILLA_COORDS);
        when(cityService.getCityCoordinates("Córdoba", "España")).thenReturn(CORDOBA_COORDS);
        when(articleRepository.findDistinctCitiesByStatus(ArticleStatus.AVAILABLE))
            .thenReturn(List.of("Córdoba"));

        Article cordobaArticle = createArticle(1L, "Taladro", "Córdoba", 30.0);
        cordobaArticle.setImageUrl("http://img.test/taladro.jpg");
        when(articleRepository.findByStatusAndCityIn(eq(ArticleStatus.AVAILABLE), anyList()))
            .thenReturn(List.of(cordobaArticle));

        List<ArticleNearbyDTO> result = articleService.findNearbyArticles("Sevilla", "España", 200);

        assertEquals(1, result.size());
        ArticleNearbyDTO dto = result.get(0);
        assertEquals(1L, dto.id());
        assertEquals("ARTICLE", dto.itemType());
        assertEquals("Taladro", dto.title());
        assertEquals("Descripción de Taladro", dto.description());
        assertEquals("Córdoba", dto.city());
        assertEquals(30.0, dto.pricePerMonth());
        assertEquals(FROM, dto.availableFrom());
        assertEquals(UNTIL, dto.availableUntil());
        assertEquals("Bricolaje", dto.category());
        assertEquals(1, dto.totalUnits());
        assertEquals(1L, dto.ownerId());
        assertEquals("Owner", dto.ownerName());
        assertEquals("AVAILABLE", dto.status());
        assertEquals("http://img.test/taladro.jpg", dto.imageUrl());
        assertTrue(dto.cityLat() != 0.0);
        assertTrue(dto.cityLng() != 0.0);
    }

    @Test
    void findNearbyArticles_onlyReturnsAvailableArticles() {
        when(cityService.getCityCoordinates("Sevilla", "España")).thenReturn(SEVILLA_COORDS);
        when(articleRepository.findDistinctCitiesByStatus(ArticleStatus.AVAILABLE))
            .thenReturn(List.of("Córdoba"));
        when(cityService.getCityCoordinates("Córdoba", "España")).thenReturn(CORDOBA_COORDS);

        // El repositorio solo busca artículos con status AVAILABLE
        when(articleRepository.findByStatusAndCityIn(eq(ArticleStatus.AVAILABLE), anyList()))
            .thenReturn(List.of());

        List<ArticleNearbyDTO> result = articleService.findNearbyArticles("Sevilla", "España", 200);

        verify(articleRepository).findDistinctCitiesByStatus(ArticleStatus.AVAILABLE);
        verify(articleRepository).findByStatusAndCityIn(eq(ArticleStatus.AVAILABLE), anyList());
    }

    @Test
    void findNearbyArticles_multipleArticlesFromMultipleCities() {
        when(cityService.getCityCoordinates("Sevilla", "España")).thenReturn(SEVILLA_COORDS);
        when(cityService.getCityCoordinates("Córdoba", "España")).thenReturn(CORDOBA_COORDS);
        when(cityService.getCityCoordinates("Madrid", "España")).thenReturn(MADRID_COORDS);
        when(articleRepository.findDistinctCitiesByStatus(ArticleStatus.AVAILABLE))
            .thenReturn(List.of("Córdoba", "Madrid"));

        Article a1 = createArticle(1L, "Taladro", "Córdoba", 30.0);
        Article a2 = createArticle(2L, "Sierra", "Córdoba", 45.0);
        // Madrid a ~390km, no entra en 150km
        when(articleRepository.findByStatusAndCityIn(eq(ArticleStatus.AVAILABLE), anyList()))
            .thenReturn(List.of(a1, a2));

        List<ArticleNearbyDTO> result = articleService.findNearbyArticles("Sevilla", "España", 150);

        assertEquals(2, result.size());
    }

    // =====================================================
    // findAllWithCoords - Artículos para mapa
    // =====================================================

    @Test
    void findAllWithCoords_returnsAllAvailableArticlesWithCoordinates() {
        Article a1 = createArticle(1L, "Taladro", "Madrid", 30.0);
        a1.setCountry("España");
        Article a2 = createArticle(2L, "Sierra", "Barcelona", 45.0);
        a2.setCountry("España");

        when(articleRepository.findByStatus(ArticleStatus.AVAILABLE)).thenReturn(List.of(a1, a2));
        when(cityService.getCityCoordinates("Madrid", "España")).thenReturn(MADRID_COORDS);
        when(cityService.getCityCoordinates("Barcelona", "España")).thenReturn(BARCELONA_COORDS);

        List<ArticleNearbyDTO> result = articleService.findAllWithCoords("España");

        assertEquals(2, result.size());
        assertEquals(0.0, result.get(0).distanceKm());
        assertEquals(0.0, result.get(1).distanceKm());
    }

    @Test
    void findAllWithCoords_whenIncludeRentedTrue_returnsAvailableAndRentedArticles() {
        Article available = createArticle(1L, "Taladro disponible", "Madrid", 30.0);
        available.setCountry("España");

        Article rentedWithStock = createArticle(2L, "Cámara alquilada parcialmente", "Barcelona", 45.0);
        rentedWithStock.setCountry("España");
        rentedWithStock.setStatus(ArticleStatus.RENTED);
        rentedWithStock.setTotalUnits(2);

        when(articleRepository.findByStatusIn(List.of(ArticleStatus.AVAILABLE, ArticleStatus.RENTED)))
            .thenReturn(List.of(available, rentedWithStock));
        when(cityService.getCityCoordinates("Madrid", "España")).thenReturn(MADRID_COORDS);
        when(cityService.getCityCoordinates("Barcelona", "España")).thenReturn(BARCELONA_COORDS);

        List<ArticleNearbyDTO> result = articleService.findAllWithCoords("España", true);

        assertEquals(2, result.size());
        assertEquals("AVAILABLE", result.get(0).status());
        assertEquals("RENTED", result.get(1).status());
        assertEquals(2, result.get(1).totalUnits());
    }

    @Test
    void findAllWithCoords_usesArticleCountryWhenAvailable() {
        Article a = createArticle(1L, "Taladro", "Madrid", 30.0);
        a.setCountry("España");

        when(articleRepository.findByStatus(ArticleStatus.AVAILABLE)).thenReturn(List.of(a));
        when(cityService.getCityCoordinates("Madrid", "España")).thenReturn(MADRID_COORDS);

        List<ArticleNearbyDTO> result = articleService.findAllWithCoords("Francia");

        // Usa el country del artículo ("España"), no el parámetro ("Francia")
        verify(cityService).getCityCoordinates("Madrid", "España");
    }

    @Test
    void findAllWithCoords_fallbackToParameterCountryWhenArticleCountryNull() {
        Article a = createArticle(1L, "Taladro", "Madrid", 30.0);
        a.setCountry(null);

        when(articleRepository.findByStatus(ArticleStatus.AVAILABLE)).thenReturn(List.of(a));
        when(cityService.getCityCoordinates("Madrid", "Francia")).thenReturn(
            new CityCoordinatesDTO("Madrid", "Francia", 40.4, -3.7));

        List<ArticleNearbyDTO> result = articleService.findAllWithCoords("Francia");

        verify(cityService).getCityCoordinates("Madrid", "Francia");
    }

    @Test
    void findAllWithCoords_handlesNullCoordinatesGracefully() {
        Article a = createArticle(1L, "Taladro", "CiudadDesconocida", 30.0);
        a.setCountry("España");

        when(articleRepository.findByStatus(ArticleStatus.AVAILABLE)).thenReturn(List.of(a));
        when(cityService.getCityCoordinates("CiudadDesconocida", "España")).thenReturn(null);

        List<ArticleNearbyDTO> result = articleService.findAllWithCoords("España");

        assertEquals(1, result.size());
        assertEquals(0.0, result.get(0).cityLat());
        assertEquals(0.0, result.get(0).cityLng());
    }

    @Test
    void findAllWithCoords_withNoCountryParameter() {
        Article a = createArticle(1L, "Taladro", "Madrid", 30.0);
        a.setCountry(null);

        when(articleRepository.findByStatus(ArticleStatus.AVAILABLE)).thenReturn(List.of(a));

        List<ArticleNearbyDTO> result = articleService.findAllWithCoords(null);

        assertEquals(1, result.size());
        assertEquals(0.0, result.get(0).cityLat());
        assertEquals(0.0, result.get(0).cityLng());
    }

    @Test
    void findAllWithCoords_emptyWhenNoAvailableArticles() {
        when(articleRepository.findByStatus(ArticleStatus.AVAILABLE)).thenReturn(List.of());

        List<ArticleNearbyDTO> result = articleService.findAllWithCoords("España");

        assertTrue(result.isEmpty());
    }

    // =====================================================
    // haversineKm (verificación indirecta)
    // =====================================================

    @Test
    void haversine_sevillaToCordoba_approximatelyCorrect() {
        // Sevilla–Córdoba ≈ 130km en línea recta
        when(cityService.getCityCoordinates("Sevilla", "España")).thenReturn(SEVILLA_COORDS);
        when(cityService.getCityCoordinates("Córdoba", "España")).thenReturn(CORDOBA_COORDS);
        when(articleRepository.findDistinctCitiesByStatus(ArticleStatus.AVAILABLE))
            .thenReturn(List.of("Córdoba"));

        Article a = createArticle(1L, "Test", "Córdoba", 10.0);
        when(articleRepository.findByStatusAndCityIn(eq(ArticleStatus.AVAILABLE), anyList()))
            .thenReturn(List.of(a));

        List<ArticleNearbyDTO> result = articleService.findNearbyArticles("Sevilla", "España", 200);

        double distance = result.get(0).distanceKm();
        assertTrue(distance > 100 && distance < 160,
            "Distancia Sevilla-Córdoba debería estar entre 100-160km, fue: " + distance);
    }

    @Test
    void haversine_samePoint_returnsZeroDistance() {
        CityCoordinatesDTO sevillaAgain = new CityCoordinatesDTO("Sevilla2", "España", 37.3886, -5.9823);
        when(cityService.getCityCoordinates("Sevilla", "España")).thenReturn(SEVILLA_COORDS);
        when(cityService.getCityCoordinates("Sevilla2", "España")).thenReturn(sevillaAgain);
        when(articleRepository.findDistinctCitiesByStatus(ArticleStatus.AVAILABLE))
            .thenReturn(List.of("Sevilla2"));

        Article a = createArticle(1L, "Test", "Sevilla2", 10.0);
        when(articleRepository.findByStatusAndCityIn(eq(ArticleStatus.AVAILABLE), anyList()))
            .thenReturn(List.of(a));

        List<ArticleNearbyDTO> result = articleService.findNearbyArticles("Sevilla", "España", 1);

        assertEquals(0.0, result.get(0).distanceKm());
    }

    // =====================================================
    // Null branches en findNearbyArticles
    // =====================================================

    @Test
    void findNearbyArticles_articleWithNullCategory_returnsNullCategoryName() {
        when(cityService.getCityCoordinates("Sevilla", "España")).thenReturn(SEVILLA_COORDS);
        when(cityService.getCityCoordinates("Córdoba", "España")).thenReturn(CORDOBA_COORDS);
        when(articleRepository.findDistinctCitiesByStatus(ArticleStatus.AVAILABLE))
            .thenReturn(List.of("Córdoba"));

        Article a = createArticle(1L, "Taladro", "Córdoba", 30.0);
        a.setCategory(null);
        when(articleRepository.findByStatusAndCityIn(eq(ArticleStatus.AVAILABLE), anyList()))
            .thenReturn(List.of(a));

        List<ArticleNearbyDTO> result = articleService.findNearbyArticles("Sevilla", "España", 200);

        assertEquals(1, result.size());
        assertNull(result.get(0).category());
    }

    @Test
    void findNearbyArticles_articleWithNullOwner_returnsNullOwnerFields() {
        when(cityService.getCityCoordinates("Sevilla", "España")).thenReturn(SEVILLA_COORDS);
        when(cityService.getCityCoordinates("Córdoba", "España")).thenReturn(CORDOBA_COORDS);
        when(articleRepository.findDistinctCitiesByStatus(ArticleStatus.AVAILABLE))
            .thenReturn(List.of("Córdoba"));

        Article a = createArticle(1L, "Taladro", "Córdoba", 30.0);
        a.setOwner(null);
        when(articleRepository.findByStatusAndCityIn(eq(ArticleStatus.AVAILABLE), anyList()))
            .thenReturn(List.of(a));

        List<ArticleNearbyDTO> result = articleService.findNearbyArticles("Sevilla", "España", 200);

        assertEquals(1, result.size());
        assertNull(result.get(0).ownerName());
        assertNull(result.get(0).ownerId());
    }

    @Test
    void findNearbyArticles_articleWithNullStatus_returnsNullStatus() {
        when(cityService.getCityCoordinates("Sevilla", "España")).thenReturn(SEVILLA_COORDS);
        when(cityService.getCityCoordinates("Córdoba", "España")).thenReturn(CORDOBA_COORDS);
        when(articleRepository.findDistinctCitiesByStatus(ArticleStatus.AVAILABLE))
            .thenReturn(List.of("Córdoba"));

        Article a = createArticle(1L, "Taladro", "Córdoba", 30.0);
        a.setStatus(null);
        when(articleRepository.findByStatusAndCityIn(eq(ArticleStatus.AVAILABLE), anyList()))
            .thenReturn(List.of(a));

        List<ArticleNearbyDTO> result = articleService.findNearbyArticles("Sevilla", "España", 200);

        assertEquals(1, result.size());
        assertNull(result.get(0).status());
    }

    @Test
    void findNearbyArticles_caseInsensitiveExcludesTargetCity() {
        when(cityService.getCityCoordinates("sevilla", "España")).thenReturn(SEVILLA_COORDS);
        when(articleRepository.findDistinctCitiesByStatus(ArticleStatus.AVAILABLE))
            .thenReturn(List.of("Sevilla", "Córdoba"));
        when(cityService.getCityCoordinates("Córdoba", "España")).thenReturn(CORDOBA_COORDS);

        Article a = createArticle(1L, "Taladro", "Córdoba", 30.0);
        when(articleRepository.findByStatusAndCityIn(eq(ArticleStatus.AVAILABLE), anyList()))
            .thenReturn(List.of(a));

        // Target city "sevilla" (minúscula) debe excluir "Sevilla" (mayúscula)
        List<ArticleNearbyDTO> result = articleService.findNearbyArticles("sevilla", "España", 200);

        result.forEach(dto -> assertNotEquals("Sevilla", dto.city()));
    }

    @Test
    void findNearbyArticles_articleWithNullImageUrl_returnsNullImageUrl() {
        when(cityService.getCityCoordinates("Sevilla", "España")).thenReturn(SEVILLA_COORDS);
        when(cityService.getCityCoordinates("Córdoba", "España")).thenReturn(CORDOBA_COORDS);
        when(articleRepository.findDistinctCitiesByStatus(ArticleStatus.AVAILABLE))
            .thenReturn(List.of("Córdoba"));

        Article a = createArticle(1L, "Taladro", "Córdoba", 30.0);
        a.setImageUrl(null);
        when(articleRepository.findByStatusAndCityIn(eq(ArticleStatus.AVAILABLE), anyList()))
            .thenReturn(List.of(a));

        List<ArticleNearbyDTO> result = articleService.findNearbyArticles("Sevilla", "España", 200);

        assertEquals(1, result.size());
        assertNull(result.get(0).imageUrl());
    }

    @Test
    void findNearbyArticles_returnsCorrectItemType() {
        when(cityService.getCityCoordinates("Sevilla", "España")).thenReturn(SEVILLA_COORDS);
        when(cityService.getCityCoordinates("Córdoba", "España")).thenReturn(CORDOBA_COORDS);
        when(articleRepository.findDistinctCitiesByStatus(ArticleStatus.AVAILABLE))
            .thenReturn(List.of("Córdoba"));

        Article a = createArticle(1L, "Taladro", "Córdoba", 30.0);
        when(articleRepository.findByStatusAndCityIn(eq(ArticleStatus.AVAILABLE), anyList()))
            .thenReturn(List.of(a));

        List<ArticleNearbyDTO> result = articleService.findNearbyArticles("Sevilla", "España", 200);

        assertEquals("ARTICLE", result.get(0).itemType());
    }

    // =====================================================
    // Cobertura adicional: null branches en findAllWithCoords
    // =====================================================

    @Test
    void findAllWithCoords_articleWithNullCategory_returnsNullCategoryName() {
        Article a = createArticle(1L, "Taladro", "Madrid", 30.0);
        a.setCountry("España");
        a.setCategory(null);

        when(articleRepository.findByStatus(ArticleStatus.AVAILABLE)).thenReturn(List.of(a));
        when(cityService.getCityCoordinates("Madrid", "España")).thenReturn(MADRID_COORDS);

        List<ArticleNearbyDTO> result = articleService.findAllWithCoords("España");

        assertEquals(1, result.size());
        assertNull(result.get(0).category());
    }

    @Test
    void findAllWithCoords_articleWithNullOwner_returnsNullOwnerFields() {
        Article a = createArticle(1L, "Taladro", "Madrid", 30.0);
        a.setCountry("España");
        a.setOwner(null);

        when(articleRepository.findByStatus(ArticleStatus.AVAILABLE)).thenReturn(List.of(a));
        when(cityService.getCityCoordinates("Madrid", "España")).thenReturn(MADRID_COORDS);

        List<ArticleNearbyDTO> result = articleService.findAllWithCoords("España");

        assertEquals(1, result.size());
        assertNull(result.get(0).ownerName());
        assertNull(result.get(0).ownerId());
    }

    @Test
    void findAllWithCoords_articleWithNullStatus_returnsNullStatus() {
        Article a = createArticle(1L, "Taladro", "Madrid", 30.0);
        a.setCountry("España");
        a.setStatus(null);

        when(articleRepository.findByStatus(ArticleStatus.AVAILABLE)).thenReturn(List.of(a));
        when(cityService.getCityCoordinates("Madrid", "España")).thenReturn(MADRID_COORDS);

        List<ArticleNearbyDTO> result = articleService.findAllWithCoords("España");

        assertEquals(1, result.size());
        assertNull(result.get(0).status());
    }

    @Test
    void findAllWithCoords_distanceIsAlwaysZero() {
        Article a = createArticle(1L, "Taladro", "Madrid", 30.0);
        a.setCountry("España");

        when(articleRepository.findByStatus(ArticleStatus.AVAILABLE)).thenReturn(List.of(a));
        when(cityService.getCityCoordinates("Madrid", "España")).thenReturn(MADRID_COORDS);

        List<ArticleNearbyDTO> result = articleService.findAllWithCoords("España");

        assertEquals(0.0, result.get(0).distanceKm());
    }

    @Test
    void findAllWithCoords_multipleArticles_sameCity() {
        Article a1 = createArticle(1L, "Taladro", "Madrid", 30.0);
        a1.setCountry("España");
        Article a2 = createArticle(2L, "Sierra", "Madrid", 45.0);
        a2.setCountry("España");

        when(articleRepository.findByStatus(ArticleStatus.AVAILABLE)).thenReturn(List.of(a1, a2));
        when(cityService.getCityCoordinates("Madrid", "España")).thenReturn(MADRID_COORDS);

        List<ArticleNearbyDTO> result = articleService.findAllWithCoords("España");

        assertEquals(2, result.size());
        assertEquals("ARTICLE", result.get(0).itemType());
        assertEquals("ARTICLE", result.get(1).itemType());
    }

    @Test
    void findAllWithCoords_mapsAllDTOFieldsCorrectly() {
        Article a = createArticle(1L, "Taladro", "Madrid", 30.0);
        a.setCountry("España");
        a.setImageUrl("http://img.test/taladro.jpg");

        when(articleRepository.findByStatus(ArticleStatus.AVAILABLE)).thenReturn(List.of(a));
        when(cityService.getCityCoordinates("Madrid", "España")).thenReturn(MADRID_COORDS);

        List<ArticleNearbyDTO> result = articleService.findAllWithCoords("España");

        ArticleNearbyDTO dto = result.get(0);
        assertEquals(1L, dto.id());
        assertEquals("ARTICLE", dto.itemType());
        assertEquals("Taladro", dto.title());
        assertEquals("Madrid", dto.city());
        assertEquals(30.0, dto.pricePerMonth());
        assertEquals("Bricolaje", dto.category());
        assertEquals("Owner", dto.ownerName());
        assertEquals(1L, dto.ownerId());
        assertEquals("AVAILABLE", dto.status());
        assertEquals("http://img.test/taladro.jpg", dto.imageUrl());
        assertEquals(40.4168, dto.cityLat(), 0.001);
        assertEquals(-3.7038, dto.cityLng(), 0.001);
        assertEquals(0.0, dto.distanceKm());
    }
}
