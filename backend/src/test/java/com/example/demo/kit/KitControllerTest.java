package com.example.demo.kit;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.example.demo.controller.KitController;
import com.example.demo.dto.KitResponse;
import com.example.demo.model.Kit;
import com.example.demo.model.KitStatus;
import com.example.demo.service.KitService;
import com.example.demo.security.JwtUtil;
import com.example.demo.security.CustomUserDetailsService;
import com.example.demo.security.TokenBlacklistService;
import com.example.demo.repository.UserRepository;

@WebMvcTest(
    controllers = KitController.class,
    excludeAutoConfiguration = {
        SecurityAutoConfiguration.class,
        SecurityFilterAutoConfiguration.class
    }
)
public class KitControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private KitService kitService;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @MockitoBean
    private TokenBlacklistService tokenBlacklistService;

    @MockitoBean
    private JwtUtil jwtUtil;

    // ==========================================
    // TESTS PARA LOS ESTADOS DE LOS KITS Y ALGUNAS VALIDACIONES
    // ==========================================

    @Test
    void createKit_withStatus_returnsCreated() throws Exception {
        Kit kit = new Kit();
        when(kitService.create(any())).thenReturn(kit);

        mockMvc.perform(post("/api/kits/create")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Kit Test\",\"country\":\"ES\",\"city\":\"MAD\",\"startDate\":\"2026-06-01\",\"endDate\":\"2026-06-10\",\"status\":\"DRAFT\",\"deliveryMethod\":\"COURIER\",\"tenantId\":1}"))
            .andExpect(status().isCreated());
    }

    @Test
    void createKit_error_returnsBadRequest() throws Exception {
        when(kitService.create(any())).thenThrow(new RuntimeException("Error"));

        mockMvc.perform(post("/api/kits/create")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Kit Test\"}"))
            .andExpect(status().isBadRequest());
    }

    @Test
    void createKit_invalidRequest_returnsBadRequest() throws Exception {
        // Falta name y tenantId (ambos NotBlank/NotNull)
        String invalidJson = """
            {
            "country": "ES",
            "city": "MAD",
            "startDate": "2026-06-01",
            "endDate": "2026-06-10",
            "deliveryMethod": "COURIER"
            }
            """;

        mockMvc.perform(post("/api/kits/create")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidJson))
            .andExpect(status().isBadRequest());
    }

    @Test
    void getKit_success_returnsStatus() throws Exception {
        Kit kit = new Kit();
        kit.setStatus(KitStatus.FINISHED);

        when(kitService.findById(1L)).thenReturn(new KitResponse(kit));

        mockMvc.perform(get("/api/kits/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("FINISHED"));
    }

    @Test
    void updateKit_changeStatus_returnsOk() throws Exception {
        Kit kit = new Kit();
        kit.setStatus(KitStatus.ACTIVE);

        when(kitService.update(eq(1L), any())).thenReturn(new KitResponse(kit));

        mockMvc.perform(put("/api/kits/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"status\":\"ACTIVE\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    @Test
    void getMyKitTracking_success() throws Exception {
        Kit kit = new Kit();
        kit.setStatus(KitStatus.ACTIVE);

        when(kitService.findTrackingKitById(1L, 10L)).thenReturn(new KitResponse(kit));

        mockMvc.perform(get("/api/kits/my-kits/10/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    @Test
    void getMyKitTracking_wrongTenant_returnsNotFound() throws Exception {
        when(kitService.findTrackingKitById(1L, 10L))
            .thenThrow(new RuntimeException("Kit does not belong to the specified tenant"));

        mockMvc.perform(get("/api/kits/my-kits/10/1"))
            .andExpect(status().isNotFound());
    }

    @Test
    void confirmKitStatus_success_returnsOk() throws Exception {
        mockMvc.perform(patch("/api/kits/confirm/1"))
            .andExpect(status().isOk())
            .andExpect(content().string("Kit status confirmed succesfully"));
    }

    @Test
    void confirmKitStatus_error_returnsNotFound() throws Exception {
        doThrow(new RuntimeException("Kit not found"))
            .when(kitService)
            .confirmKitStatus(1L);

        mockMvc.perform(patch("/api/kits/confirm/1"))
            .andExpect(status().isNotFound())
            .andExpect(content().string("Kit not found"));
    }

    // ==========================================
    // TESTS PARA HISTÓRICO DE KITS
    // ==========================================

    @Test
    void getMyHistory_success_returnsPageOfKits() throws Exception {
        int page = 0;
        int size = 10;
        
        Page<KitResponse> mockPage = Page.empty();
        when(kitService.findHistoryForAuthenticatedTenant(page, size)).thenReturn(mockPage);

        mockMvc.perform(get("/api/kits/my-history")
                .param("page", String.valueOf(page))
                .param("size", String.valueOf(size)))
            .andExpect(status().isOk());
    }

    @Test
    void getMyHistory_withDefaultParams_usesDefaultValues() throws Exception {
        Page<KitResponse> mockPage = Page.empty();
        when(kitService.findHistoryForAuthenticatedTenant(0, 10)).thenReturn(mockPage);

        mockMvc.perform(get("/api/kits/my-history"))
            .andExpect(status().isOk());
    }

    @Test
    void getMyHistory_whenServiceThrowsException_returnsBadRequest() throws Exception {
        when(kitService.findHistoryForAuthenticatedTenant(0, 10))
            .thenThrow(new RuntimeException("Error al obtener histórico"));

        mockMvc.perform(get("/api/kits/my-history"))
            .andExpect(status().isBadRequest());
    }

    // ==========================================
    // TESTS CU-ARRENDATARIO-07: Endpoints añadir/eliminar items de kit
    // ==========================================

    @Test
    void addItemToKit_success_returnsOk() throws Exception {
        Kit kit = new Kit();
        kit.setStatus(KitStatus.DRAFT);

        when(kitService.addItemToKit(eq(10L), eq(100L), eq(1L)))
            .thenReturn(new KitResponse(kit));

        mockMvc.perform(post("/api/kits/10/items/100")
                .param("userId", "1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("DRAFT"));
    }

    @Test
    void addItemToKit_itemNotFound_returnsBadRequest() throws Exception {
        when(kitService.addItemToKit(eq(10L), eq(999L), eq(1L)))
            .thenThrow(new RuntimeException("Item not found"));

        mockMvc.perform(post("/api/kits/10/items/999")
                .param("userId", "1"))
            .andExpect(status().isBadRequest())
            .andExpect(content().string("Item not found"));
    }

    @Test
    void addItemToKit_itemAlreadyExists_returnsBadRequest() throws Exception {
        when(kitService.addItemToKit(eq(10L), eq(100L), eq(1L)))
            .thenThrow(new RuntimeException("This item is already in the kit"));

        mockMvc.perform(post("/api/kits/10/items/100")
                .param("userId", "1"))
            .andExpect(status().isBadRequest())
            .andExpect(content().string("This item is already in the kit"));
    }

    @Test
    void addItemToKit_kitNotFound_returnsBadRequest() throws Exception {
        when(kitService.addItemToKit(eq(999L), eq(100L), eq(1L)))
            .thenThrow(new RuntimeException("Kit not found"));

        mockMvc.perform(post("/api/kits/999/items/100")
                .param("userId", "1"))
            .andExpect(status().isBadRequest())
            .andExpect(content().string("Kit not found"));
    }

    @Test
    void removeItemFromKit_success_returnsOk() throws Exception {
        Kit kit = new Kit();
        kit.setStatus(KitStatus.DRAFT);

        when(kitService.removeItemFromKit(eq(10L), eq(100L), eq(1L)))
            .thenReturn(new KitResponse(kit));

        mockMvc.perform(delete("/api/kits/10/items/100")
                .param("userId", "1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("DRAFT"));
    }

    @Test
    void removeItemFromKit_itemNotInKit_returnsBadRequest() throws Exception {
        when(kitService.removeItemFromKit(eq(10L), eq(999L), eq(1L)))
            .thenThrow(new RuntimeException("Item is not part of this kit"));

        mockMvc.perform(delete("/api/kits/10/items/999")
                .param("userId", "1"))
            .andExpect(status().isBadRequest())
            .andExpect(content().string("Item is not part of this kit"));
    }

    @Test
    void removeItemFromKit_kitWouldBeEmpty_returnsBadRequest() throws Exception {
        when(kitService.removeItemFromKit(eq(10L), eq(100L), eq(1L)))
            .thenThrow(new RuntimeException("A kit cannot be empty. It must contain at least one item."));

        mockMvc.perform(delete("/api/kits/10/items/100")
                .param("userId", "1"))
            .andExpect(status().isBadRequest())
            .andExpect(content().string("A kit cannot be empty. It must contain at least one item."));
    }

    @Test
    void removeItemFromKit_kitNotFound_returnsBadRequest() throws Exception {
        when(kitService.removeItemFromKit(eq(999L), eq(100L), eq(1L)))
            .thenThrow(new RuntimeException("Kit not found"));

        mockMvc.perform(delete("/api/kits/999/items/100")
                .param("userId", "1"))
            .andExpect(status().isBadRequest())
            .andExpect(content().string("Kit not found"));
    }
}