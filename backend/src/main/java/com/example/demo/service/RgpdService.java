package com.example.demo.service;

import com.example.demo.model.RgpdConsent;
import com.example.demo.model.User;
import com.example.demo.repository.RgpdConsentRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class RgpdService {

    @Autowired
    private AuthService authService;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RgpdConsentRepository rgpdConsentRepository;

    public boolean hasCurrentUserAccepted() {
        try {
            Long userId = authService.getAuthenticatedUserId();
            if (userId == null) {
                System.out.println("RGPD check: userId es null");
                return false;
            }
            
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                System.out.println("RGPD check: User no encontrado para ID: " + userId);
                return false;
            }
            
            boolean exists = rgpdConsentRepository.existsByUser(user);
            System.out.println("RGPD check for user " + userId + " (" + user.getEmail() + "): " + exists);
            return exists;
        } catch (Exception e) {
            System.out.println("RGPD check error: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    @Transactional
    public void recordConsent(String version, String ipAddress) {
        Long userId = authService.getAuthenticatedUserId();
        System.out.println("Recording consent for user: " + userId + ", version: " + version);
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        // Eliminar consentimiento existente
        rgpdConsentRepository.findByUser(user).ifPresent(existing -> {
            System.out.println("Removing existing consent for user: " + userId);
            rgpdConsentRepository.delete(existing);
        });
        
        // Crear nuevo consentimiento
        RgpdConsent consent = new RgpdConsent();
        consent.setUser(user);
        consent.setAcceptedVersion(version);
        consent.setAcceptedAt(LocalDateTime.now());
        consent.setIpAddress(ipAddress);
        
        rgpdConsentRepository.save(consent);
        System.out.println("Consent saved successfully for user: " + userId);
    }
}