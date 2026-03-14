package com.example.demo.service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;

import com.example.demo.model.DeliveryMethod;
import com.example.demo.model.Kit;
import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;

@Service
public class OrderConfirmationEmailService {

    private static final Logger logger = LoggerFactory.getLogger(OrderConfirmationEmailService.class);
    private static final String TEMPLATE_PATH = "templates/order-confirmation-email.html";
    private static final Locale SPANISH_LOCALE = Locale.forLanguageTag("es-ES");
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    @Value("${sendgrid.api-key:}")
    private String sendGridApiKey;

    @Value("${sendgrid.from-email:no-reply@keakit.app}")
    private String fromEmail;

    public void sendOrderConfirmation(Kit kit) {
        // TODO: Utilizar KitResponse
        if (kit == null || kit.getTenant() == null || kit.getTenant().getEmail() == null || kit.getTenant().getEmail().isBlank()) {
            logger.warn("No se puede enviar confirmación: el kit o email del arrendatario es inválido");
            return;
        }

        if (sendGridApiKey == null || sendGridApiKey.isBlank()) {
            logger.warn("SENDGRID_API_KEY no configurada. Se omite envío de correo de confirmación para kit {}", kit.getId());
            return;
        }

        String recipientEmail = kit.getTenant().getEmail();
        String tenantName = kit.getTenant().getName() != null ? kit.getTenant().getName() : "usuario";
        String subject = "Confirmación de pedido - KeaKit";

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
                logger.info("Correo de confirmación enviado para kit {} a {}", kit.getId(), recipientEmail);
                return;
            }

            logger.error(
                "Error al enviar correo de confirmación para kit {}. Código: {}, Body: {}",
                kit.getId(),
                statusCode,
                response.getBody()
            );
        } catch (Exception ex) {
            logger.error("Excepción enviando correo de confirmación para kit {}", kit.getId(), ex);
        }
    }

    private String safeValue(Object value) {
        return value == null ? "-" : escapeHtml(String.valueOf(value));
    }

    private String escapeHtml(String value) {
        if (value == null) {
            return "-";
        }

        return value
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace("\"", "&quot;")
            .replace("'", "&#39;");
    }

    private String formatDate(LocalDate date) {
        return date == null ? "-" : safeValue(date.format(DATE_FORMATTER));
    }

    private String formatCurrency(Double amount, String emptyValue) {
        if (amount == null) {
            return safeValue(emptyValue);
        }

        NumberFormat currencyFormatter = NumberFormat.getCurrencyInstance(SPANISH_LOCALE);
        return safeValue(currencyFormatter.format(amount));
    }

    private String formatDeliveryMethod(Kit kit) {
        if (kit.getDeliveryMethod() == null) {
            return "Pendiente de definir";
        }

        return switch (kit.getDeliveryMethod()) {
            case COURIER -> "Envío por mensajería";
            case MEETING_POINT -> "Entrega en punto de encuentro";
        };
    }

    private String formatMeetingPoint(Kit kit) {
        if (kit.getDeliveryMethod() == DeliveryMethod.COURIER) {
            return "No aplica";
        }

        if (kit.getMeetingPoint() == null || kit.getMeetingPoint().isBlank()) {
            return "Pendiente de confirmar";
        }

        return safeValue(kit.getMeetingPoint());
    }

    private String formatCourierPrice(Kit kit) {
        if (kit.getDeliveryMethod() != DeliveryMethod.COURIER) {
            return "No aplica";
        }

        if (kit.getCourierPrice() == null || kit.getCourierPrice() <= 0) {
            return "Incluido";
        }

        return formatCurrency(kit.getCourierPrice(), "Incluido");
    }

    private String formatTotalItems(Kit kit) {
        if (kit.getSnapshots() == null || kit.getSnapshots().isEmpty()) {
            return "0";
        }

        int totalItems = kit.getSnapshots().stream()
            .mapToInt(snapshot -> snapshot.getSelectedUnits() != null ? snapshot.getSelectedUnits() : 0)
            .sum();

        return safeValue(totalItems);
    }

    private String buildHtmlContent(Kit kit, String tenantName) {
        try {
            ClassPathResource templateResource = new ClassPathResource(TEMPLATE_PATH);
            String template = StreamUtils.copyToString(templateResource.getInputStream(), StandardCharsets.UTF_8);

            StringBuilder itemsHtml = new StringBuilder();
            if (kit.getSnapshots() == null || kit.getSnapshots().isEmpty()) {
                itemsHtml.append("<tr><td style=\"padding:12px 0; font-size:14px; color:#7a7a7a;\">No hay artículos en este pedido.</td></tr>");
            } else {
                for (var snapshot : kit.getSnapshots()) {
                    String rawImg = snapshot.getImageUrlAtRental();
                    String img;
                    if (rawImg == null || rawImg.isBlank() || rawImg.equals("-")) {
                        img = "https://via.placeholder.com/64?text=Img";
                    } else {
                        img = escapeHtml(rawImg);
                    }
                    String name = safeValue(snapshot.getNameAtRental());
                    String qty = safeValue(snapshot.getSelectedUnits());
                    Double priceAtRental = snapshot.getPriceAtRental();
                    Double subtotal = null;
                    if (priceAtRental != null) {
                        int units = snapshot.getSelectedUnits() != null ? snapshot.getSelectedUnits() : 1;
                        subtotal = priceAtRental * units;
                    }

                    itemsHtml.append("<tr style=\"border-bottom:1px solid #e8ecf1;\">")
                        .append("<td style=\"padding:12px 8px; width:80px; vertical-align:middle;\">")
                        .append("<img src=\"")
                        .append(img)
                        .append("\" alt=\"")
                        .append(name)
                        .append("\" width=\"64\" height=\"64\" style=\"display:block; border-radius:8px; object-fit:cover;\" />")
                        .append("</td>")
                        .append("<td style=\"padding:12px 8px; vertical-align:middle;\">")
                        .append("<p style=\"margin:0; font-weight:700; color:#2d6e91;\">")
                        .append(name)
                        .append("</p>")
                        .append("<p style=\"margin:4px 0 0 0; font-size:13px; color:#7a7a7a;\">Cantidad: ")
                        .append(qty)
                        .append("</p>")
                        .append("</td>")
                        .append("<td style=\"padding:12px 8px; vertical-align:middle; text-align:right; width:120px;\">")
                        .append("<p style=\"margin:0; font-weight:800; color:#2d6e91;\">")
                        .append(formatCurrency(subtotal, "-"))
                        .append("</p>")
                        .append("</td>")
                        .append("</tr>");
                }
            }

            return template
                .replace("{{tenantName}}", safeValue(tenantName))
                .replace("{{kitId}}", safeValue(kit.getId()))
                .replace("{{kitName}}", safeValue(kit.getName()))
                .replace("{{orderDate}}", formatDate(kit.getOrderDate()))
                .replace("{{kitCity}}", safeValue(kit.getCity()))
                .replace("{{kitCountry}}", safeValue(kit.getCountry()))
                .replace("{{kitStartDate}}", formatDate(kit.getStartDate()))
                .replace("{{kitEndDate}}", formatDate(kit.getEndDate()))
                .replace("{{deliveryMethod}}", safeValue(formatDeliveryMethod(kit)))
                .replace("{{meetingPoint}}", formatMeetingPoint(kit))
                .replace("{{courierPrice}}", formatCourierPrice(kit))
                .replace("{{totalItems}}", formatTotalItems(kit))
                .replace("{{totalPrice}}", formatCurrency(kit.calculateTotal(), "-"))
                .replace("{{itemsRows}}", itemsHtml.toString());
        } catch (IOException ex) {
            logger.error("No se pudo cargar la plantilla HTML de confirmación", ex);
            return "<p>Tu pedido ha sido confirmado correctamente. ID: " + safeValue(kit.getId()) + "</p>";
        }
    }
}