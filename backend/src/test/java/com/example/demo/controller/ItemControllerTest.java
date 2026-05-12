package com.example.demo.controller;

import com.example.demo.dto.ItemCatalogResponse;
import com.example.demo.dto.ItemFilterResponseDTO;
import com.example.demo.security.CustomUserDetailsService;
import com.example.demo.security.JwtUtil;
import com.example.demo.security.TokenBlacklistService;
import com.example.demo.service.AuthService;
import com.example.demo.service.ItemService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = ItemController.class, excludeAutoConfiguration = {
        SecurityAutoConfiguration.class,
        SecurityFilterAutoConfiguration.class
})
class ItemControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ItemService itemService;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @MockitoBean
    private TokenBlacklistService tokenBlacklistService;

    @MockitoBean
    private JwtUtil jwtUtil;

    @Test
    void filterItemsForKit_withConditionAndPriceRange_returnsOk() throws Exception {
        ItemCatalogResponse item = new ItemCatalogResponse();
        item.setId(1L);
        item.setTitle("Taladro");
        item.setPricePerMonth(25.0);
        item.setStatus("AVAILABLE");
        item.setCondition("USED");
        item.setItemType("ARTICLE");

        ItemFilterResponseDTO response = new ItemFilterResponseDTO(List.of(item), 0, 10, 1, 1, false, false);

        when(itemService.filterItemsForKit(eq(20.0), eq(50.0), isNull(), isNull(), isNull(), eq("USED"), eq(0), eq(10), isNull(), isNull()))
                .thenReturn(response);

        mockMvc.perform(post("/api/items/filter-for-kit")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "minPrice": 20.0,
                                  "maxPrice": 50.0,
                                  "condition": "USED",
                                  "page": 0,
                                  "size": 10
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.content[0].title").value("Taladro"))
                .andExpect(jsonPath("$.content[0].condition").value("USED"))
                .andExpect(jsonPath("$.content[0].status").value("AVAILABLE"));
    }

    @Test
    void filterItemsForKit_withRequestedDates_returnsAvailabilityFromService() throws Exception {
        LocalDate startDate = LocalDate.of(2026, 5, 10);
        LocalDate endDate = LocalDate.of(2026, 5, 12);

        ItemCatalogResponse item = new ItemCatalogResponse();
        item.setId(2L);
        item.setTitle("Taladro ya reservado");
        item.setPricePerMonth(25.0);
        item.setStatus("RENTED");
        item.setItemType("ARTICLE");
        item.setTotalUnits(0);
        item.setAvailableFrom(LocalDate.of(2026, 5, 1));
        item.setAvailableUntil(LocalDate.of(2026, 5, 31));

        ItemFilterResponseDTO response = new ItemFilterResponseDTO(List.of(item), 0, 100, 1, 1, false, false);

        when(itemService.filterItemsForKit(isNull(), isNull(), isNull(), eq("Sevilla"), isNull(), isNull(), eq(0), eq(100), eq(startDate), eq(endDate)))
                .thenReturn(response);

        mockMvc.perform(post("/api/items/filter-for-kit")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "city": "Sevilla",
                                  "page": 0,
                                  "size": 100,
                                  "startDate": "2026-05-10",
                                  "endDate": "2026-05-12"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.content[0].id").value(2))
                .andExpect(jsonPath("$.content[0].status").value("RENTED"))
                .andExpect(jsonPath("$.content[0].totalUnits").value(0))
                .andExpect(jsonPath("$.content[0].availableFrom").value("2026-05-01"))
                .andExpect(jsonPath("$.content[0].availableUntil").value("2026-05-31"));
    }

    @Test
    void filterItemsForKit_whenMinPriceIsGreaterThanMaxPrice_returnsBadRequest() throws Exception {
        when(itemService.filterItemsForKit(eq(60.0), eq(20.0), isNull(), isNull(), isNull(), isNull(), eq(0), eq(10), isNull(), isNull()))
                .thenThrow(new IllegalArgumentException("minPrice cannot be greater than maxPrice"));

        mockMvc.perform(post("/api/items/filter-for-kit")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "minPrice": 60.0,
                                  "maxPrice": 20.0,
                                  "page": 0,
                                  "size": 10
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("minPrice cannot be greater than maxPrice"));
    }

    @Test
    void filterItemsForKit_whenConditionIsInvalid_returnsBadRequest() throws Exception {
        when(itemService.filterItemsForKit(eq(20.0), eq(50.0), isNull(), isNull(), isNull(), eq("BROKEN"), eq(0), eq(10), isNull(), isNull()))
                .thenThrow(new IllegalArgumentException("condition must be one of: NEW, LIGHTLY_USED, USED, WORN"));

        mockMvc.perform(post("/api/items/filter-for-kit")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "minPrice": 20.0,
                                  "maxPrice": 50.0,
                                  "condition": "BROKEN",
                                  "page": 0,
                                  "size": 10
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("condition must be one of: NEW, LIGHTLY_USED, USED, WORN"));
    }
}
