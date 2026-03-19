package com.example.demo.controller;

import com.example.demo.dto.PlatformConfigRequest;
import com.example.demo.dto.PlatformConfigResponse;
import com.example.demo.model.PlatformConfig;
import com.example.demo.service.PlatformConfigService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import org.springframework.http.MediaType;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class AdminPlatformConfigControllerTest {

    private MockMvc mockMvc;

    @Mock
    private PlatformConfigService service;

    @InjectMocks
    private AdminPlatformConfigController controller;

    private ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    // GET devuelve config
    @Test
    void getCommissionRate_returnsOk() throws Exception {
        PlatformConfig config = new PlatformConfig(0.2);
        config.setId(1L);

        PlatformConfigResponse response = new PlatformConfigResponse(config);

        when(service.getConfig()).thenReturn(response);

        mockMvc.perform(get("/api/admin/config/commission"))
                .andExpect(status().isOk())
                .andExpect(jsonPath(".commissionRate").value(0.2));
    }

    // PUT actualiza config
    @Test
    void updateCommissionRate_returnsUpdated() throws Exception {
        PlatformConfig config = new PlatformConfig(0.5);
        config.setId(1L);

        PlatformConfigResponse response = new PlatformConfigResponse(config);

        when(service.updateCommissionRate(any())).thenReturn(response);

        PlatformConfigRequest req = new PlatformConfigRequest(0.5);

        mockMvc.perform(put("/api/admin/config/commission")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath(".commissionRate").value(0.5));
    }
}