package com.example.demo.article;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

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
 * Tests de rendimiento para CU-ARRENDATARIO-10: Ampliación de búsqueda geográfica
 *
 * Verifican que las operaciones de búsqueda geográfica se ejecutan dentro de
 * umbrales de tiempo aceptables, incluso con volúmenes altos de datos.
 *
 * Reglas de negocio cubiertas:
 * - RN-KIT-24, RN-KIT-25: Búsqueda eficiente por ciudad y territorio ampliado
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class NearbyArticlePerformanceTest {

    @Mock private ArticleRepository articleRepository;
    @Mock private CityService cityService;
    @InjectMocks private ArticleService articleService;

    private static final LocalDate FROM = LocalDate.now().plusDays(1);
    private static final LocalDate UNTIL = LocalDate.now().plusDays(30);
    private static final CityCoordinatesDTO SEVILLA =
        new CityCoordinatesDTO("Sevilla", "España", 37.3886, -5.9823);

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

    private Article createArticle(Long id, String city) {
        Article a = new Article();
        a.setId(id);
        a.setTitle("Artículo " + id);
        a.setDescription("Desc " + id);
        a.setCity(city);
        a.setPricePerMonth(25.0);
        a.setStatus(ArticleStatus.AVAILABLE);
        a.setAvailableFrom(FROM);
        a.setAvailableUntil(UNTIL);
        a.setOwner(owner);
        a.setCategory(category);
        a.setTotalUnits(1);
        return a;
    }

    @Test
    void findNearbyArticles_with50Cities_completesUnder2Seconds() {
        when(cityService.getCityCoordinates("Sevilla", "España")).thenReturn(SEVILLA);

        List<String> cities = IntStream.rangeClosed(1, 50)
            .mapToObj(i -> "Ciudad" + i)
            .collect(Collectors.toList());
        when(articleRepository.findDistinctCitiesByStatus(ArticleStatus.AVAILABLE)).thenReturn(cities);

        // Simular coordenadas para todas las ciudades (variaciones cercanas a Sevilla)
        for (int i = 1; i <= 50; i++) {
            String cityName = "Ciudad" + i;
            double latOffset = (i * 0.01);
            when(cityService.getCityCoordinates(cityName, "España"))
                .thenReturn(new CityCoordinatesDTO(cityName, "España",
                    37.3886 + latOffset, -5.9823 + latOffset));
        }

        List<Article> articles = IntStream.rangeClosed(1, 50)
            .mapToObj(i -> createArticle((long) i, "Ciudad" + i))
            .collect(Collectors.toList());
        when(articleRepository.findByStatusAndCityIn(eq(ArticleStatus.AVAILABLE), anyList()))
            .thenReturn(articles);

        long start = System.currentTimeMillis();
        List<ArticleNearbyDTO> result = articleService.findNearbyArticles("Sevilla", "España", 500);
        long elapsed = System.currentTimeMillis() - start;

        assertTrue(elapsed < 2000,
            "La búsqueda con 50 ciudades debería completarse en < 2s, tardó: " + elapsed + "ms");
        assertFalse(result.isEmpty());
    }

    @Test
    void findNearbyArticles_with100Articles_completesUnder2Seconds() {
        when(cityService.getCityCoordinates("Sevilla", "España")).thenReturn(SEVILLA);

        List<String> cities = List.of("Córdoba", "Huelva", "Málaga");
        when(articleRepository.findDistinctCitiesByStatus(ArticleStatus.AVAILABLE)).thenReturn(cities);

        when(cityService.getCityCoordinates("Córdoba", "España"))
            .thenReturn(new CityCoordinatesDTO("Córdoba", "España", 37.8882, -4.7794));
        when(cityService.getCityCoordinates("Huelva", "España"))
            .thenReturn(new CityCoordinatesDTO("Huelva", "España", 37.2614, -6.9447));
        when(cityService.getCityCoordinates("Málaga", "España"))
            .thenReturn(new CityCoordinatesDTO("Málaga", "España", 36.7213, -4.4214));

        List<Article> articles = new ArrayList<>();
        String[] nearCities = {"Córdoba", "Huelva", "Málaga"};
        for (int i = 0; i < 100; i++) {
            articles.add(createArticle((long) i, nearCities[i % 3]));
        }
        when(articleRepository.findByStatusAndCityIn(eq(ArticleStatus.AVAILABLE), anyList()))
            .thenReturn(articles);

        long start = System.currentTimeMillis();
        List<ArticleNearbyDTO> result = articleService.findNearbyArticles("Sevilla", "España", 200);
        long elapsed = System.currentTimeMillis() - start;

        assertTrue(elapsed < 2000,
            "La búsqueda con 100 artículos debería completarse en < 2s, tardó: " + elapsed + "ms");
        assertEquals(100, result.size());
    }

    @Test
    void findAllWithCoords_with200Articles_completesUnder2Seconds() {
        List<Article> articles = new ArrayList<>();
        String[] cities = {"Madrid", "Barcelona", "Valencia", "Sevilla"};
        for (int i = 0; i < 200; i++) {
            Article a = createArticle((long) i, cities[i % 4]);
            a.setCountry("España");
            articles.add(a);
        }
        when(articleRepository.findByStatus(ArticleStatus.AVAILABLE)).thenReturn(articles);
        when(cityService.getCityCoordinates("Madrid", "España"))
            .thenReturn(new CityCoordinatesDTO("Madrid", "España", 40.4168, -3.7038));
        when(cityService.getCityCoordinates("Barcelona", "España"))
            .thenReturn(new CityCoordinatesDTO("Barcelona", "España", 41.3874, 2.1686));
        when(cityService.getCityCoordinates("Valencia", "España"))
            .thenReturn(new CityCoordinatesDTO("Valencia", "España", 39.4699, -0.3763));
        when(cityService.getCityCoordinates("Sevilla", "España"))
            .thenReturn(new CityCoordinatesDTO("Sevilla", "España", 37.3886, -5.9823));

        long start = System.currentTimeMillis();
        List<ArticleNearbyDTO> result = articleService.findAllWithCoords("España");
        long elapsed = System.currentTimeMillis() - start;

        assertTrue(elapsed < 2000,
            "El mapa con 200 artículos debería completarse en < 2s, tardó: " + elapsed + "ms");
        assertEquals(200, result.size());
    }

    @Test
    void findNearbyArticles_withNoNearbyCities_returnsQuickly() {
        when(cityService.getCityCoordinates("Sevilla", "España")).thenReturn(SEVILLA);

        // Todas las ciudades están muy lejos
        List<String> cities = IntStream.rangeClosed(1, 20)
            .mapToObj(i -> "CiudadLejana" + i)
            .collect(Collectors.toList());
        when(articleRepository.findDistinctCitiesByStatus(ArticleStatus.AVAILABLE)).thenReturn(cities);

        for (int i = 1; i <= 20; i++) {
            when(cityService.getCityCoordinates("CiudadLejana" + i, "España"))
                .thenReturn(new CityCoordinatesDTO("CiudadLejana" + i, "España",
                    60.0 + i, 20.0 + i));
        }

        long start = System.currentTimeMillis();
        List<ArticleNearbyDTO> result = articleService.findNearbyArticles("Sevilla", "España", 50);
        long elapsed = System.currentTimeMillis() - start;

        assertTrue(elapsed < 500,
            "Sin ciudades cercanas debería completarse en < 500ms, tardó: " + elapsed + "ms");
        assertTrue(result.isEmpty());
    }

    @Test
    void findNearbyArticles_haversineCalculation_isConsistentAcrossMultipleRuns() {
        when(cityService.getCityCoordinates("Sevilla", "España")).thenReturn(SEVILLA);
        when(cityService.getCityCoordinates("Córdoba", "España"))
            .thenReturn(new CityCoordinatesDTO("Córdoba", "España", 37.8882, -4.7794));
        when(articleRepository.findDistinctCitiesByStatus(ArticleStatus.AVAILABLE))
            .thenReturn(List.of("Córdoba"));

        Article a = createArticle(1L, "Córdoba");
        when(articleRepository.findByStatusAndCityIn(eq(ArticleStatus.AVAILABLE), anyList()))
            .thenReturn(List.of(a));

        // Ejecutar varias veces y verificar consistencia
        double firstDistance = -1;
        for (int i = 0; i < 10; i++) {
            List<ArticleNearbyDTO> result = articleService.findNearbyArticles("Sevilla", "España", 200);
            double d = result.get(0).distanceKm();
            if (firstDistance < 0) {
                firstDistance = d;
            } else {
                assertEquals(firstDistance, d, 0.001,
                    "La distancia Haversine debe ser determinista entre ejecuciones");
            }
        }
    }
}
