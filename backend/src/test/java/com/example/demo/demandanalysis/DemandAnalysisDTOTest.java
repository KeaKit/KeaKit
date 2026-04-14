package com.example.demo.demandanalysis;

import org.junit.jupiter.api.Test;

import com.example.demo.dto.DemandAnalysisDTO;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class DemandAnalysisDTOTest {

    // Prueba el constructor vacío y todos los setters/getters
    @Test
    void testNoArgsConstructorAndSetters() {
        DemandAnalysisDTO dto = new DemandAnalysisDTO();
        
        // Verificamos que se inicializa vacío
        assertNull(dto.getItemId());
        
        dto.setItemId(99L);
        dto.setTitle("Cámara");
        dto.setCategoryName("Fotografía");
        dto.setImageUrl("http://img.com/cam.jpg");
        dto.setTotalTimesRented(10L);
        dto.setTotalUnitsRented(15L);

        assertEquals(99L, dto.getItemId());
        assertEquals("Cámara", dto.getTitle());
        assertEquals("Fotografía", dto.getCategoryName());
        assertEquals("http://img.com/cam.jpg", dto.getImageUrl());
        assertEquals(10L, dto.getTotalTimesRented());
        assertEquals(15L, dto.getTotalUnitsRented());
    }

    // Prueba el constructor con todos los argumentos (por si acaso el service test no lo cubre al 100%)
    @Test
    void testAllArgsConstructor() {
        DemandAnalysisDTO dto = new DemandAnalysisDTO(1L, "Drone", "Electrónica", "url", 5L, 5L);
        
        assertEquals(1L, dto.getItemId());
        assertEquals("Drone", dto.getTitle());
        assertEquals("Electrónica", dto.getCategoryName());
        assertEquals("url", dto.getImageUrl());
        assertEquals(5L, dto.getTotalTimesRented());
        assertEquals(5L, dto.getTotalUnitsRented());
    }
}
