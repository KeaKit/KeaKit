package com.example.demo.category;

import com.example.demo.controller.CategoryController;
import com.example.demo.model.Category;
import com.example.demo.model.CategoryStatus;
import com.example.demo.security.JwtUtil;
import com.example.demo.service.CategoryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = CategoryController.class, excludeAutoConfiguration = {
        SecurityAutoConfiguration.class,
        SecurityFilterAutoConfiguration.class,
        org.springframework.boot.autoconfigure.data.jpa.JpaRepositoriesAutoConfiguration.class
})
class CategoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CategoryService categoryService;

    // Dependencias de seguridad (necesarias aunque estén excluidas para que el contexto cargue)
    @MockitoBean private com.example.demo.security.CustomUserDetailsService customUserDetailsService;
    @MockitoBean private com.example.demo.security.TokenBlacklistService tokenBlacklistService;
    @MockitoBean private JwtUtil jwtUtil;

    private Category sampleCategory;

    @BeforeEach
    void setUp() {
        sampleCategory = new Category("Electrónica", "Dispositivos", 10.0, 1000.0);
        sampleCategory.setId(1L);
        sampleCategory.setStatus(CategoryStatus.ACTIVE);
    }

    // ------------ POST /api/category ------------

    @Test
    void createCategory_success() throws Exception {
        when(categoryService.createCategory(any(Category.class))).thenReturn(sampleCategory);

        mockMvc.perform(post("/api/category")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Electrónica\",\"description\":\"Dispositivos\",\"minPrice\":10.0,\"maxPrice\":1000.0}"))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.name").value("Electrónica"));
    }

    @Test
    void createCategory_serviceThrows_returnsInternalServerError() throws Exception {
        when(categoryService.createCategory(any(Category.class))).thenThrow(new RuntimeException("Name is required"));

        mockMvc.perform(post("/api/category")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"description\":\"Dispositivos\"}"))
            .andExpect(status().isInternalServerError())
            .andExpect(content().string("Name is required"));
    }

    // ------------ GET /api/category ------------

    @Test
    void getAllCategories_success() throws Exception {
        Category cat2 = new Category("Hogar", "Cosas de casa", 5.0, 500.0);
        cat2.setId(2L);

        when(categoryService.getAllCategories()).thenReturn(List.of(sampleCategory, cat2));

        mockMvc.perform(get("/api/category"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(2))
            .andExpect(jsonPath("$[0].name").value("Electrónica"))
            .andExpect(jsonPath("$[1].name").value("Hogar"));
    }

    // ------------ GET /api/category/{id} ------------

    @Test
    void getCategoryById_success() throws Exception {
        when(categoryService.getCategoryById(1L)).thenReturn(sampleCategory);

        mockMvc.perform(get("/api/category/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("Electrónica"));
    }

    @Test
    void getCategoryById_notFound() throws Exception {
        when(categoryService.getCategoryById(99L)).thenThrow(new RuntimeException("Category not found"));

        mockMvc.perform(get("/api/category/99"))
            .andExpect(status().isNotFound())
            .andExpect(content().string("Category not found"));
    }

    // ------------ PUT /api/category/{id} ------------

    @Test
    void updateCategory_success() throws Exception {
        Category updated = new Category("Electrónica Editada", "Dispositivos", 10.0, 1000.0);
        updated.setId(1L);

        when(categoryService.updateCategory(eq(1L), any(Category.class))).thenReturn(updated);

        mockMvc.perform(put("/api/category/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Electrónica Editada\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("Electrónica Editada"));
    }

    // ------------ DELETE /api/category/{id} ------------

    @Test
    void deleteCategory_success() throws Exception {
        mockMvc.perform(delete("/api/category/1"))
            .andExpect(status().isOk())
            .andExpect(content().string("Category deleted successfully"));
    }

    @Test
    void deleteCategory_notFound() throws Exception {
        doThrow(new RuntimeException("Category not found")).when(categoryService).deleteCategory(99L);

        mockMvc.perform(delete("/api/category/99"))
            .andExpect(status().isNotFound())
            .andExpect(content().string("Category not found"));
    }
}