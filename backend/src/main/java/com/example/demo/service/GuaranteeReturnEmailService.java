package com.example.demo.service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;

import com.example.demo.dto.KitResponse;
import com.example.demo.dto.UserResponse;
import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;

@Service
public class GuaranteeReturnEmailService {

    private final KitService kitService;
    private final UserService userService;
    private static final Logger logger = LoggerFactory.getLogger(OrderConfirmationEmailService.class);
    private static final String TEMPLATE_PATH = "guarantee-return-email.html";

    @Value("${sendgrid.api-key:}")
    private String sendGridApiKey;

    @Value("${sendgrid.from-email:no-reply@keakit.app}")
    private String fromEmail;

    GuaranteeReturnEmailService(KitService kitService, UserService userService) {
        this.kitService = kitService;
        this.userService = userService;
    }

    public void sendGuaranteeNotification(Long kitId) {

        KitResponse kit = kitService.findById(kitId);
        if (kit == null) {
            logger.warn("No se puede enviar confirmación: el kit es inválido");
            return;
        }

        UserResponse tenant = userService.getUserById(kit.getTenantId());

        if ( tenant == null || tenant.getEmail() == null || tenant.getEmail().isBlank()) {
            logger.warn("No se puede enviar confirmación: el usuario es inválido");
            return;
        }

        if (sendGridApiKey == null || sendGridApiKey.isBlank()) {
            logger.warn("SENDGRID_API_KEY no configurada. Se omite envío de correo de confirmación para kit {}", kit.getId());
            return;
        }

        String recipientEmail = tenant.getEmail();
        String tenantName = tenant.getName() != null ? tenant.getName() : "usuario";
        String subject = "Devolución de garantía - KeaKit";

        String htmlContent = buildHtmlContent(kit, tenantName);

        Mail mail = new Mail(
            new Email(fromEmail),
            subject,
            new Email(recipientEmail),
            new Content("text/html", htmlContent)
        );

        SendGrid sendGrid = new SendGrid(sendGridApiKey);
        Request request = new Request();

        try {
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());

            Response response = sendGrid.api(request);
            int statusCode = response.getStatusCode();

            if (statusCode >= 200 && statusCode < 300) {
                logger.info("Correo de devolución de garantía enviado para kit {} a {}", kit.getId(), recipientEmail);
                return;
            }

            logger.error(
                "Error al enviar correo de devolución de garantía para kit {}. Código: {}, Body: {}",
                kit.getId(),
                statusCode,
                response.getBody()
            );
        } catch (Exception ex) {
            logger.error("Excepción enviando correo de devolución de garantía para kit {}", kit.getId(), ex);
        }
    }

    private String safeValue(Object value) {
        return value == null ? "-" : String.valueOf(value);
    }

    private String buildHtmlContent(KitResponse kit, String tenantName) {
        try {
            ClassPathResource templateResource = new ClassPathResource(TEMPLATE_PATH);
            String template = StreamUtils.copyToString(templateResource.getInputStream(), StandardCharsets.UTF_8);

            return template
                .replace("{{tenantName}}", safeValue(tenantName))
                .replace("{{kitId}}", safeValue(kit.getId()))
                .replace("{{kitName}}", safeValue(kit.getName()))
                .replace("{{kitCity}}", safeValue(kit.getCity()))
                .replace("{{kitCountry}}", safeValue(kit.getCountry()))
                .replace("{{kitStartDate}}", safeValue(kit.getStartDate()))
                .replace("{{kitEndDate}}", safeValue(kit.getEndDate()))
        } catch (IOException ex) {
            logger.error("No se pudo cargar la plantilla HTML de devolución de garantía", ex);
            return "<p>Tu garantía ha sido devuelta correctamente.</p>";
        }
    }
}