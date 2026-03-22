package com.example.demo.controller;

import com.example.demo.dto.PlatformConfigRequest;
import com.example.demo.dto.PlatformConfigResponse;
import com.example.demo.service.PlatformConfigService;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/config")
@CrossOrigin(origins = "*")
public class AdminPlatformConfigController {

    @Autowired
    private PlatformConfigService platformConfigService;

    @GetMapping("/commission")
    public ResponseEntity<PlatformConfigResponse> getCommissionRate() {
        return ResponseEntity.ok(platformConfigService.getConfig());
    }

    @PutMapping("/commission")
    public ResponseEntity<PlatformConfigResponse> updateCommissionRate(
            @Valid @RequestBody PlatformConfigRequest request) {
        return ResponseEntity.ok(platformConfigService.updateCommissionRate(request));
    }
}