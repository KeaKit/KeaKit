package com.example.demo.controller;

import com.example.demo.dto.UserArticle;
import com.example.demo.model.Article;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.ArticleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/article")
@CrossOrigin(origins = "*")
public class ArticleController {

    @Autowired
    private ArticleService articleService;
    @Autowired
    private UserRepository userRepository;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadArticle(@RequestParam Long ownerId, @RequestBody Article article) {
        try {
            User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("Owner not found"));

            article.setOwner(owner);
            Article saved = articleService.save(article);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllArticles() {
        try {
            List<Article> articles = articleService.findAll();
            return ResponseEntity.ok(articles);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getArticleById(@PathVariable Long id) {
        try {
            Article article = articleService.findById(id);
            return ResponseEntity.ok(article);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
    

    @PutMapping("/{id}")
    public ResponseEntity<?> updateArticle(@PathVariable Long id, @RequestParam Long ownerId, @RequestBody Article updateData) {
        try {
            Article updated = articleService.update(id, ownerId, updateData);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteArticle(@PathVariable Long id, @RequestParam Long ownerId) {
        try {
            articleService.deleteById(id, ownerId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/{id}/toggle-rent")
    public ResponseEntity<?> toggleRent(@PathVariable Long id, @RequestParam Long ownerId) {
        try {
            Article updated = articleService.toggleRent(id, ownerId);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/my-articles/{userId}")
    public ResponseEntity<List<UserArticle>> getMyArticles(@PathVariable Long userId) {
        List<UserArticle> articles = articleService.findArticlesByUserId(userId);
        
        return ResponseEntity.ok(articles);
    }

}
