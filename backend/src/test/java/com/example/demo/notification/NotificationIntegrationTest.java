package com.example.demo.notification;

import com.example.demo.model.*;
import com.example.demo.repository.ArticleRepository;
import com.example.demo.repository.CategoryRepository;
import com.example.demo.repository.KitRepository;
import com.example.demo.repository.NotificationRepository;
import com.example.demo.repository.ServiceRepository;
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

    @Autowired
    private ArticleRepository articleRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ServiceRepository serviceRepository;

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

    // ── CU-ARRENDADOR-06: ALERTA DE DEMANDA ────────────────────────────────

    @Test
    void demandAlert_flow_create_appears_in_owner_inbox() throws Exception {
        // 1. SETUP: arrendador y arrendatario
        User owner = new User();
        owner.setEmail("owner@demand.com");
        owner.setPassword("password123");
        owner.setName("Propietario");
        owner.setRole(UserRole.USER);
        owner.setPhone("+34111111111");
        owner.setAddress("Calle Falsa 1");
        owner.setCity("Madrid");
        owner.setCountry("Spain");
        owner = userRepository.save(owner);

        User requester = new User();
        requester.setEmail("requester@demand.com");
        requester.setPassword("password123");
        requester.setName("Arrendatario");
        requester.setRole(UserRole.USER);
        requester.setPhone("+34222222222");
        requester.setAddress("Calle Verdadera 2");
        requester.setCity("Madrid");
        requester.setCountry("Spain");
        requester = userRepository.save(requester);

        // Categoría obligatoria para el artículo
        Category category = new Category();
        category.setName("Herramientas-" + System.currentTimeMillis());
        category.setDescription("Herramientas del hogar");
        category.setStatus(CategoryStatus.ACTIVE);
        category.setMinPrice(5.0);
        category.setMaxPrice(200.0);
        category = categoryRepository.save(category);

        // Artículo RENTED (no disponible)
        Article article = new Article();
        article.setTitle("Taladro Profesional");
        article.setDescription("Taladro de gran potencia");
        article.setCity("Madrid");
        article.setPricePerMonth(15.0);
        article.setStatus(ArticleStatus.RENTED);
        article.setOwner(owner);
        article.setCategory(category);
        article = articleRepository.save(article);

        final Long ownerId = owner.getId();
        final Long requesterId = requester.getId();
        final Long articleId = article.getId();

        // 2. CREAR ALERTA DE DEMANDA VÍA ENDPOINT
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                .post("/api/notifications/demand-alert")
                .param("articleId", String.valueOf(articleId))
                .param("requesterId", String.valueOf(requesterId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.type").value("DEMAND_ALERT"))
                .andExpect(jsonPath("$.relatedArticleId").value(articleId))
                .andExpect(jsonPath("$.read").value(false));

        // 3. VERIFICAR QUE APARECE EN EL BUZÓN DEL ARRENDADOR
        mockMvc.perform(get("/api/notifications/user/" + ownerId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].type").value("DEMAND_ALERT"))
                .andExpect(jsonPath("$[0].relatedArticleId").value(articleId))
                .andExpect(jsonPath("$[0].read").value(false));

        // 4. VERIFICAR REGLA: artículo disponible no genera alerta
        article.setStatus(ArticleStatus.AVAILABLE);
        articleRepository.save(article);

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                .post("/api/notifications/demand-alert")
                .param("articleId", String.valueOf(articleId))
                .param("requesterId", String.valueOf(requesterId)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void demandAlert_service_flow_relatedArticleIdIsNull() throws Exception {
        // 1. SETUP: propietario y solicitante
        User owner = new User();
        owner.setEmail("svc-owner@demand.com");
        owner.setPassword("password123");
        owner.setName("Propietario Servicio");
        owner.setRole(UserRole.USER);
        owner.setPhone("+34600000001");
        owner.setAddress("Calle Servicio 1");
        owner.setCity("Sevilla");
        owner.setCountry("Spain");
        owner = userRepository.save(owner);

        User requester = new User();
        requester.setEmail("svc-requester@demand.com");
        requester.setPassword("password123");
        requester.setName("Cliente Servicio");
        requester.setRole(UserRole.USER);
        requester.setPhone("+34600000002");
        requester.setAddress("Calle Cliente 2");
        requester.setCity("Sevilla");
        requester.setCountry("Spain");
        requester = userRepository.save(requester);

        Category category = new Category();
        category.setName("Servicios-" + System.currentTimeMillis());
        category.setDescription("Servicios del hogar");
        category.setStatus(CategoryStatus.ACTIVE);
        category.setMinPrice(10.0);
        category.setMaxPrice(500.0);
        category = categoryRepository.save(category);

        // Servicio UNAVAILABLE (sin unidades disponibles)
        ServiceItem service = new ServiceItem();
        service.setTitle("Fontanería Urgente");
        service.setDescription("Reparaciones de fontanería");
        service.setCity("Sevilla");
        service.setPricePerMonth(120.0);
        service.setAvailableFrom(java.time.LocalDate.now());
        service.setAvailableUntil(java.time.LocalDate.now().plusMonths(6));
        service.setStatus(ServiceStatus.UNAVAILABLE);
        service.setOwner(owner);
        service.setCategory(category);
        service = serviceRepository.save(service);

        final Long ownerId = owner.getId();
        final Long requesterId = requester.getId();
        final Long serviceId = service.getId();

        // 2. CREAR ALERTA DE DEMANDA VÍA ENDPOINT
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                .post("/api/notifications/demand-alert")
                .param("articleId", String.valueOf(serviceId))
                .param("requesterId", String.valueOf(requesterId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.type").value("DEMAND_ALERT"))
                .andExpect(jsonPath("$.relatedArticleId").doesNotExist())
                .andExpect(jsonPath("$.read").value(false))
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("contratar tu servicio")));

        // 3. VERIFICAR QUE APARECE EN EL BUZÓN DEL ARRENDADOR SIN relatedArticleId
        mockMvc.perform(get("/api/notifications/user/" + ownerId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].type").value("DEMAND_ALERT"))
                .andExpect(jsonPath("$[0].relatedArticleId").doesNotExist())
                .andExpect(jsonPath("$[0].read").value(false));
    }
}