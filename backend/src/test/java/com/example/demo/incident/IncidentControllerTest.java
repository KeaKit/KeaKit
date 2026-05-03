package com.example.demo.incident;

import com.example.demo.controller.IncidentController;
import com.example.demo.dto.IncidentRequestDTO;
import com.example.demo.model.Incident;
import com.example.demo.model.IncidentStatus;
import com.example.demo.model.IncidentType;
import com.example.demo.security.JwtUtil;
import com.example.demo.service.IncidentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = IncidentController.class, excludeAutoConfiguration = {
        SecurityAutoConfiguration.class,
        SecurityFilterAutoConfiguration.class
})
class IncidentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private IncidentService incidentService;

    @MockitoBean
    private com.example.demo.security.CustomUserDetailsService customUserDetailsService;

    @MockitoBean
    private com.example.demo.security.TokenBlacklistService tokenBlacklistService;

    @MockitoBean
    private JwtUtil jwtUtil;

    private Incident sampleIncident;

    @BeforeEach
    void setUp() {
        sampleIncident = new Incident();
        sampleIncident.setId(1L);
        sampleIncident.setTitle("App crashing");
        sampleIncident.setDescription("The app closes when I tap on profile");
        sampleIncident.setType(IncidentType.GENERAL);
        sampleIncident.setStatus(IncidentStatus.OPEN);
    }

    @Test
    void createIncident_success() throws Exception {
        when(incidentService.createIncident(any(IncidentRequestDTO.class))).thenReturn(sampleIncident);

        mockMvc.perform(post("/api/incidents")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"App crashing\",\"description\":\"The app closes when I tap on profile\",\"type\":\"GENERAL\"}"))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.title").value("App crashing"));
    }

    @Test
    void createIncident_failure_returnsInternalServerError() throws Exception {
        when(incidentService.createIncident(any(IncidentRequestDTO.class))).thenThrow(new RuntimeException("Database error"));

        mockMvc.perform(post("/api/incidents")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"Test\"}"))
            .andExpect(status().isInternalServerError())
            .andExpect(content().string("Database error"));
    }

    @Test
    void getAllIncidents_success() throws Exception {
        Incident secondIncident = new Incident();
        secondIncident.setId(2L);
        secondIncident.setTitle("Broken item");

        when(incidentService.getAllIncidents()).thenReturn(List.of(sampleIncident, secondIncident));

        mockMvc.perform(get("/api/incidents"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(2))
            .andExpect(jsonPath("$[0].title").value("App crashing"))
            .andExpect(jsonPath("$[1].title").value("Broken item"));
    }

    @Test
    void getIncidentById_success() throws Exception {
        when(incidentService.getIncidentById(1L)).thenReturn(sampleIncident);

        mockMvc.perform(get("/api/incidents/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.title").value("App crashing"));
    }

    @Test
    void getIncidentById_notFound() throws Exception {
        when(incidentService.getIncidentById(99L)).thenThrow(new RuntimeException("Incident not found"));

        mockMvc.perform(get("/api/incidents/99"))
            .andExpect(status().isNotFound())
            .andExpect(content().string("Incident not found"));
    }

    @Test
    void updateIncident_success() throws Exception {
        Incident updatedIncident = new Incident();
        updatedIncident.setId(1L);
        updatedIncident.setTitle("Resolved title");
        updatedIncident.setStatus(IncidentStatus.RESOLVED);

        when(incidentService.updateIncident(eq(1L), any(Incident.class))).thenReturn(updatedIncident);

        mockMvc.perform(put("/api/incidents/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"Resolved title\",\"status\":\"RESOLVED\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.title").value("Resolved title"))
            .andExpect(jsonPath("$.status").value("RESOLVED"));
    }

    @Test
    void deleteIncident_success() throws Exception {
        mockMvc.perform(delete("/api/incidents/1"))
            .andExpect(status().isOk())
            .andExpect(content().string("Incident deleted successfully"));
    }

    @Test
    void deleteIncident_notFound() throws Exception {
        doThrow(new RuntimeException("Incident not found")).when(incidentService).deleteIncident(99L);

        mockMvc.perform(delete("/api/incidents/99"))
            .andExpect(status().isNotFound())
            .andExpect(content().string("Incident not found"));
    }
}