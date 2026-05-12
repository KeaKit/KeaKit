package com.example.demo.service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Locale;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;

import com.example.demo.model.Kit;
import com.example.demo.dto.KitResponse;
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
        sendOrderConfirmation(kit, 0.0, null);
    }

    public void sendOrderConfirmation(Kit kit, Double discountAmount, String promoCode) {
        if (kit == null) return;
        KitResponse resp = new KitResponse(kit);
        String recipientEmail = kit.getTenant() != null ? kit.getTenant().getEmail() : null;
        if (recipientEmail == null || recipientEmail.isBlank()) {
            logger.warn("No se puede enviar confirmación: email del arrendatario no encontrado en Kit id={}", kit.getId());
            return;
        }
        sendOrderConfirmation(resp, recipientEmail, kit.getId(), discountAmount, promoCode);
    }

    public void sendOrderConfirmation(KitResponse kitResponse, String explicitRecipientEmail, Long originalKitId) {
        sendOrderConfirmation(kitResponse, explicitRecipientEmail, originalKitId, 0.0, null);
    }

    public void sendOrderConfirmation(KitResponse kitResponse, String explicitRecipientEmail, Long originalKitId, Double discountAmount, String promoCode) {
        if (kitResponse == null) {
            logger.warn("No se puede enviar confirmación: kitResponse es nulo");
            return;
        }

        String recipientEmail = explicitRecipientEmail;
        if (recipientEmail == null || recipientEmail.isBlank()) {
            logger.warn("No se puede enviar confirmación: email del arrendatario no proporcionado en KitResponse id={}", kitResponse.getId());
            return;
        }

        if (sendGridApiKey == null || sendGridApiKey.isBlank()) {
            logger.warn("SENDGRID_API_KEY no configurada. Se omite envío de correo de confirmación para kit {}", kitResponse.getId());
            return;
        }

        String tenantName = kitResponse.getTenantName() != null && !kitResponse.getTenantName().isBlank()
            ? kitResponse.getTenantName()
            : "usuario";
        String subject = "Confirmación de pedido - KeaKit";

        String htmlContent = buildHtmlContent(kitResponse, tenantName, discountAmount != null ? discountAmount : 0.0, promoCode);

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
                logger.info("Correo de confirmación enviado para kit {}", kitResponse.getId());
                try {
                    if (response.getBody() != null && !response.getBody().isBlank()) {
                        logger.debug("SendGrid response body: {}", response.getBody());
                    }
                    if (response.getHeaders() != null && !response.getHeaders().isEmpty()) {
                        logger.debug("SendGrid response headers: {}", response.getHeaders());
                    }
                } catch (Exception e) {
                    logger.debug("No se pudo leer body/headers de la respuesta de SendGrid", e);
                }
                return;
            } else {
                logger.error("Error al enviar correo de confirmación para kit {}. Código: {}", kitResponse.getId(), statusCode);
            }
        } catch (Exception ex) {
            logger.error("Excepción enviando correo de confirmación para kit {}", kitResponse.getId(), ex);
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

    private String buildDiscountRow(Double discountAmount, String promoCode) {
        if (discountAmount == null || discountAmount <= 0) return "";
        NumberFormat fmt = NumberFormat.getCurrencyInstance(SPANISH_LOCALE);
        String label = promoCode != null && !promoCode.isBlank()
            ? "Descuento (" + escapeHtml(promoCode) + ")"
            : "Descuento aplicado";
        return "<tr>" +
            "<td style=\"padding: 8px 0; font-size: 14px; color: #4caf7d;\">" + label + "</td>" +
            "<td style=\"padding: 8px 0; font-size: 14px; font-weight: 700; color: #4caf7d; text-align: right;\">-" +
            safeValue(fmt.format(discountAmount)) + "</td>" +
            "</tr>";
    }

    private String buildHtmlContent(KitResponse kit, String tenantName, Double discountAmount, String promoCode) {
        try {
            ClassPathResource templateResource = new ClassPathResource(TEMPLATE_PATH);
            String template = StreamUtils.copyToString(templateResource.getInputStream(), StandardCharsets.UTF_8);

            StringBuilder itemsHtml = new StringBuilder();
            int rentalDays = 0;
            if (kit.getStartDate() != null && kit.getEndDate() != null) {
                rentalDays = (int) ChronoUnit.DAYS.between(kit.getStartDate(), kit.getEndDate()) + 1;
                if (rentalDays <= 0) rentalDays = 1;
            }
            double prorationFactor = (rentalDays > 0) ? ((double) rentalDays) / 30.0 : 0.0;

            double subtotalProrated = 0.0;
            if (kit.getItems() == null || kit.getItems().isEmpty()) {
                itemsHtml.append("<tr><td style=\"padding:12px 0; font-size:14px; color:#7a7a7a;\">No hay artículos en este pedido.</td></tr>");
            } else {
                for (var item : kit.getItems()) {
                    String name = safeValue(item.getName());
                    String qty = safeValue(item.getQuantity());
                    Double priceAtRental = item.getPricePerMonth();
                    Double perUnitProrated = null;
                    Double subtotal = 0.0;
                    if (priceAtRental != null) {
                        perUnitProrated = priceAtRental * prorationFactor;
                        if (item.getQuantity() != null) {
                            subtotal = perUnitProrated * item.getQuantity();
                            subtotalProrated += subtotal;
                        }
                    }

                    itemsHtml.append("<tr style=\"border-bottom:1px solid #e8ecf1;\">")
                        .append("<td style=\"padding:12px 8px; vertical-align:middle;\">")
                        .append("<p style=\"margin:0; font-weight:700; color:#2d6e91;\">")
                        .append(name)
                        .append("</p>")
                        .append("<p style=\"margin:4px 0 0 0; font-size:13px; color:#7a7a7a;\">Unidades seleccionadas: ")
                        .append(qty)
                        .append("</p>")
                        .append("<p style=\"margin:4px 0 0 0; font-size:13px; color:#7a7a7a;\">Precio por unidad (prorr.): ")
                        .append(formatCurrency(perUnitProrated, "-"))
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

            String orderDateStr = kit.getOrderDate() != null ? formatDate(kit.getOrderDate()) : formatDate(java.time.LocalDate.now());
            String deliveryMethodStr = kit.getDeliveryMethod() != null ? (kit.getDeliveryMethod() == com.example.demo.model.DeliveryMethod.COURIER ? "Envío por mensajería" : "Entrega en punto de encuentro") : "Pendiente de definir";

            double guaranteeRate = kit.getAppliedGuaranteeRate() != null ? kit.getAppliedGuaranteeRate() : 0.2;
            double guaranteeAmount = subtotalProrated * guaranteeRate;
            double courier = kit.getCourierPrice() != null ? kit.getCourierPrice() : 0.0;
            double totalEstimated = subtotalProrated + guaranteeAmount + courier - (discountAmount != null ? discountAmount : 0.0);

            return template
                .replace("{{tenantName}}", safeValue(tenantName))
                .replace("{{kitName}}", safeValue(kit.getName()))
                .replace("{{orderDate}}", safeValue(orderDateStr))
                .replace("{{kitCity}}", safeValue(kit.getCity()))
                .replace("{{kitCountry}}", safeValue(kit.getCountry()))
                .replace("{{kitStartDate}}", formatDate(kit.getStartDate()))
                .replace("{{kitEndDate}}", formatDate(kit.getEndDate()))
                .replace("{{deliveryMethod}}", safeValue(deliveryMethodStr))
                .replace("{{meetingPoint}}", safeValue(kit.getMeetingPoint()))
                .replace("{{courierPrice}}", formatCurrency(courier, "Incluido"))
                .replace("{{totalItems}}", safeValue(kit.getTotalSelectedItems()))
                .replace("{{totalPrice}}", formatCurrency(totalEstimated, "-"))
                .replace("{{itemsRows}}", itemsHtml.toString())
                .replace("{{subtotalPrice}}", formatCurrency(subtotalProrated, "-"))
                .replace("{{guaranteePrice}}", formatCurrency(guaranteeAmount, "-"))
                .replace("{{guaranteePercent}}", (int)(guaranteeRate * 100) + "%")
                .replace("{{discountRow}}", buildDiscountRow(discountAmount, promoCode));
        } catch (IOException ex) {
            logger.error("No se pudo cargar la plantilla HTML de confirmación (KitResponse)", ex);
            return "<p>Tu pedido ha sido confirmado correctamente. ID: " + safeValue(kit.getId()) + "</p>";
        }
    }
}