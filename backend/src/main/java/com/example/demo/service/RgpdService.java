package com.example.demo.service;

import com.example.demo.model.PrivacyPolicy;
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
    
    @Autowired
    private PrivacyPolicyService privacyPolicyService;

    // Devuelve si el usuario necesita re-aceptar la política
    public boolean needsConsent() {
        try {
            Long userId = authService.getAuthenticatedUserId();
            if (userId == null) return false;
            
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) return false;
            
            PrivacyPolicy currentPolicy = privacyPolicyService.getCurrentActivePolicy();
            if (currentPolicy == null) return true;
            
            return rgpdConsentRepository.findByUser(user)
                .map(consent -> !consent.getAcceptedVersion().equals(currentPolicy.getVersion()))
                .orElse(true);
        } catch (Exception e) {
            return true;
        }
    }
    
    // Obtener la versión actual de la política
    public String getCurrentPolicyVersion() {
        PrivacyPolicy policy = privacyPolicyService.getCurrentActivePolicy();
        return policy != null ? policy.getVersion() : "1.0";
    }
    
    // Obtener el contenido actual de la política
    public String getCurrentPolicyContent() {
        PrivacyPolicy policy = privacyPolicyService.getCurrentActivePolicy();
        return policy != null ? policy.getContent() : "";
    }

    public boolean hasCurrentUserAccepted() {
        try {
            Long userId = authService.getAuthenticatedUserId();
            if (userId == null) return false;
            
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) return false;
            
            PrivacyPolicy currentPolicy = privacyPolicyService.getCurrentActivePolicy();
            if (currentPolicy == null) return false;
            
            return rgpdConsentRepository.findByUser(user)
                .map(consent -> consent.getAcceptedVersion().equals(currentPolicy.getVersion()))
                .orElse(false);
        } catch (Exception e) {
            return false;
        }
    }

    @Transactional
    public void recordConsent(String version, String ipAddress) {
        Long userId = authService.getAuthenticatedUserId();
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        // Buscar si ya existe un consentimiento para este usuario
        RgpdConsent existingConsent = rgpdConsentRepository.findByUser(user).orElse(null);
        
        if (existingConsent != null) {
            // Actualizar el existente en lugar de crear uno nuevo
            existingConsent.setAcceptedVersion(version);
            existingConsent.setAcceptedAt(LocalDateTime.now());
            existingConsent.setIpAddress(ipAddress);
            rgpdConsentRepository.save(existingConsent);
            System.out.println("Consentimiento actualizado para usuario: " + userId + " a versión: " + version);
        } else {
            // Crear nuevo consentimiento
            RgpdConsent consent = new RgpdConsent();
            consent.setUser(user);
            consent.setAcceptedVersion(version);
            consent.setAcceptedAt(LocalDateTime.now());
            consent.setIpAddress(ipAddress);
            rgpdConsentRepository.save(consent);
            System.out.println("Nuevo consentimiento creado para usuario: " + userId + " versión: " + version);
        }
    }
}