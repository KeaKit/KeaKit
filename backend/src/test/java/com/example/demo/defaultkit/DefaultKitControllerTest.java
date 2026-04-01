package com.example.demo.defaultkit;

import com.example.demo.controller.DefaultKitController;
import com.example.demo.dto.DefaultKitCreateRequest;
import com.example.demo.exception.AccessForbiddenException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.model.DefaultKit;
import com.example.demo.security.JwtUtil;
import com.example.demo.service.DefaultKitService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.data.jpa.JpaRepositoriesAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = DefaultKitController.class, excludeAutoConfiguration = {
        SecurityAutoConfiguration.class,
        SecurityFilterAutoConfiguration.class,
        JpaRepositoriesAutoConfiguration.class
})
class DefaultKitControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private DefaultKitService defaultKitService;

    @MockitoBean private com.example.demo.security.CustomUserDetailsService customUserDetailsService;
    @MockitoBean private com.example.demo.security.TokenBlacklistService tokenBlacklistService;
    @MockitoBean private JwtUtil jwtUtil;

    private DefaultKit sampleKit;

    @BeforeEach
    void setUp() {
        sampleKit = new DefaultKit("Kit Mudanza", "Kit completo para mudanzas", 59.99);
        sampleKit.setId(1L);
    }

    // ── GET /api/default-kits ──────────────────────────────────────────────

    @Test
    void getAllDefaultKits_success_returnsList() throws Exception {
        DefaultKit dk2 = new DefaultKit("Kit Cocina", "Menaje básico", 29.99);
        dk2.setId(2L);
        when(defaultKitService.getAllDefaultKits()).thenReturn(List.of(sampleKit, dk2));

        mockMvc.perform(get("/api/default-kits"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].name").value("Kit Mudanza"))
                .andExpect(jsonPath("$[1].name").value("Kit Cocina"));
    }

    @Test
    void getAllDefaultKits_empty_returnsEmptyList() throws Exception {
        when(defaultKitService.getAllDefaultKits()).thenReturn(List.of());

        mockMvc.perform(get("/api/default-kits"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    // ── GET /api/default-kits/{id} ────────────────────────────────────────

    @Test
    void getDefaultKitById_success_returnsKit() throws Exception {
        when(defaultKitService.getDefaultKitById(1L)).thenReturn(sampleKit);

        mockMvc.perform(get("/api/default-kits/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Kit Mudanza"))
                .andExpect(jsonPath("$.description").value("Kit completo para mudanzas"))
                .andExpect(jsonPath("$.basePrice").value(59.99));
    }

    @Test
    void getDefaultKitById_notFound_returns404() throws Exception {
        when(defaultKitService.getDefaultKitById(999L))
                .thenThrow(new ResourceNotFoundException("No se ha encontrado el Kit Predeterminado con ID: 999"));

        mockMvc.perform(get("/api/default-kits/999"))
                .andExpect(status().isNotFound());
    }

    // ── POST /api/default-kits ─────────────────────────────────────────────

    @Test
    void createDefaultKit_success_returnsCreated() throws Exception {
        when(defaultKitService.createDefaultKit(any(DefaultKitCreateRequest.class)))
                .thenReturn(sampleKit);

        mockMvc.perform(post("/api/default-kits")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Kit Mudanza\",\"description\":\"Kit completo para mudanzas\",\"basePrice\":59.99,\"articleIds\":[1,2]}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Kit Mudanza"))
                .andExpect(jsonPath("$.basePrice").value(59.99));
    }

    @Test
    void createDefaultKit_forbidden_returns403() throws Exception {
        when(defaultKitService.createDefaultKit(any(DefaultKitCreateRequest.class)))
                .thenThrow(new AccessForbiddenException("No tienes permiso"));

        mockMvc.perform(post("/api/default-kits")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Kit\",\"description\":\"Desc\",\"basePrice\":10}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void createDefaultKit_invalidName_returns400() throws Exception {
        when(defaultKitService.createDefaultKit(any(DefaultKitCreateRequest.class)))
                .thenThrow(new IllegalArgumentException("El nombre del kit predeterminado no puede estar vacío."));

        mockMvc.perform(post("/api/default-kits")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"\",\"description\":\"Desc\",\"basePrice\":10}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createDefaultKit_articleNotFound_returns404() throws Exception {
        when(defaultKitService.createDefaultKit(any(DefaultKitCreateRequest.class)))
                .thenThrow(new ResourceNotFoundException("Artículo no encontrado con ID: 999"));

        mockMvc.perform(post("/api/default-kits")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Kit\",\"description\":\"Desc\",\"basePrice\":10,\"articleIds\":[999]}"))
                .andExpect(status().isNotFound());
    }

    // ── PUT /api/default-kits/{id} ────────────────────────────────────────

    @Test
    void updateDefaultKit_success_returnsOk() throws Exception {
        DefaultKit updated = new DefaultKit("Kit Actualizado", "Nueva desc", 79.99);
        updated.setId(1L);
        when(defaultKitService.updateDefaultKit(eq(1L), any(DefaultKitCreateRequest.class)))
                .thenReturn(updated);

        mockMvc.perform(put("/api/default-kits/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Kit Actualizado\",\"description\":\"Nueva desc\",\"basePrice\":79.99}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Kit Actualizado"))
                .andExpect(jsonPath("$.basePrice").value(79.99));
    }

    @Test
    void updateDefaultKit_notFound_returns404() throws Exception {
        when(defaultKitService.updateDefaultKit(eq(999L), any(DefaultKitCreateRequest.class)))
                .thenThrow(new ResourceNotFoundException("No se ha encontrado el Kit Predeterminado con ID: 999"));

        mockMvc.perform(put("/api/default-kits/999")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Kit\"}"))
                .andExpect(status().isNotFound());
    }

    @Test
    void updateDefaultKit_forbidden_returns403() throws Exception {
        when(defaultKitService.updateDefaultKit(eq(1L), any(DefaultKitCreateRequest.class)))
                .thenThrow(new AccessForbiddenException("No tienes permiso"));

        mockMvc.perform(put("/api/default-kits/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Kit\"}"))
                .andExpect(status().isForbidden());
    }

    // ── DELETE /api/default-kits/{id} ──────────────────────────────────────

    @Test
    void deleteDefaultKit_success_returnsNoContent() throws Exception {
        doNothing().when(defaultKitService).deleteDefaultKit(1L);

        mockMvc.perform(delete("/api/default-kits/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    void deleteDefaultKit_notFound_returns404() throws Exception {
        doThrow(new ResourceNotFoundException("No se ha encontrado el Kit Predeterminado con ID: 999"))
                .when(defaultKitService).deleteDefaultKit(999L);

        mockMvc.perform(delete("/api/default-kits/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteDefaultKit_forbidden_returns403() throws Exception {
        doThrow(new AccessForbiddenException("No tienes permiso"))
                .when(defaultKitService).deleteDefaultKit(1L);

        mockMvc.perform(delete("/api/default-kits/1"))
                .andExpect(status().isForbidden());
    }
}
