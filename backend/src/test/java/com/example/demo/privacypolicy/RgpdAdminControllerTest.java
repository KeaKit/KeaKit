package com.example.demo.privacypolicy;

import com.example.demo.controller.RgpdAdminController;
import com.example.demo.dto.CreatePolicyRequest;
import com.example.demo.model.PrivacyPolicy;
import com.example.demo.service.PrivacyPolicyService;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class RgpdAdminControllerTest {

    private MockMvc mockMvc;

    @Mock
    private PrivacyPolicyService privacyPolicyService;

    @InjectMocks
    private RgpdAdminController rgpdAdminController;

    private ObjectMapper mapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(rgpdAdminController).build();
    }


    @Test
    void getCurrentPolicy_returnsPolicy() throws Exception {
        PrivacyPolicy policy = new PrivacyPolicy("2.0", "Contenido actual");
        policy.setActive(true);

        when(privacyPolicyService.getCurrentActivePolicy()).thenReturn(policy);

        mockMvc.perform(get("/api/admin/rgpd/current"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.version").value("2.0"))
                .andExpect(jsonPath("$.content").value("Contenido actual"));
    }


    @Test
    void getAllPolicies_returnsEmptyList() throws Exception {
        when(privacyPolicyService.getAllPolicies()).thenReturn(List.of());

        mockMvc.perform(get("/api/admin/rgpd/policies"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void getAllPolicies_returnsList() throws Exception {
        PrivacyPolicy p1 = new PrivacyPolicy("1.0", "A");
        PrivacyPolicy p2 = new PrivacyPolicy("2.0", "B");

        when(privacyPolicyService.getAllPolicies()).thenReturn(List.of(p1, p2));

        mockMvc.perform(get("/api/admin/rgpd/policies"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].version").value("1.0"))
                .andExpect(jsonPath("$[1].version").value("2.0"));
    }


    @Test
    void createNewPolicy_returnsCreatedPolicy() throws Exception {
        CreatePolicyRequest req = new CreatePolicyRequest();
        req.setVersion("3.0");
        req.setContent("Nueva política");

        PrivacyPolicy saved = new PrivacyPolicy("3.0", "Nueva política");
        saved.setActive(true);

        when(privacyPolicyService.createNewPolicy("3.0", "Nueva política"))
                .thenReturn(saved);

        mockMvc.perform(post("/api/admin/rgpd/policies")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.version").value("3.0"))
                .andExpect(jsonPath("$.content").value("Nueva política"));

        verify(privacyPolicyService).createNewPolicy("3.0", "Nueva política");
    }

    @Test
    void createNewPolicy_validatesRequest() throws Exception {
        mockMvc.perform(post("/api/admin/rgpd/policies")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }
}
