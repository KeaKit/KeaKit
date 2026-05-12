package com.example.demo.service;

import static org.junit.jupiter.api.Assertions.*;

import java.lang.reflect.Method;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Locale;

import com.example.demo.dto.KitResponse;
import com.example.demo.model.ItemMemento;
import com.example.demo.model.Kit;
import com.example.demo.model.User;

import org.junit.jupiter.api.Test;

public class OrderConfirmationEmailServiceTest {

    @Test
    public void buildHtmlContent_containsTenantAndItemsAndProratedAmounts() throws Exception {
        // Arrange: create a Kit with two item snapshots
        Kit kit = new Kit();
        kit.setName("Pack Trabajo Remoto");
        kit.setCity("Sevilla");
        kit.setCountry("España");
        LocalDate start = LocalDate.of(2026, 3, 24);
        LocalDate end = LocalDate.of(2026, 3, 31);
        kit.setStartDate(start);
        kit.setEndDate(end);
        kit.setOrderDate(LocalDate.of(2026, 3, 20));

        User tenant = new User();
        tenant.setName("Miguel Al Ra");
        tenant.setEmail("miguel@example.com");
        kit.setTenant(tenant);

        ItemMemento snap1 = new ItemMemento();
        snap1.setOriginalItemId(10L);
        snap1.setNameAtRental("Instalación Software");
        snap1.setSelectedUnits(2);
        snap1.setPriceAtRental(50.0); // price per month

        ItemMemento snap2 = new ItemMemento();
        snap2.setOriginalItemId(11L);
        snap2.setNameAtRental("MacBook Pro");
        snap2.setSelectedUnits(1);
        snap2.setPriceAtRental(150.0);

        kit.setSnapshots(java.util.List.of(snap1, snap2));

        // Build KitResponse
        KitResponse kr = new KitResponse(kit);

        // Use reflection to call private buildHtmlContent(KitResponse, String)
        OrderConfirmationEmailService svc = new OrderConfirmationEmailService();
        Method m = OrderConfirmationEmailService.class.getDeclaredMethod("buildHtmlContent", KitResponse.class, String.class, Double.class, String.class);
        m.setAccessible(true);

        // Act
        String html = (String) m.invoke(svc, kr, tenant.getName(), 0.0, null);

        // Assert: contains tenant name and item names
        assertNotNull(html);
        assertTrue(html.contains("Miguel Al Ra") || html.contains("Miguel"));
        assertTrue(html.contains("Instalación Software"));
        assertTrue(html.contains("MacBook Pro"));

        // Compute expected prorated numbers using same logic as KitService ((days + 1) / 30)
        int rentalDays = (int) ChronoUnit.DAYS.between(start, end) + 1;
        if (rentalDays <= 0) rentalDays = 1;
        double factor = ((double) rentalDays) / 30.0;

        double perUnit1 = 50.0 * factor;
        double subtotal1 = perUnit1 * 2; // two units
        double perUnit2 = 150.0 * factor;
        double subtotal2 = perUnit2 * 1;
        double subtotalTotal = subtotal1 + subtotal2;

    // use language and country to ensure the currency symbol is correct (EUR)
    NumberFormat nf = NumberFormat.getCurrencyInstance(new Locale("es", "ES"));
        String perUnit1Str = nf.format(perUnit1);
        String subtotalTotalStr = nf.format(subtotalTotal);

        assertTrue(html.contains(perUnit1Str), () -> "Expected prorated per-unit string " + perUnit1Str + " in html:\n" + html);
        assertTrue(html.contains(subtotalTotalStr), () -> "Expected subtotal string " + subtotalTotalStr + " in html:\n" + html);
    }
}
