package com.example.demo.category;

import com.example.demo.model.Category;
import com.example.demo.model.CategoryStatus;
import com.example.demo.model.User;
import com.example.demo.model.UserRole;
import com.example.demo.repository.CategoryRepository;
import com.example.demo.repository.ItemRepository;
import com.example.demo.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@Transactional
@ActiveProfiles("test")
class CategoryIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private Category savedCategory;

    @BeforeEach
    void setUp() {
        itemRepository.deleteAll();
        categoryRepository.deleteAll();
        
        // Crear contexto de seguridad para saltar el checkAdminRole()
        User adminUser = new User();
        adminUser.setEmail("admin@test.com");
        adminUser.setPassword("password");
        adminUser.setName("Admin");
        adminUser.setPhone("123456789");
        adminUser.setRole(UserRole.ADMIN);
        adminUser.setAddress("Address");
        adminUser.setCountry("Country");
        adminUser.setCity("City");
        userRepository.save(adminUser);

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        Authentication auth = new UsernamePasswordAuthenticationToken("admin@test.com", "password", Collections.emptyList());
        context.setAuthentication(auth);
        SecurityContextHolder.setContext(context);

        Category category = new Category("Electrónica", "Dispositivos informáticos", 10.0, 2000.0);
        category.setStatus(CategoryStatus.ACTIVE);
        savedCategory = categoryRepository.save(category);
    }

    @Test
    void testCreateCategory_Integration_Success() throws Exception {
        Category newCategory = new Category("Deportes", "Artículos deportivos", 5.0, 500.0);

        mockMvc.perform(post("/api/category")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newCategory)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Deportes"))
                .andExpect(jsonPath("$.status").value("DRAFT"));
    }

    @Test
    void testGetAllCategories_Integration() throws Exception {
        mockMvc.perform(get("/api/category"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].name").value("Electrónica"));
    }

    @Test
    void testUpdateCategory_Integration() throws Exception {
        Category updateData = new Category();
        updateData.setName("Electrónica y Gaming");
        updateData.setMaxPrice(3000.0);

        mockMvc.perform(put("/api/category/" + savedCategory.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateData)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Electrónica y Gaming"))
                .andExpect(jsonPath("$.maxPrice").value(3000.0));

        Category inDb = categoryRepository.findById(savedCategory.getId()).orElseThrow();
        assertThat(inDb.getName()).isEqualTo("Electrónica y Gaming");
    }

    @Test
    void testDeleteCategory_Integration() throws Exception {
        mockMvc.perform(delete("/api/category/" + savedCategory.getId()))
                .andExpect(status().isOk());

        assertThat(categoryRepository.findById(savedCategory.getId())).isEmpty();
    }
}