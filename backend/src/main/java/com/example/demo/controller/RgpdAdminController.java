package com.example.demo.controller;

import com.example.demo.dto.CreatePolicyRequest;
import com.example.demo.model.PrivacyPolicy;
import com.example.demo.service.PrivacyPolicyService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/rgpd")
@CrossOrigin(origins = "*")
public class RgpdAdminController {

    @Autowired
    private PrivacyPolicyService privacyPolicyService;

    @GetMapping("/current")
    public ResponseEntity<PrivacyPolicy> getCurrentPolicy() {
        PrivacyPolicy policy = privacyPolicyService.getCurrentActivePolicy();
        return ResponseEntity.ok(policy);
    }

    @GetMapping("/policies")
    public ResponseEntity<List<PrivacyPolicy>> getAllPolicies() {
        return ResponseEntity.ok(privacyPolicyService.getAllPolicies());
    }

    @PostMapping("/policies")
    public ResponseEntity<PrivacyPolicy> createNewPolicy(@Valid @RequestBody CreatePolicyRequest request) {
        PrivacyPolicy newPolicy = privacyPolicyService.createNewPolicy(request.getVersion(), request.getContent());
        return ResponseEntity.ok(newPolicy);
    }
}