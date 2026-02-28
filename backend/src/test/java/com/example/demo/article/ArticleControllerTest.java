package com.example.demo.article;

import com.example.demo.controller.ArticleController;
import com.example.demo.model.Article;
import com.example.demo.model.ArticleStatus;
import com.example.demo.security.JwtUtil;
import com.example.demo.service.ArticleService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.mockito.Mockito.doThrow;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = ArticleController.class, excludeAutoConfiguration = {
        SecurityAutoConfiguration.class,
        SecurityFilterAutoConfiguration.class
    })
class ArticleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ArticleService articleService;

    @MockitoBean
    private com.example.demo.repository.UserRepository userRepository;

    @MockitoBean
    private com.example.demo.security.CustomUserDetailsService customUserDetailsService;

    @MockitoBean
    private com.example.demo.security.TokenBlacklistService tokenBlacklistService;

    @MockitoBean
    private JwtUtil jwtUtil;

    private Article sample;

    @BeforeEach
    void setUp() {
        sample = new Article();
        sample.setId(1L);
        sample.setTitle("t");
        sample.setDescription("d");
        sample.setCity("c");
        sample.setPricePerMonth(10.0);
        sample.setStatus(ArticleStatus.AVAILABLE);
        sample.setAvailableFrom(LocalDate.now());
        sample.setAvailableUntil(LocalDate.now().plusDays(1));
    }

    @Test
    void updateArticle_success() throws Exception {
        Article updateData = new Article();
        updateData.setTitle("newtitle");

        Article returned = new Article();
        returned.setId(1L);
        returned.setTitle("newtitle");

        when(articleService.update(eq(1L), eq(100L), any(Article.class)))
            .thenReturn(returned);

        mockMvc.perform(put("/api/article/1")
                .param("ownerId", "100")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"newtitle\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.title").value("newtitle"));
    }

    @Test
    void updateArticle_failureReturnsBadRequest() throws Exception {
        when(articleService.update(eq(1L), eq(100L), any(Article.class)))
            .thenThrow(new RuntimeException("bad"));

        mockMvc.perform(put("/api/article/1")
                .param("ownerId", "100")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"x\"}"))
            .andExpect(status().isBadRequest())
            .andExpect(content().string("bad"));
    }

    @Test
    void deleteArticle_success() throws Exception {
        mockMvc.perform(delete("/api/article/2")
                .param("ownerId", "200"))
            .andExpect(status().isNoContent());
    }

    @Test
    void deleteArticle_failureReturnsBadRequest() throws Exception {
        // Si deleteById es void, usa esta sintaxis:
        doThrow(new RuntimeException("oops"))
            .when(articleService).deleteById(3L, 300L);

        mockMvc.perform(delete("/api/article/3")
                .param("ownerId", "300"))
            .andExpect(status().isBadRequest())
            .andExpect(content().string("oops"));
    }

    @Test
    void toggleRent_success() throws Exception {
        Article toggled = new Article();
        toggled.setId(5L);
        toggled.setStatus(ArticleStatus.RENTED);
        when(articleService.toggleRent(5L, 500L)).thenReturn(toggled);

        mockMvc.perform(post("/api/article/5/toggle-rent")
                .param("ownerId", "500"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("RENTED"));
    }

    @Test
    void toggleRent_failure() throws Exception {
        when(articleService.toggleRent(6L, 600L)).thenThrow(new RuntimeException("nope"));
        mockMvc.perform(post("/api/article/6/toggle-rent")
                .param("ownerId", "600"))
            .andExpect(status().isBadRequest())
            .andExpect(content().string("nope"));
    }
}
