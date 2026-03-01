package com.example.demo.controller;

import com.example.demo.dto.RatingCreateRequest;
import com.example.demo.dto.RatingResponse;
import com.example.demo.security.JwtUtil;
import com.example.demo.service.RatingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ratings")
@CrossOrigin(origins = "*")
public class RatingController {

    @Autowired
    private RatingService ratingService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping
    public ResponseEntity<RatingResponse> create(
            @Valid @RequestBody RatingCreateRequest request,
            @RequestHeader("Authorization") String authorizationHeader) {

        String token = authorizationHeader.substring(7);
        String email = jwtUtil.extractEmail(token);
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
    public ResponseEntity<Void> deleteRating(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authorizationHeader) {

        String token = authorizationHeader.substring(7);
        String email = jwtUtil.extractEmail(token);
        ratingService.deleteById(id, email);
        return ResponseEntity.ok().build();
    }
}
