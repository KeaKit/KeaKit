package com.example.demo.controller;

import com.example.demo.dto.PromoCodeValidationResponse;
import com.example.demo.model.PromoCodeType;
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
            @RequestParam String email,
            @RequestParam(required = false) PromoCodeType type) {
        PromoCodeType expectedType = type != null ? type : PromoCodeType.TENANT_DISCOUNT;
        if (expectedType == PromoCodeType.OWNER_COMMISSION_REDUCTION) {
            return ResponseEntity.ok(promoCodeService.validateForOwnerCommissionReduction(code, email));
        }
        return ResponseEntity.ok(promoCodeService.validateForTenantDiscount(code, email));
    }
}