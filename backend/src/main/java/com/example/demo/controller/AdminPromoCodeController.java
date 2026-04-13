package com.example.demo.controller;

import com.example.demo.dto.PromoCodeRequest;
import com.example.demo.dto.PromoCodeResponse;
import com.example.demo.service.PromoCodeService;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/promo-codes")
@CrossOrigin(origins = "*")
public class AdminPromoCodeController {

    @Autowired
    private PromoCodeService promoCodeService;

    @GetMapping
    public ResponseEntity<List<PromoCodeResponse>> getAll() {
        return ResponseEntity.ok(promoCodeService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(promoCodeService.findById(id));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody PromoCodeRequest request) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(promoCodeService.create(request));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody PromoCodeRequest request) {
        try {
            return ResponseEntity.ok(promoCodeService.update(id, request));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}