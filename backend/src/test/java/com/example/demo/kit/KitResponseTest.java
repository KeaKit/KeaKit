package com.example.demo.kit;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;

import com.example.demo.model.DeliveryMethod;
import com.example.demo.model.ItemMemento;
import com.example.demo.model.Kit;
import com.example.demo.model.KitStatus;
import com.example.demo.model.User;
import com.example.demo.model.UserRole;
import com.example.demo.dto.KitResponse;

class KitResponseTest {

    @Test
    void constructor_proratesPricesForShortRentalPeriods() {
        User tenant = new User();
        tenant.setId(1L);
        tenant.setName("Tenant");
        tenant.setEmail("tenant@example.com");
        tenant.setRole(UserRole.USER);

        Kit kit = new Kit();
        kit.setId(10L);
        kit.setName("Kit corto");
        kit.setCountry("Spain");
        kit.setCity("Sevilla");
        kit.setStatus(KitStatus.PAID);
        kit.setTenant(tenant);
        kit.setDeliveryMethod(DeliveryMethod.MEETING_POINT);
        kit.setStartDate(LocalDate.of(2026, 5, 6));
        kit.setEndDate(LocalDate.of(2026, 5, 6));
        kit.setAppliedCommissionRate(0.1);
        kit.setAppliedGuaranteeRate(0.2);

        ItemMemento snapshot = new ItemMemento();
        snapshot.setOriginalItemId(99L);
        snapshot.setSelectedUnits(1);
        snapshot.setPriceAtRental(100.0);
        snapshot.setNameAtRental("Cámara");

        kit.setSnapshots(List.of(snapshot));

        KitResponse response = new KitResponse(kit);

        assertThat(response.getSubtotalPrice()).isEqualTo(3.33);
        assertThat(response.getGuaranteePrice()).isEqualTo(0.67);
        assertThat(response.getTotalPrice()).isEqualTo(4.0);
    }
}