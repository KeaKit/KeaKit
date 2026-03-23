package com.example.demo.country;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.example.demo.controller.CountryController;
import com.example.demo.security.CustomUserDetailsService;
import com.example.demo.security.JwtUtil;
import com.example.demo.security.TokenBlacklistService;
import com.example.demo.service.CityService;
import com.example.demo.service.CountryService;

@WebMvcTest(
    controllers = CountryController.class,
    excludeAutoConfiguration = {
        SecurityAutoConfiguration.class,
        SecurityFilterAutoConfiguration.class
    }
)
public class CountryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CountryService countryService;

    @MockitoBean
    private CityService cityService;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @MockitoBean
    private TokenBlacklistService tokenBlacklistService;

    @MockitoBean
    private JwtUtil jwtUtil;

    @Test
    void getCountriesNames_success_returnsListOfCountries() throws Exception {
        when(countryService.getAllCountriesNames())
            .thenReturn(List.of("Alemania", "España", "Francia"));

        mockMvc.perform(get("/api/countries"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(3))
            .andExpect(jsonPath("$[0]").value("Alemania"))
            .andExpect(jsonPath("$[1]").value("España"))
            .andExpect(jsonPath("$[2]").value("Francia"));
    }

    @Test
    void getCountriesNames_whenNoCountries_returnsEmptyList() throws Exception {
        when(countryService.getAllCountriesNames()).thenReturn(List.of());

        mockMvc.perform(get("/api/countries"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void getCountriesNames_returnsSortedList() throws Exception {
        when(countryService.getAllCountriesNames())
            .thenReturn(List.of("Alemania", "Francia", "Portugal"));

        mockMvc.perform(get("/api/countries"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0]").value("Alemania"))
            .andExpect(jsonPath("$[1]").value("Francia"))
            .andExpect(jsonPath("$[2]").value("Portugal"));
    }
}