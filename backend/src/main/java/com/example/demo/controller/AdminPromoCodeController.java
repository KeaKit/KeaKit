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
        List<PromoCodeResponse> response = promoCodeService.findAll();
        
        return ResponseEntity
            .status(HttpStatus.OK)
            .body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PromoCodeResponse> getById(@PathVariable Long id) {
        PromoCodeResponse response = promoCodeService.findById(id);

        return ResponseEntity
            .status(HttpStatus.OK)
            .body(response);
    }

    @PostMapping
    public ResponseEntity<PromoCodeResponse> create(@Valid @RequestBody PromoCodeRequest request) {
        PromoCodeResponse response = promoCodeService.create(request);

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PromoCodeResponse> update(@PathVariable Long id, @Valid @RequestBody PromoCodeRequest request) {
        PromoCodeResponse response = promoCodeService.update(id, request);

        return ResponseEntity
            .status(HttpStatus.OK)
            .body(response);
    }
}