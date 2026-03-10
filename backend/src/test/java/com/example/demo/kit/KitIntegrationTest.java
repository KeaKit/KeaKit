package com.example.demo.kit;

import com.example.demo.model.*;
import com.example.demo.repository.KitRepository;
import com.example.demo.repository.UserRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;

import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@Transactional
@ActiveProfiles("test")
class KitIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private KitRepository kitRepository;

    @Autowired
    private UserRepository userRepository;


    private User tenant;
    private Kit savedKit;

    @BeforeEach
    void setUp() {
        tenant = new User();
        tenant.setName("Cristina");
        tenant.setEmail("cris@example.com");
        tenant.setPassword("123456");
        tenant.setRole(UserRole.USER);
        tenant.setCountry("España");
        tenant.setCity("Sevilla");
        tenant.setAddress("Calle 123 matame otra vez");
        tenant.setPhone("223456789");
        tenant = userRepository.save(tenant);



        savedKit = new Kit();
        savedKit.setName("Kit Inicial");
        savedKit.setCountry("España");
        savedKit.setCity("Sevilla");
        savedKit.setStartDate(LocalDate.now());
        savedKit.setEndDate(LocalDate.now().plusDays(5));
        savedKit.setStatus(KitStatus.ACTIVE);
        savedKit.setTenant(tenant);

        savedKit = kitRepository.save(savedKit);
    }

    // TESTS DE INTEGRACIÓN PARA KITS, PRINCIPALMENTE PARA LOS ESTADOS DE LOS KITS Y ALGUNAS VALIDACIONES

    // ------------------ CREATE ------------------

    @Test
    void testCreateKit_success() throws Exception {
        String json = """
                        {
                  "name": "Kit Nuevo",
                  "country": "España",
                  "city": "Madrid",
                  "startDate": "2026-06-15",
                  "endDate": "2026-06-30",
                  "status": "PENDING",
                  "deliveryMethod": "MEETING_POINT",
                  "meetingPoint": "Plaza Mayor, bajo la estatua",
                  "tenantId": %d,
                  "itemSelections": [
                  ]
                }
                        """.formatted(tenant.getId());

        mockMvc.perform(post("/api/kits/create")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.name").value("Kit Nuevo"));
    }

    @Test
    void testCreateKit_invalidDates() throws Exception {
        String json = """
        {
                  "name": "Kit Nuevo",
                  "country": "España",
                  "city": "Madrid",
                  "startDate": "2026-06-30",
                  "endDate": "2026-06-15",
                  "status": "PENDING",
                  "deliveryMethod": "MEETING_POINT",
                  "meetingPoint": "Plaza Mayor, bajo la estatua",
                  "tenantId": %d,
                  "itemSelections": [
                  ]
                }
        """.formatted(tenant.getId());

        mockMvc.perform(post("/api/kits/create")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("End date cannot be before start date"));
    }

    // ------------------ GET ------------------

    @Test
    void testGetKit_success() throws Exception {
        mockMvc.perform(get("/api/kits/" + savedKit.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    @Test
    void testGetKit_notFound() throws Exception {
        mockMvc.perform(get("/api/kits/999999"))
                .andExpect(status().isNotFound());
    }

    // ------------------ UPDATE ------------------

    @Test
    void testUpdateKit_changeStatus() throws Exception {
        String json = """
        {
            "status": "COMPLETED"
        }
        """;

        mockMvc.perform(put("/api/kits/" + savedKit.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"));

        Kit updated = kitRepository.findById(savedKit.getId()).orElseThrow();
        assertThat(updated.getStatus()).isEqualTo(KitStatus.COMPLETED);
    }

    @Test
    void testUpdateKit_invalidDates() throws Exception {
        String json = """
        {
            "startDate": "2024-06-10",
            "endDate": "2024-06-01"
        }
        """;

        mockMvc.perform(put("/api/kits/" + savedKit.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isNotFound()); // el controller devuelve NOT_FOUND en errores
    }

    // ------------------ DELETE ------------------

    @Test
    void testDeleteKit_success() throws Exception {
        mockMvc.perform(delete("/api/kits/" + savedKit.getId()))
                .andExpect(status().isOk());

        assertThat(kitRepository.existsById(savedKit.getId())).isFalse();
    }

    @Test
    void testDeleteKit_notFound() throws Exception {
        mockMvc.perform(delete("/api/kits/999999"))
                .andExpect(status().isNotFound());
    }

    // ------------------ TENANT FILTER ------------------

    @Test
    void testGetMyKits_success() throws Exception {
        mockMvc.perform(get("/api/kits/my-kits/" + tenant.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    // ------------------ TRACKING ------------------

    @Test
    void testTrackingKit_success() throws Exception {
        mockMvc.perform(get("/api/kits/my-kits/" + tenant.getId() + "/" + savedKit.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    @Test
    void testTrackingKit_wrongTenant() throws Exception {
        mockMvc.perform(get("/api/kits/my-kits/999/" + savedKit.getId()))
                .andExpect(status().isNotFound());
    }
}
