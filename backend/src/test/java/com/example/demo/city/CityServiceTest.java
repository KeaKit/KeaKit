package com.example.demo.city;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.demo.model.City;
import com.example.demo.model.Country;
import com.example.demo.repository.CityRepository;
import com.example.demo.service.CityService;

@ExtendWith(MockitoExtension.class)
public class CityServiceTest {

    @Mock
    private CityRepository cityRepository;

    @InjectMocks
    private CityService cityService;

    private Country createTestCountry(Long id, String name) {
        Country country = new Country();
        country.setId(id);
        country.setName(name);
        return country;
    }

    private City createTestCity(Long id, String name, Country country) {
        City city = new City();
        city.setId(id);
        city.setName(name);
        city.setCountry(country);
        return city;
    }

    @Test
    void getAllCityNamesByCountryName_returnsCorrectNames() {
        Country country = createTestCountry(1L, "Spain");
        City city1 = createTestCity(1L, "Madrid", country);
        City city2 = createTestCity(2L, "Barcelona", country);

        when(cityRepository.findByCountryName("Spain")).thenReturn(List.of(city1, city2));

        List<String> result = cityService.getAllCityNamesByCountryName("Spain");

        assertNotNull(result);
        assertEquals(2, result.size());
        assertTrue(result.contains("Madrid"));
        assertTrue(result.contains("Barcelona"));
    }

    @Test
    void getAllCityNamesByCountryName_returnsSortedAlphabetically() {
        Country country = createTestCountry(1L, "Spain");
        City city1 = createTestCity(1L, "Seville", country);
        City city2 = createTestCity(2L, "Barcelona", country);
        City city3 = createTestCity(3L, "Madrid", country);

        when(cityRepository.findByCountryName("Spain")).thenReturn(List.of(city1, city2, city3));

        List<String> result = cityService.getAllCityNamesByCountryName("Spain");

        assertEquals(List.of("Barcelona", "Madrid", "Seville"), result);
    }

    @Test
    void getAllCityNamesByCountryName_whenNoCitiesFound_returnsEmptyList() {
        when(cityRepository.findByCountryName("Atlantis")).thenReturn(List.of());

        List<String> result = cityService.getAllCityNamesByCountryName("Atlantis");

        assertNotNull(result);
        assertTrue(result.isEmpty());
    }
}