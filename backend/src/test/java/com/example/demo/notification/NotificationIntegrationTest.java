package com.example.demo.notification;

import com.example.demo.model.*;
import com.example.demo.repository.KitRepository;
import com.example.demo.repository.NotificationRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.NotificationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@Transactional
@ActiveProfiles("test")
class NotificationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private KitRepository kitRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Test
    void notification_flow_trigger_fetch_and_read() throws Exception {
        // 1. SETUP DE LA BASE DE DATOS
        User landlord = new User();
        landlord.setEmail("landlord@noti.com");
        landlord.setPassword("password123");
        landlord.setName("Landlord");
        landlord.setRole(UserRole.USER);
        // Campos obligatorios para el User
        landlord.setPhone("+34111111111");
        landlord.setAddress("Address");
        landlord.setCity("City");
        landlord.setCountry("Country");
        landlord = userRepository.save(landlord);

        // Campos obligatorios para que el ItemMemento pase la validación de persistencia
        ItemMemento memento = new ItemMemento();
        memento.setOwnerAtRental(landlord);
        memento.setOriginalItemId(1L);
        memento.setPriceAtRental(15.0);
        memento.setSelectedUnits(1);
        memento.setNameAtRental("Objeto de prueba");
        memento.setSelectedMethod(DeliveryMethod.MEETING_POINT);

        Kit kit = new Kit();
        kit.setName("Kit de Supervivencia");
        kit.setStatus(KitStatus.ACTIVE);
        // Configuramos la fecha exacta para que el Cron Job lo detecte
        kit.setEndDate(LocalDate.now().plusDays(2)); 
        kit.setSnapshots(List.of(memento));
        kit = kitRepository.save(kit);

        // 2. DISPARAR EL JOB MANUALMENTE
        // Simulamos que ha llegado la hora de ejecutar el trabajo programado
        notificationService.checkUpcomingReturns();

        // Verificamos a nivel de repositorio que se ha creado la notificación físicamente
        var notificationsInDb = notificationRepository.findByUserIdOrderByCreatedAtDesc(landlord.getId());
        assertThat(notificationsInDb).hasSize(1);
        Long notificationId = notificationsInDb.get(0).getId();

        // 3. CONSULTAR EL ENDPOINT DEL CONTROLADOR
        mockMvc.perform(get("/api/notifications/user/" + landlord.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].type").value("RETURN_REMINDER"))
                .andExpect(jsonPath("$[0].read").value(false));

        // 4. MARCAR COMO LEÍDA A TRAVÉS DEL ENDPOINT
        mockMvc.perform(patch("/api/notifications/" + notificationId + "/read"))
                .andExpect(status().isOk());

        // 5. VALIDAR LA ACTUALIZACIÓN FINAL EN LA BASE DE DATOS
        var finalNotification = notificationRepository.findById(notificationId).orElseThrow();
        assertThat(finalNotification.isRead()).isTrue();
    }
}