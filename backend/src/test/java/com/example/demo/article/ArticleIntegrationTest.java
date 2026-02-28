package com.example.demo.article;

import com.example.demo.model.*;
import com.example.demo.repository.ArticleRepository;
import com.example.demo.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest 
@AutoConfigureMockMvc(addFilters = false) 
@Transactional 
@ActiveProfiles("test")
class ArticleIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ArticleRepository articleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private User savedOwner;
    private Article savedArticle;

    @BeforeEach
void setUp() {

    User owner = new User();
    owner.setName("Juan");
    owner.setEmail("juan@example.com");
    owner.setPassword("123");
    owner.setRole(UserRole.USER);
    savedOwner = userRepository.save(owner);


    Article article = new Article();
    article.setTitle("Taladro");
    article.setDescription("Un taladro potente"); 
    article.setCity("Madrid");
    article.setPricePerMonth(50.0);
    article.setStatus(ArticleStatus.AVAILABLE);
    article.setOwner(savedOwner);


    savedArticle = articleRepository.save(article);
}

    @Test
    void testUpdateArticle_Integration() throws Exception {
        Article updateData = new Article();
        updateData.setTitle("Taladro Percutor");

        mockMvc.perform(put("/api/article/" + savedArticle.getId())
                .param("ownerId", savedOwner.getId().toString())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateData)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Taladro Percutor"));


        Article inDb = articleRepository.findById(savedArticle.getId()).orElseThrow();
        assertThat(inDb.getTitle()).isEqualTo("Taladro Percutor");
    }

    @Test
    void testToggleRent_Integration() throws Exception {
  
        mockMvc.perform(post("/api/article/" + savedArticle.getId() + "/toggle-rent")
                .param("ownerId", savedOwner.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("RENTED"));

       
        Article rentedInDb = articleRepository.findById(savedArticle.getId()).orElseThrow();
        assertThat(rentedInDb.getStatus()).isEqualTo(ArticleStatus.RENTED);
    }

    @Test
    void testDeleteArticle_Integration() throws Exception {
        mockMvc.perform(delete("/api/article/" + savedArticle.getId())
                .param("ownerId", savedOwner.getId().toString()))
                .andExpect(status().isNoContent());

    
        assertThat(articleRepository.findById(savedArticle.getId())).isEmpty();
    }

    @Test
    void testDeleteArticle_Failure_OwnerMismatch() throws Exception {
  
        mockMvc.perform(delete("/api/article/" + savedArticle.getId())
                .param("ownerId", "999"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Only the owner can delete this article"));
        
  
        assertThat(articleRepository.existsById(savedArticle.getId())).isTrue();
    }
}
