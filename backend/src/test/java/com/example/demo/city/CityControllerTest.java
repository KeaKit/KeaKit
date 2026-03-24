package com.example.demo.city;

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

import com.example.demo.controller.CityController;
import com.example.demo.security.CustomUserDetailsService;
import com.example.demo.security.JwtUtil;
import com.example.demo.security.TokenBlacklistService;
import com.example.demo.service.CityService;

@WebMvcTest(
    controllers = CityController.class,
    excludeAutoConfiguration = {
        SecurityAutoConfiguration.class,
        SecurityFilterAutoConfiguration.class
    }
)
public class CityControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CityService cityService;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @MockitoBean
    private TokenBlacklistService tokenBlacklistService;

    @MockitoBean
    private JwtUtil jwtUtil;

    @Test
    void getAllCityNamesByCountryName_success_returnsListOfCities() throws Exception {
        when(cityService.getAllCityNamesByCountryName("Spain"))
            .thenReturn(List.of("Barcelona", "Madrid", "Seville"));

        mockMvc.perform(get("/api/cities").param("country", "Spain"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(3))
            .andExpect(jsonPath("$[0]").value("Barcelona"))
            .andExpect(jsonPath("$[1]").value("Madrid"))
            .andExpect(jsonPath("$[2]").value("Seville"));
    }

    @Test
    void getAllCityNamesByCountryName_noCitiesFound_returnsNotFound() throws Exception {
        when(cityService.getAllCityNamesByCountryName("Atlantis"))
            .thenReturn(List.of());

        mockMvc.perform(get("/api/cities").param("country", "Atlantis"))
            .andExpect(status().isNotFound());
    }

    @Test
    void getAllCityNamesByCountryName_returnsSortedList() throws Exception {
        when(cityService.getAllCityNamesByCountryName("France"))
            .thenReturn(List.of("Burdeos", "Lyon", "Paris"));

        mockMvc.perform(get("/api/cities").param("country", "France"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0]").value("Burdeos"))
            .andExpect(jsonPath("$[1]").value("Lyon"))
            .andExpect(jsonPath("$[2]").value("Paris"));
    }
}