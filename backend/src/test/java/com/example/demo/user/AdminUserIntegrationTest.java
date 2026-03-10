package com.example.demo.integration;

import com.example.demo.model.User;
import com.example.demo.model.UserRole;
import com.example.demo.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@Transactional
class AdminUserIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    private ObjectMapper objectMapper = new ObjectMapper();

    // Test de integración completo: listado, actualización y eliminación de un usuario
    
        @Test
    void list_update_and_delete_user_flow() throws Exception {
        // Insert user directly into repository (set required fields)
        User u = new User();
        u.setEmail("int@user.com");
        u.setPassword("encoded");
        u.setName("Integration");
        u.setRole(UserRole.USER);
        u.setPhone("+34111111111");
        u.setAddress("Addr");
        u.setCity("City");
        u.setCountry("Country");

        User saved = userRepository.save(u);

        // List users and check presence
        mockMvc.perform(get("/api/admin/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.email=='int@user.com')]").exists());

        // Update user's name via controller
        var req = new java.util.HashMap<String, Object>();
        req.put("name", "UpdatedName");

        mockMvc.perform(put("/api/admin/users/" + saved.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath(".name").value("UpdatedName"));

        // Verify repository updated
        var after = userRepository.findById(saved.getId()).orElseThrow();
        assertThat(after.getName()).isEqualTo("UpdatedName");

        // Delete user via controller
        mockMvc.perform(delete("/api/admin/users/" + saved.getId()))
                .andExpect(status().isNoContent());

        assertThat(userRepository.existsById(saved.getId())).isFalse();
    }
}
