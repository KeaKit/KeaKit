package com.example.demo.controller;

import com.example.demo.dto.RatingCreateRequest;
import com.example.demo.dto.RatingResponse;
import com.example.demo.service.AuthService;
import com.example.demo.service.RatingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ratings")
@CrossOrigin(origins = "*")
public class RatingController {

    @Autowired
    private RatingService ratingService;

    @Autowired
    private AuthService authService;

    @PostMapping
    public ResponseEntity<RatingResponse> create(
            @Valid @RequestBody RatingCreateRequest request) {

        String email = authService.getAuthenticatedUserEmail();
        RatingResponse response = ratingService.create(request, email);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<RatingResponse>> getRatingsForUser(@PathVariable Long userId) {
        List<RatingResponse> ratings = ratingService.findByRevieweeId(userId);
        return ResponseEntity.ok(ratings);
    }

    @GetMapping("/given/{userId}")
    public ResponseEntity<List<RatingResponse>> getRatingsByUser(@PathVariable Long userId) {
        List<RatingResponse> ratings = ratingService.findByReviewerId(userId);
        return ResponseEntity.ok(ratings);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RatingResponse> getRating(@PathVariable Long id) {
        RatingResponse response = ratingService.findById(id);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRating(@PathVariable Long id) {

        String email = authService.getAuthenticatedUserEmail();
        ratingService.deleteById(id, email);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/has-reviewed")
    public ResponseEntity<Map<Long, Boolean>> hasReviewedItems(
            @RequestParam Long reviewerId,
            @RequestParam Long kitId,
            @RequestParam List<Long> itemIds
    ) {
        Map<Long, Boolean> result = ratingService.hasReviewedItems(reviewerId, kitId, itemIds);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/has-reviewed-kit")
    public ResponseEntity<Map<Long, Boolean>> hasReviewedArticleInKits(
            @RequestParam Long reviewerId,
            @RequestParam Long itemId,
            @RequestParam List<Long> kitIds
    ) {
        Map<Long, Boolean> result = ratingService.hasReviewedItemInKits(reviewerId, itemId, kitIds);
        return ResponseEntity.ok(result);
    }
}
