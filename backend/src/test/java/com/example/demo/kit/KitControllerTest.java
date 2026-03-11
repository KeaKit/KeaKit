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

    // TEST PARA LOS ESTADOS DE LOS KITS Y ALGUNAS VALIDACIONES

    @Test
    void createKit_withStatus_returnsCreated() throws Exception {
        Kit kit = new Kit();
        when(kitService.create(any())).thenReturn(kit);

        mockMvc.perform(post("/api/kits/create")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Kit Test\",\"status\":\"ACTIVE\"}"))
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
}
