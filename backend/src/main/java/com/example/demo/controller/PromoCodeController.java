package com.example.demo.controller;

import com.example.demo.dto.PromoCodeValidationResponse;
import com.example.demo.service.PromoCodeService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/promo-codes")
@CrossOrigin(origins = "*")
public class PromoCodeController {

    @Autowired
    private PromoCodeService promoCodeService;

    @GetMapping("/validate")
    public ResponseEntity<PromoCodeValidationResponse> validate(
            @RequestParam String code,
            @RequestParam String email) {
        return ResponseEntity.ok(promoCodeService.validate(code, email));
    }
}