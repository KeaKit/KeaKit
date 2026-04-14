// config/DataLoader.java
package com.example.demo.config;

import com.example.demo.model.PrivacyPolicy;
import com.example.demo.repository.PrivacyPolicyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataLoader implements CommandLineRunner {

    @Autowired
    private PrivacyPolicyRepository privacyPolicyRepository;

    @Override
    public void run(String... args) throws Exception {
        // Crear política inicial si no existe ninguna
        if (privacyPolicyRepository.count() == 0) {
            String defaultContent = 
                "Política de Privacidad de KeaKit - Versión 1.0\n\n" +
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
                "4. Base legal\n" +
                "El tratamiento de sus datos se basa en la ejecución de un contrato (alquileres y pagos),\n" +
                "en su consentimiento (comunicaciones comerciales) y en nuestro interés legítimo (mejora del servicio).\n\n" +
                "5. Conservación de datos\n" +
                "Conservamos sus datos mientras mantenga una cuenta activa en KeaKit.\n" +
                "Los datos financieros se conservan 5-10 años por obligación legal.\n\n" +
                "6. Sus derechos\n" +
                "Tiene derecho a acceder, rectificar, suprimir, oponerse y limitar el tratamiento de sus datos.\n" +
                "También tiene derecho a la portabilidad de los mismos.\n\n" +
                "7. Contacto\n" +
                "Para ejercer sus derechos o resolver cualquier duda, contáctenos en:\n" +
                "📧 equipo.keakit@gmail.com\n\n" +
                "8. Cambios en esta política\n" +
                "Le notificaremos cualquier cambio significativo en esta política.\n\n" +
                "Fecha de entrada en vigor: " + java.time.LocalDate.now();
            
            PrivacyPolicy defaultPolicy = new PrivacyPolicy("1.0", defaultContent);
            defaultPolicy.setActive(true);
            privacyPolicyRepository.save(defaultPolicy);
            System.out.println("Política de privacidad inicial creada (versión 1.0)");
        }
    }
}