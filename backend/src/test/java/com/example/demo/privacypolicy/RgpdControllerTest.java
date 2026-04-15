package com.example.demo.privacypolicy;

import com.example.demo.dto.RgpdRequest;
import com.example.demo.controller.RgpdController;
import com.example.demo.model.PrivacyPolicy;
import com.example.demo.service.PrivacyPolicyService;
import com.example.demo.service.RgpdService;
import com.fasterxml.jackson.databind.ObjectMapper;


import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class RgpdControllerTest {

    private MockMvc mockMvc;

    @Mock
    private RgpdService rgpdService;

    @Mock
    private PrivacyPolicyService privacyPolicyService;

    @InjectMocks
    private RgpdController rgpdController;

    private ObjectMapper mapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(rgpdController).build();
    }


    @Test
    void checkConsent_returnsTrue() throws Exception {
        when(rgpdService.hasCurrentUserAccepted()).thenReturn(true);

        mockMvc.perform(get("/api/rgpd/check"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.hasAccepted").value(true));
    }

    @Test
    void checkConsent_returnsFalse() throws Exception {
        when(rgpdService.hasCurrentUserAccepted()).thenReturn(false);

        mockMvc.perform(get("/api/rgpd/check"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.hasAccepted").value(false));
    }

    @Test
    void needsConsent_returnsTrueWithVersionAndContent() throws Exception {
        when(rgpdService.needsConsent()).thenReturn(true);
        when(rgpdService.getCurrentPolicyVersion()).thenReturn("2.0");
        when(rgpdService.getCurrentPolicyContent()).thenReturn("Contenido de prueba");

        mockMvc.perform(get("/api/rgpd/needs-consent"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.needsConsent").value(true))
                .andExpect(jsonPath("$.currentVersion").value("2.0"))
                .andExpect(jsonPath("$.policyContent").value("Contenido de prueba"));
    }

    @Test
    void needsConsent_returnsFalse() throws Exception {
        when(rgpdService.needsConsent()).thenReturn(false);
        when(rgpdService.getCurrentPolicyVersion()).thenReturn("1.0");
        when(rgpdService.getCurrentPolicyContent()).thenReturn("Texto");

        mockMvc.perform(get("/api/rgpd/needs-consent"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.needsConsent").value(false))
                .andExpect(jsonPath("$.currentVersion").value("1.0"))
                .andExpect(jsonPath("$.policyContent").value("Texto"));
    }


    @Test
    void acceptConsent_withForwardedHeader_usesForwardedIp() throws Exception {
        RgpdRequest req = new RgpdRequest();
        req.setVersion("2.0");

        mockMvc.perform(post("/api/rgpd/accept")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(req))
                        .header("X-Forwarded-For", "123.45.67.89"))
                .andExpect(status().isOk());

        verify(rgpdService).recordConsent(eq("2.0"), eq("123.45.67.89"));
    }

    @Test
    void acceptConsent_withoutForwardedHeader_usesRemoteAddr() throws Exception {
        RgpdRequest req = new RgpdRequest();
        req.setVersion("1.0");

        mockMvc.perform(post("/api/rgpd/accept")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(req))
                        .with(r -> {
                            r.setRemoteAddr("88.99.11.22");
                            return r;
                        }))
                .andExpect(status().isOk());

        verify(rgpdService).recordConsent(eq("1.0"), eq("88.99.11.22"));
    }

    @Test
    void acceptConsent_localhostIp_returnsUnknown() throws Exception {
        RgpdRequest req = new RgpdRequest();
        req.setVersion("3.0");

        mockMvc.perform(post("/api/rgpd/accept")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(req))
                        .with(r -> {
                            r.setRemoteAddr("127.0.0.1");
                            return r;
                        }))
                .andExpect(status().isOk());

        verify(rgpdService).recordConsent(eq("3.0"), eq("unknown"));
    }


    @Test
    void getCurrentPublicPolicy_returnsPolicy() throws Exception {
        PrivacyPolicy policy = new PrivacyPolicy("2.0", "Contenido");
        policy.setActive(true);

        when(privacyPolicyService.getCurrentActivePolicy()).thenReturn(policy);

        mockMvc.perform(get("/api/rgpd/current-policy"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.version").value("2.0"))
                .andExpect(jsonPath("$.content").value("Contenido"));
    }
}

