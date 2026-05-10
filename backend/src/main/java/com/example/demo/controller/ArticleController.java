package com.example.demo.controller;

import com.example.demo.dto.ArticleNearbyDTO;
import com.example.demo.dto.ArticleRecordDTO;
import com.example.demo.dto.ReturnRequest;
import com.example.demo.dto.ReturnResponse;
import com.example.demo.dto.UserArticle;
import com.example.demo.model.Article;
import com.example.demo.model.User;
import com.example.demo.model.Category;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.CategoryRepository;
import com.example.demo.service.ArticleAvailabilityRequestService;
import com.example.demo.service.ArticleService;
import com.example.demo.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.HashMap;
import java.time.LocalDate;
import java.util.List;


@RestController
@RequestMapping("/api/article")
@CrossOrigin(origins = "*")
public class ArticleController {

    @Autowired
    private ArticleService articleService;
    @Autowired
    private ArticleAvailabilityRequestService availabilityRequestService;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private CategoryRepository categoryRepository;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private AuthService authService;

    @PostMapping(value = "/upload-with-image", consumes = {"multipart/form-data"})
    public ResponseEntity<?> uploadArticleWithImage(
            @RequestParam Long ownerId,
            @RequestParam Long categoryId,
            @RequestPart("data") String dataJson,
            @RequestPart("image") MultipartFile image) {
        try {
            Article article = objectMapper.readValue(dataJson, Article.class);
            
            Article saved = articleService.createWithImage(article, image, ownerId, categoryId);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadArticle(@RequestParam Long ownerId, @RequestParam Long categoryId, @RequestBody Article article) {
        try {
            User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("Propietario no encontrado"));

            Category category = categoryRepository.findById(categoryId)
            .orElseThrow(() -> new RuntimeException("Category not found"));

            article.setOwner(owner);
            article.setCategory(category);

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

    @PostMapping("/{id}/notify-when-available")
    public ResponseEntity<?> requestAvailabilityNotification(
            @PathVariable Long id,
            @RequestParam Long requesterId,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate) {
        try {
            availabilityRequestService.requestAvailabilityNotification(id, requesterId, startDate, endDate);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body("Aviso de disponibilidad registrado correctamente.");
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }



    @PutMapping("/{id}")
    public ResponseEntity<?> updateArticle(
            @PathVariable Long id,
            @RequestParam Long ownerId,
            @RequestBody Article updateData) {
        try {
            Article updated = articleService.update(id, ownerId, updateData);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PutMapping(value = "/{id}/with-image", consumes = {"multipart/form-data"})
    public ResponseEntity<?> updateArticleWithImage(
            @PathVariable Long id,
            @RequestParam Long ownerId,
            @RequestPart("data") String dataJson,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        try {
            Article updateData = objectMapper.readValue(dataJson, Article.class);
            Article updated;
            
            if (image != null && !image.isEmpty()) {
                updated = articleService.updateWithImage(id, ownerId, updateData, image);
            } else {
                updated = articleService.update(id, ownerId, updateData);
            }
            
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
    public ResponseEntity<?> getMyArticles(
        @PathVariable Long userId, 
        @RequestParam(required = false) Long categoryId,
        @RequestParam(required = false) String condition,
        @RequestParam(required = false) Double minPrice,   
        @RequestParam(required = false) Double maxPrice) {
        try {
        
        List<UserArticle> articles = articleService.findArticlesByUserId(userId, categoryId, condition, minPrice, maxPrice);
        return ResponseEntity.ok(articles);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(Map.of(
                "message", e.getMessage(),
                "status", 500
            ));
    }
    }

    @GetMapping("/category/{categoryId}/count")
    public ResponseEntity<Long> getArticleCountByCategory(@PathVariable Long categoryId) {
        try {
            long count = articleService.countArticlesByCategory(categoryId);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(0L);
        }
    }

    @GetMapping("/category/{categoryId}/latest")
    public ResponseEntity<List<UserArticle>> getLatestArticlesByCategory(@PathVariable Long categoryId) {
        try {
            List<UserArticle> latestArticles = articleService.findLatestArticlesByCategory(categoryId);
            return ResponseEntity.ok(latestArticles);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/record/{articleId}")
    public ResponseEntity<List<ArticleRecordDTO>> getArticleRecord(@PathVariable Long articleId) {
        try {
            Long ownerId = authService.getAuthenticatedUserId();
            Article article = articleService.findById(articleId);
            if (article == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
            } 
            if (!ownerId.equals(article.getOwner().getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
            }
            List<ArticleRecordDTO> articleRecord = articleService.findArticleRecord(articleId);
            return ResponseEntity.ok(articleRecord);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PostMapping("/{articleId}/return")
    public ResponseEntity<?> processReturn(
            @PathVariable Long articleId,
            @RequestParam Long ownerId,
            @RequestBody ReturnRequest request) {
        try {
            ReturnResponse response = articleService.processReturn(articleId, ownerId, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("status", 409);
            error.put("error", "Conflict");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
        }
    }
    
    @GetMapping("/nearby")
    public ResponseEntity<List<ArticleNearbyDTO>> getNearbyArticles(
            @RequestParam String city,
            @RequestParam String country,
            @RequestParam(defaultValue = "150") double radiusKm) {
        try {
            List<ArticleNearbyDTO> articles = articleService.findNearbyArticles(city, country, radiusKm);
            return ResponseEntity.ok(articles);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/map")
    public ResponseEntity<List<ArticleNearbyDTO>> getArticlesForMap(
            @RequestParam(required = false) String country,
            @RequestParam(defaultValue = "false") boolean includeRented) {
        try {
            List<ArticleNearbyDTO> articles = includeRented
                ? articleService.findAllWithCoords(country, true)
                : articleService.findAllWithCoords(country);
            return ResponseEntity.ok(articles);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

}
