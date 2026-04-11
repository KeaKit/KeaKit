package com.example.demo.demandanalysis;

import com.example.demo.dto.DemandAnalysisDTO;
import com.example.demo.repository.ItemMementoRepository;
import com.example.demo.service.DemandAnalysisService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DemandAnalysisServiceTest {

    @Mock
    private ItemMementoRepository itemMementoRepository;

    @InjectMocks
    private DemandAnalysisService demandAnalysisService;

    private List<Object[]> sampleResults;

    @BeforeEach
    void setUp() {
        sampleResults = List.of(
                new Object[]{1L, "Laptop", "Electrónica", "http://img.com/1.jpg", 5L, 8L},
                new Object[]{2L, "Bicicleta", "Deportes", "http://img.com/2.jpg", 3L, 4L}
        );
    }

    @Test
    void getTopDemandedItems_defaultLimit() {
        when(itemMementoRepository.findTopDemandedItems(any())).thenReturn(sampleResults);

        List<DemandAnalysisDTO> result = demandAnalysisService.getTopDemandedItems(null);

        assertEquals(2, result.size());
        assertEquals(1L, result.get(0).getItemId());
        assertEquals("Laptop", result.get(0).getTitle());
        assertEquals("Electrónica", result.get(0).getCategoryName());
        assertEquals("http://img.com/1.jpg", result.get(0).getImageUrl());
        assertEquals(5L, result.get(0).getTotalTimesRented());
        assertEquals(8L, result.get(0).getTotalUnitsRented());
        assertEquals(2L, result.get(1).getItemId());
        assertEquals("Bicicleta", result.get(1).getTitle());

        verify(itemMementoRepository).findTopDemandedItems(PageRequest.of(0, 10));
    }

    @Test
    void getTopDemandedItems_customLimit() {
        when(itemMementoRepository.findTopDemandedItems(any())).thenReturn(sampleResults.subList(0, 1));

        List<DemandAnalysisDTO> result = demandAnalysisService.getTopDemandedItems(1);

        assertEquals(1, result.size());
        assertEquals("Laptop", result.get(0).getTitle());

        verify(itemMementoRepository).findTopDemandedItems(PageRequest.of(0, 1));
    }

    @Test
    void getTopDemandedItems_zeroLimit_usesDefault() {
        when(itemMementoRepository.findTopDemandedItems(any())).thenReturn(sampleResults);

        demandAnalysisService.getTopDemandedItems(0);

        verify(itemMementoRepository).findTopDemandedItems(PageRequest.of(0, 10));
    }

    @Test
    void getTopDemandedItems_negativeLimit_usesDefault() {
        when(itemMementoRepository.findTopDemandedItems(any())).thenReturn(sampleResults);

        demandAnalysisService.getTopDemandedItems(-5);

        verify(itemMementoRepository).findTopDemandedItems(PageRequest.of(0, 10));
    }

    @Test
    void getTopDemandedItems_emptyResult() {
        when(itemMementoRepository.findTopDemandedItems(any())).thenReturn(Collections.emptyList());

        List<DemandAnalysisDTO> result = demandAnalysisService.getTopDemandedItems(null);

        assertTrue(result.isEmpty());
    }

    @Test
    void getTopDemandedItemsByCategory_returnsFilteredResults() {
        List<Object[]> categoryResults = List.<Object[]>of(
                new Object[]{1L, "Laptop", "Electrónica", "http://img.com/1.jpg", 5L, 8L}
        );
        when(itemMementoRepository.findTopDemandedItemsByCategory(eq("Electrónica"), any()))
                .thenReturn(categoryResults);

        List<DemandAnalysisDTO> result = demandAnalysisService.getTopDemandedItemsByCategory("Electrónica", null);

        assertEquals(1, result.size());
        assertEquals("Electrónica", result.get(0).getCategoryName());

        verify(itemMementoRepository).findTopDemandedItemsByCategory(eq("Electrónica"), eq(PageRequest.of(0, 10)));
    }

    @Test
    void getTopDemandedItemsByCategory_withCustomLimit() {
        when(itemMementoRepository.findTopDemandedItemsByCategory(eq("Deportes"), any()))
                .thenReturn(Collections.emptyList());

        List<DemandAnalysisDTO> result = demandAnalysisService.getTopDemandedItemsByCategory("Deportes", 5);

        assertTrue(result.isEmpty());
        verify(itemMementoRepository).findTopDemandedItemsByCategory(eq("Deportes"), eq(PageRequest.of(0, 5)));
    }

    @Test
    void getTopDemandedItemsByCategory_emptyResult() {
        when(itemMementoRepository.findTopDemandedItemsByCategory(eq("NoExiste"), any()))
                .thenReturn(Collections.emptyList());

        List<DemandAnalysisDTO> result = demandAnalysisService.getTopDemandedItemsByCategory("NoExiste", null);

        assertTrue(result.isEmpty());
    }
}
