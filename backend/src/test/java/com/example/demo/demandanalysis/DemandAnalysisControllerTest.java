package com.example.demo.demandanalysis;

import com.example.demo.controller.DemandAnalysisController;
import com.example.demo.dto.DemandAnalysisDTO;
import com.example.demo.security.JwtUtil;
import com.example.demo.security.CustomUserDetailsService;
import com.example.demo.security.TokenBlacklistService;
import com.example.demo.service.DemandAnalysisService;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = DemandAnalysisController.class, excludeAutoConfiguration = {
        SecurityAutoConfiguration.class,
        SecurityFilterAutoConfiguration.class
})
class DemandAnalysisControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private DemandAnalysisService demandAnalysisService;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @MockitoBean
    private TokenBlacklistService tokenBlacklistService;

    @MockitoBean
    private JwtUtil jwtUtil;

    @Test
    void getTopDemandedItems_returnsOk() throws Exception {
        List<DemandAnalysisDTO> items = List.of(
                new DemandAnalysisDTO(1L, "Laptop", "Electrónica", "http://img.com/1.jpg", 5L, 8L),
                new DemandAnalysisDTO(2L, "Bicicleta", "Deportes", "http://img.com/2.jpg", 3L, 4L)
        );
        when(demandAnalysisService.getTopDemandedItems(any())).thenReturn(items);

        mockMvc.perform(get("/api/demand-analysis/top"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].itemId").value(1))
                .andExpect(jsonPath("$[0].title").value("Laptop"))
                .andExpect(jsonPath("$[0].categoryName").value("Electrónica"))
                .andExpect(jsonPath("$[0].totalTimesRented").value(5))
                .andExpect(jsonPath("$[0].totalUnitsRented").value(8))
                .andExpect(jsonPath("$[1].itemId").value(2))
                .andExpect(jsonPath("$[1].title").value("Bicicleta"));
    }

    @Test
    void getTopDemandedItems_withLimit_returnsOk() throws Exception {
        List<DemandAnalysisDTO> items = List.of(
                new DemandAnalysisDTO(1L, "Laptop", "Electrónica", "http://img.com/1.jpg", 5L, 8L)
        );
        when(demandAnalysisService.getTopDemandedItems(eq(1))).thenReturn(items);

        mockMvc.perform(get("/api/demand-analysis/top").param("limit", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].title").value("Laptop"));
    }

    @Test
    void getTopDemandedItems_emptyResult_returnsOk() throws Exception {
        when(demandAnalysisService.getTopDemandedItems(any())).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/demand-analysis/top"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void getTopDemandedItems_serviceThrows_returnsInternalServerError() throws Exception {
        when(demandAnalysisService.getTopDemandedItems(any()))
                .thenThrow(new RuntimeException("DB error"));

        mockMvc.perform(get("/api/demand-analysis/top"))
                .andExpect(status().isInternalServerError())
                .andExpect(content().string("DB error"));
    }

    @Test
    void getTopDemandedItemsByCategory_returnsOk() throws Exception {
        List<DemandAnalysisDTO> items = List.of(
                new DemandAnalysisDTO(1L, "Laptop", "Electrónica", "http://img.com/1.jpg", 5L, 8L)
        );
        when(demandAnalysisService.getTopDemandedItemsByCategory(eq("Electrónica"), any()))
                .thenReturn(items);

        mockMvc.perform(get("/api/demand-analysis/top/category")
                        .param("categoryName", "Electrónica"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].categoryName").value("Electrónica"));
    }

    @Test
    void getTopDemandedItemsByCategory_withLimit_returnsOk() throws Exception {
        List<DemandAnalysisDTO> items = List.of(
                new DemandAnalysisDTO(1L, "Laptop", "Electrónica", "http://img.com/1.jpg", 5L, 8L)
        );
        when(demandAnalysisService.getTopDemandedItemsByCategory(eq("Electrónica"), eq(5)))
                .thenReturn(items);

        mockMvc.perform(get("/api/demand-analysis/top/category")
                        .param("categoryName", "Electrónica")
                        .param("limit", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void getTopDemandedItemsByCategory_emptyResult_returnsOk() throws Exception {
        when(demandAnalysisService.getTopDemandedItemsByCategory(eq("NoExiste"), any()))
                .thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/demand-analysis/top/category")
                        .param("categoryName", "NoExiste"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void getTopDemandedItemsByCategory_serviceThrows_returnsInternalServerError() throws Exception {
        when(demandAnalysisService.getTopDemandedItemsByCategory(any(), any()))
                .thenThrow(new RuntimeException("DB error"));

        mockMvc.perform(get("/api/demand-analysis/top/category")
                        .param("categoryName", "Electrónica"))
                .andExpect(status().isInternalServerError())
                .andExpect(content().string("DB error"));
    }

    @Test
    void getTopDemandedItemsByCategory_missingParam_returnsError() throws Exception {
        mockMvc.perform(get("/api/demand-analysis/top/category"))
                .andExpect(status().isInternalServerError());
    }
}
