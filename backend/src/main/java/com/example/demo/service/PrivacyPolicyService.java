package com.example.demo.service;

import com.example.demo.model.PrivacyPolicy;
import com.example.demo.repository.PrivacyPolicyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PrivacyPolicyService {

    @Autowired
    private PrivacyPolicyRepository privacyPolicyRepository;

    public PrivacyPolicy getCurrentActivePolicy() {
        return privacyPolicyRepository.findTopByActiveTrueOrderByCreatedAtDesc()
                .orElseGet(() -> {
                    PrivacyPolicy defaultPolicy = new PrivacyPolicy("1.0", getDefaultPolicyContent());
                    defaultPolicy.setActive(true);
                    return privacyPolicyRepository.save(defaultPolicy);
                });
    }

    public List<PrivacyPolicy> getAllPolicies() {
        return privacyPolicyRepository.findAll();
    }

    @Transactional
    public PrivacyPolicy createNewPolicy(String version, String content) {
        // Desactivar políticas anteriores
        List<PrivacyPolicy> allPolicies = privacyPolicyRepository.findAll();
        for (PrivacyPolicy policy : allPolicies) {
            policy.setActive(false);
            privacyPolicyRepository.save(policy);
        }
        
        // Crear nueva política activa
        PrivacyPolicy newPolicy = new PrivacyPolicy(version, content);
        newPolicy.setActive(true);
        
        return privacyPolicyRepository.save(newPolicy);
    }

    private String getDefaultPolicyContent() {
        return "Política de Privacidad de KeaKit - Versión 1.0\n\n" +
               "1. Responsable del tratamiento\n" +
               "KeaKit es el responsable del tratamiento de sus datos personales.\n\n" +
               "2. Datos que recogemos\n" +
               "Recogemos su nombre, email, teléfono, dirección, ciudad y país.\n" +
               "También recogemos información sobre sus transacciones y actividad en la plataforma.\n\n" +
               "3. Finalidad del tratamiento\n" +
               "- Gestionar su cuenta de usuario\n" +
               "- Procesar alquileres de artículos, kits y servicios\n" +
               "- Gestionar pagos a través de wallet y Stripe\n" +
               "- Enviar notificaciones sobre el estado de sus alquileres\n" +
               "- Resolver incidencias y gestionar valoraciones\n" +
               "- Mejorar y personalizar nuestros servicios\n\n" +
               "4. Sus derechos\n" +
               "Tiene derecho a acceder, rectificar, suprimir, oponerse y limitar el tratamiento de sus datos.\n" +
               "Para ejercer sus derechos, contáctenos en: equipo.keakit@gmail.com";
    }
}