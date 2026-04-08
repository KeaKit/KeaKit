package com.example.demo.controller;

import com.example.demo.dto.RgpdRequest;
import com.example.demo.dto.RgpdResponse;
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

    @GetMapping("/check")
    public ResponseEntity<RgpdResponse> checkConsent() {
        boolean hasAccepted = rgpdService.hasCurrentUserAccepted();
        System.out.println("RGPD check endpoint called - hasAccepted: " + hasAccepted);
        return ResponseEntity.ok(new RgpdResponse(hasAccepted));
    }

    @PostMapping("/accept")
    public ResponseEntity<Void> acceptConsent(
            @Valid @RequestBody RgpdRequest request,
            HttpServletRequest httpRequest) {
        String clientIp = getClientIp(httpRequest);
        System.out.println("RGPD accept endpoint called - version: " + request.getVersion() + ", ip: " + clientIp);
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
}