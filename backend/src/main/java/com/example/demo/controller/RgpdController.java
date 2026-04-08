// controller/RgpdController.java - MODIFICADO
package com.example.demo.controller;

import com.example.demo.dto.RgpdRequest;
import com.example.demo.dto.RgpdResponse;
import com.example.demo.model.PrivacyPolicy;
import com.example.demo.dto.PolicyInfoResponse;
import com.example.demo.service.PrivacyPolicyService;
import com.example.demo.service.RgpdService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/rgpd")
@CrossOrigin(origins = "*")
public class RgpdController {

    @Autowired
    private RgpdService rgpdService;

    @Autowired
    private PrivacyPolicyService privacyPolicyService;

    @GetMapping("/check")
    public ResponseEntity<RgpdResponse> checkConsent() {
        boolean hasAccepted = rgpdService.hasCurrentUserAccepted();
        return ResponseEntity.ok(new RgpdResponse(hasAccepted));
    }

    @GetMapping("/needs-consent")
    public ResponseEntity<PolicyInfoResponse> needsConsent() {
        boolean needsConsent = rgpdService.needsConsent();
        String version = rgpdService.getCurrentPolicyVersion();
        String content = rgpdService.getCurrentPolicyContent();
        return ResponseEntity.ok(new PolicyInfoResponse(needsConsent, version, content));
    }

    @PostMapping("/accept")
    public ResponseEntity<Void> acceptConsent(
            @Valid @RequestBody RgpdRequest request,
            HttpServletRequest httpRequest) {
        String clientIp = getClientIp(httpRequest);
        rgpdService.recordConsent(request.getVersion(), clientIp);
        return ResponseEntity.ok().build();
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty()) {
            ip = request.getRemoteAddr();
        }
        if (ip == null || ip.isEmpty() || "0:0:0:0:0:0:0:1".equals(ip) || "127.0.0.1".equals(ip)) {
            ip = "unknown";
        }
        return ip;
    }

    @GetMapping("/current-policy")
    public ResponseEntity<PrivacyPolicy> getCurrentPublicPolicy() {
        PrivacyPolicy policy = privacyPolicyService.getCurrentActivePolicy();
        return ResponseEntity.ok(policy);
    }
    
}