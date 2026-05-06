package com.example.demo.country;

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

import com.example.demo.model.Country;
import com.example.demo.repository.CountryRepository;
import com.example.demo.service.CountryService;

@ExtendWith(MockitoExtension.class)
public class CountryServiceTest {

    @Mock
    private CountryRepository countryRepository;

    @InjectMocks
    private CountryService countryService;

    private Country createTestCountry(Long id, String name) {
        Country country = new Country();
        country.setId(id);
        country.setName(name);
        return country;
    }

    @Test
    void getAllCountriesNames_returnsCorrectNames() {
        when(countryRepository.findAll())
            .thenReturn(List.of(
                createTestCountry(1L, "España"),
                createTestCountry(2L, "Francia")
            ));

        List<String> result = countryService.getAllCountriesNames();

        assertNotNull(result);
        assertEquals(2, result.size());
        assertTrue(result.contains("España"));
        assertTrue(result.contains("Francia"));
    }

    @Test
    void getAllCountriesNames_returnsSortedAlphabetically() {
        when(countryRepository.findAll())
            .thenReturn(List.of(
                createTestCountry(1L, "Portugal"),
                createTestCountry(2L, "Alemania"),
                createTestCountry(3L, "Francia")
            ));

        List<String> result = countryService.getAllCountriesNames();

        assertEquals(List.of("Alemania", "Francia", "Portugal"), result);
    }

    @Test
    void getAllCountriesNames_whenNoCountries_returnsEmptyList() {
        when(countryRepository.findAll()).thenReturn(List.of());

        List<String> result = countryService.getAllCountriesNames();

        assertNotNull(result);
        assertTrue(result.isEmpty());
    }
}