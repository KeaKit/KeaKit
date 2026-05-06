package com.example.demo.incident;

import com.example.demo.controller.IncidentController;
import com.example.demo.model.Incident;
import com.example.demo.dto.IncidentRequestDTO;
import com.example.demo.model.IncidentComment;
import com.example.demo.model.IncidentStatus;
import com.example.demo.model.IncidentType;
import com.example.demo.model.User;
import com.example.demo.security.JwtUtil;
import com.example.demo.service.IncidentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Extended controller tests for CU-GENERAL-04 endpoints:
 * resolve, comments, user/received incidents, access denied, validation errors.
 */
@WebMvcTest(controllers = IncidentController.class, excludeAutoConfiguration = {
        SecurityAutoConfiguration.class,
        SecurityFilterAutoConfiguration.class
})
class IncidentControllerExtendedTest {

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
        sampleIncident.setTitle("Test incident");
        sampleIncident.setDescription("Test description");
        sampleIncident.setType(IncidentType.GENERAL);
        sampleIncident.setStatus(IncidentStatus.OPEN);
    }

    // ═══════════════ POST /api/incidents — Validation (RN-INC-01, RN-INC-02) ═══════════════

    @Test
    void createIncident_validationError_returnsBadRequest() throws Exception {
        when(incidentService.createIncident(any(IncidentRequestDTO.class)))
                .thenThrow(new IllegalArgumentException("El título de la incidencia es obligatorio."));

        mockMvc.perform(post("/api/incidents")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"description\":\"Only desc\",\"type\":\"GENERAL\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("El título de la incidencia es obligatorio."));
    }

    @Test
    void createIncident_blankDescription_returnsBadRequest() throws Exception {
        when(incidentService.createIncident(any(IncidentRequestDTO.class)))
                .thenThrow(new IllegalArgumentException("La descripción de la incidencia es obligatoria."));

        mockMvc.perform(post("/api/incidents")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Title\",\"type\":\"GENERAL\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("La descripción de la incidencia es obligatoria."));
    }

    @Test
    void createIncident_damagedItemWithoutItem_returnsBadRequest() throws Exception {
        when(incidentService.createIncident(any(IncidentRequestDTO.class)))
                .thenThrow(new IllegalArgumentException("Para incidencias de tipo objeto dañado, el ítem es obligatorio."));

        mockMvc.perform(post("/api/incidents")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Damaged\",\"description\":\"Desc\",\"type\":\"DAMAGED_ITEM\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Para incidencias de tipo objeto dañado, el ítem es obligatorio."));
    }

    // ═══════════════ PUT /api/incidents/{id}/resolve ═══════════════

    @Test
    void resolveIncident_success() throws Exception {
        Incident resolved = new Incident();
        resolved.setId(1L);
        resolved.setTitle("Test");
        resolved.setStatus(IncidentStatus.RESOLVED);

        when(incidentService.resolveIncident(1L)).thenReturn(resolved);

        mockMvc.perform(put("/api/incidents/1/resolve"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("RESOLVED"));
    }

    @Test
    void resolveIncident_notFound_returns404() throws Exception {
        when(incidentService.resolveIncident(99L))
                .thenThrow(new RuntimeException("Incident not found"));

        mockMvc.perform(put("/api/incidents/99/resolve"))
                .andExpect(status().isNotFound())
                .andExpect(content().string("Incident not found"));
    }

    @Test
    void resolveIncident_accessDenied_returns403() throws Exception {
        when(incidentService.resolveIncident(1L))
                .thenThrow(new AccessDeniedException("No tienes permiso"));

        mockMvc.perform(put("/api/incidents/1/resolve"))
                .andExpect(status().isForbidden())
                .andExpect(content().string("No tienes permiso"));
    }

    // ═══════════════ GET /api/incidents/user/{userId} ═══════════════

    @Test
    void getIncidentsByUser_success() throws Exception {
        when(incidentService.getIncidentsByUserId(42L)).thenReturn(List.of(sampleIncident));

        mockMvc.perform(get("/api/incidents/user/42"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].title").value("Test incident"));
    }

    @Test
    void getIncidentsByUser_accessDenied_returns403() throws Exception {
        when(incidentService.getIncidentsByUserId(42L))
                .thenThrow(new AccessDeniedException("No tienes permiso"));

        mockMvc.perform(get("/api/incidents/user/42"))
                .andExpect(status().isForbidden())
                .andExpect(content().string("No tienes permiso"));
    }

    @Test
    void getIncidentsByUser_empty_returnsOk() throws Exception {
        when(incidentService.getIncidentsByUserId(42L)).thenReturn(List.of());

        mockMvc.perform(get("/api/incidents/user/42"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    // ═══════════════ GET /api/incidents/received/{ownerId} ═══════════════

    @Test
    void getReceivedIncidents_success() throws Exception {
        Incident damaged = new Incident();
        damaged.setId(2L);
        damaged.setTitle("Damaged report");
        damaged.setType(IncidentType.DAMAGED_ITEM);
        damaged.setStatus(IncidentStatus.OPEN);

        when(incidentService.getReceivedIncidentsByOwnerId(10L)).thenReturn(List.of(damaged));

        mockMvc.perform(get("/api/incidents/received/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].title").value("Damaged report"));
    }

    @Test
    void getReceivedIncidents_accessDenied_returns403() throws Exception {
        when(incidentService.getReceivedIncidentsByOwnerId(10L))
                .thenThrow(new AccessDeniedException("No tienes permiso"));

        mockMvc.perform(get("/api/incidents/received/10"))
                .andExpect(status().isForbidden())
                .andExpect(content().string("No tienes permiso"));
    }

    // ═══════════════ GET /api/incidents — Admin only ═══════════════

    @Test
    void getAllIncidents_accessDenied_returns403() throws Exception {
        when(incidentService.getAllIncidents())
                .thenThrow(new AccessDeniedException("No tienes permiso para listar las incidencias."));

        mockMvc.perform(get("/api/incidents"))
                .andExpect(status().isForbidden())
                .andExpect(content().string("No tienes permiso para listar las incidencias."));
    }

    // ═══════════════ GET /api/incidents/{id} — Access control ═══════════════

    @Test
    void getIncidentById_accessDenied_returns403() throws Exception {
        when(incidentService.getIncidentById(1L))
                .thenThrow(new AccessDeniedException("No tienes permiso para ver esta incidencia."));

        mockMvc.perform(get("/api/incidents/1"))
                .andExpect(status().isForbidden())
                .andExpect(content().string("No tienes permiso para ver esta incidencia."));
    }

    // ═══════════════ PUT /api/incidents/{id} — Access control ═══════════════

    @Test
    void updateIncident_accessDenied_returns403() throws Exception {
        when(incidentService.updateIncident(eq(1L), any(Incident.class)))
                .thenThrow(new AccessDeniedException("No tienes permiso para modificar esta incidencia."));

        mockMvc.perform(put("/api/incidents/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Updated\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void updateIncident_validationError_returnsBadRequest() throws Exception {
        when(incidentService.updateIncident(eq(1L), any(Incident.class)))
                .thenThrow(new IllegalArgumentException("El título de la incidencia es obligatorio."));

        mockMvc.perform(put("/api/incidents/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("El título de la incidencia es obligatorio."));
    }

    // ═══════════════ DELETE /api/incidents/{id} — RN-INC-08 ═══════════════

    @Test
    void deleteIncident_resolved_returnsError() throws Exception {
        doThrow(new RuntimeException("No se puede eliminar una incidencia resuelta"))
                .when(incidentService).deleteIncident(1L);

        mockMvc.perform(delete("/api/incidents/1"))
                .andExpect(status().isNotFound())
                .andExpect(content().string("No se puede eliminar una incidencia resuelta"));
    }

    @Test
    void deleteIncident_accessDenied_returns403() throws Exception {
        doThrow(new AccessDeniedException("No tienes permiso"))
                .when(incidentService).deleteIncident(1L);

        mockMvc.perform(delete("/api/incidents/1"))
                .andExpect(status().isForbidden())
                .andExpect(content().string("No tienes permiso"));
    }

    // ═══════════════ GET /api/incidents/{incidentId}/comments ═══════════════

    @Test
    void getComments_success() throws Exception {
        IncidentComment comment = new IncidentComment();
        comment.setId(1L);
        comment.setText("A comment");
        comment.setCreatedAt(LocalDateTime.of(2026, 3, 15, 10, 0));

        when(incidentService.getCommentsByIncidentId(1L)).thenReturn(List.of(comment));

        mockMvc.perform(get("/api/incidents/1/comments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].text").value("A comment"));
    }

    @Test
    void getComments_accessDenied_returns403() throws Exception {
        when(incidentService.getCommentsByIncidentId(1L))
                .thenThrow(new AccessDeniedException("No tienes permiso"));

        mockMvc.perform(get("/api/incidents/1/comments"))
                .andExpect(status().isForbidden())
                .andExpect(content().string("No tienes permiso"));
    }

    @Test
    void getComments_empty_returnsOk() throws Exception {
        when(incidentService.getCommentsByIncidentId(1L)).thenReturn(List.of());

        mockMvc.perform(get("/api/incidents/1/comments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    // ═══════════════ POST /api/incidents/{incidentId}/comments ═══════════════

    @Test
    void addComment_success_returns201() throws Exception {
        IncidentComment saved = new IncidentComment();
        saved.setId(10L);
        saved.setText("New comment");
        saved.setCreatedAt(LocalDateTime.now());

        when(incidentService.addComment(eq(1L), any(IncidentComment.class))).thenReturn(saved);

        mockMvc.perform(post("/api/incidents/1/comments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"text\":\"New comment\",\"author\":{\"id\":1}}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.text").value("New comment"));
    }

    @Test
    void addComment_resolvedIncident_returnsError() throws Exception {
        when(incidentService.addComment(eq(1L), any(IncidentComment.class)))
                .thenThrow(new RuntimeException("No se pueden añadir comentarios a una incidencia resuelta"));

        mockMvc.perform(post("/api/incidents/1/comments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"text\":\"Test\",\"author\":{\"id\":1}}"))
                .andExpect(status().isInternalServerError())
                .andExpect(content().string("No se pueden añadir comentarios a una incidencia resuelta"));
    }

    @Test
    void addComment_accessDenied_returns403() throws Exception {
        when(incidentService.addComment(eq(1L), any(IncidentComment.class)))
                .thenThrow(new AccessDeniedException("No tienes permiso"));

        mockMvc.perform(post("/api/incidents/1/comments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"text\":\"Test\",\"author\":{\"id\":99}}"))
                .andExpect(status().isForbidden())
                .andExpect(content().string("No tienes permiso"));
    }
}
