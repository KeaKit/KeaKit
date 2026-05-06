package com.example.demo.service;

import com.example.demo.model.*;
import com.example.demo.repository.CategoryRepository;
import com.example.demo.repository.ServiceRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.CustomUserDetails;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/*
 * NOTA IMPORTANTE sobre la configuración de seguridad:
 *
 * NO usamos addFilters = false porque ServiceItemController.isAuthorized() necesita
 * un Authentication real en el SecurityContextHolder. Con addFilters=false la cadena
 * de seguridad no se ejecuta y authentication llega null al controller → 403.
 *
 * En su lugar mantenemos los filtros activos y usamos
 * SecurityMockMvcRequestPostProcessors.user(new CustomUserDetails(savedOwner))
 * que inyecta el Authentication en el SecurityContext ANTES de que los filtros
 * procesen la request. JwtAuthenticationFilter comprueba si ya existe autenticación
 * (SecurityContextHolder.getContext().getAuthentication() != null) y en ese caso
 * no intenta validar ningún token — por lo que no se necesita header Authorization.
 *
 * Los endpoints públicos (GET /active, GET /{id}, POST /request, POST /release)
 * no necesitan el postprocessor porque no llaman a isAuthorized().
 */
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
@SpringBootTest
@AutoConfigureMockMvc   // ← sin addFilters=false: filtros activos
@Transactional
@ActiveProfiles("test")
class ServiceItemIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ServiceRepository serviceRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private CategoryRepository categoryRepository;
    @Autowired private ObjectMapper objectMapper;

    private User savedOwner;
    private ServiceItem savedService;
    private Category savedCategory;

    private static final LocalDate FROM  = LocalDate.now().plusDays(1);
    private static final LocalDate UNTIL = LocalDate.now().plusDays(30);

    @BeforeEach
    void setUp() {
        serviceRepository.deleteAll();

        User owner = new User();
        owner.setName("Maria");
        owner.setEmail("maria@example.com");
        owner.setPassword("password123");
        owner.setRole(UserRole.USER);
        owner.setCountry("España");
        owner.setCity("Sevilla");
        owner.setAddress("Calle Betis 1");
        owner.setPhone("123456789");
        savedOwner = userRepository.save(owner);

        Category category = new Category("Hogar", "Servicios del hogar", 10.0, 1000.0);
        category.setStatus(CategoryStatus.ACTIVE);
        savedCategory = categoryRepository.save(category);

        ServiceItem service = new ServiceItem();
        service.setTitle("Servicio de Limpieza");
        service.setDescription("Limpieza profesional del hogar");
        service.setCity("Sevilla");
        service.setPricePerMonth(150.0);
        service.setStatus(ServiceStatus.ACTIVE);
        service.setAvailableFrom(FROM);
        service.setAvailableUntil(UNTIL);
        service.setOwner(savedOwner);
        service.setCategory(savedCategory);
        savedService = serviceRepository.save(service);
    }

    // Helpers para no repetir new CustomUserDetails(savedOwner)
    private CustomUserDetails asOwner() {
        return new CustomUserDetails(savedOwner);
    }

    private CustomUserDetails asStranger() {
        User stranger = new User();
        stranger.setId(999999L);
        stranger.setEmail("stranger@example.com");
        stranger.setPassword("pwd");
        stranger.setRole(UserRole.USER);
        return new CustomUserDetails(stranger);
    }

    // ─────────────────────────── GET /active (público) ───────────────────────────

    @Test
    void testGetActiveServices_Integration() throws Exception {
        mockMvc.perform(get("/api/services/active"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].title").value("Servicio de Limpieza"))
            .andExpect(jsonPath("$[0].status").value("ACTIVE"));
    }

    @Test
    void testGetActiveServices_Integration_ExcludesDraftAndUnavailable() throws Exception {
        ServiceItem draft = new ServiceItem();
        draft.setTitle("Borrador");
        draft.setDescription("En borrador");
        draft.setCity("Madrid");
        draft.setPricePerMonth(100.0);
        draft.setStatus(ServiceStatus.DRAFT);
        draft.setAvailableFrom(FROM);
        draft.setAvailableUntil(UNTIL);
        draft.setOwner(savedOwner);
        draft.setCategory(savedCategory);
        serviceRepository.save(draft);

        ServiceItem unavailable = new ServiceItem();
        unavailable.setTitle("No Disponible");
        unavailable.setDescription("Alquilado");
        unavailable.setCity("Barcelona");
        unavailable.setPricePerMonth(200.0);
        unavailable.setStatus(ServiceStatus.UNAVAILABLE);
        unavailable.setAvailableFrom(FROM);
        unavailable.setAvailableUntil(UNTIL);
        unavailable.setOwner(savedOwner);
        unavailable.setCategory(savedCategory);
        serviceRepository.save(unavailable);

        mockMvc.perform(get("/api/services/active"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].title").value("Servicio de Limpieza"));
    }

    @Test
    void testGetActiveServices_Integration_EmptyList() throws Exception {
        serviceRepository.deleteAll();
        mockMvc.perform(get("/api/services/active"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(0));
    }

    // ─────────────────────────── GET /{id} (público) ───────────────────────────

    @Test
    void testGetServiceById_Integration_Success() throws Exception {
        mockMvc.perform(get("/api/services/" + savedService.getId()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(savedService.getId()))
            .andExpect(jsonPath("$.title").value("Servicio de Limpieza"))
            .andExpect(jsonPath("$.city").value("Sevilla"));
    }

    @Test
    void testGetServiceById_Integration_NotFound() throws Exception {
        mockMvc.perform(get("/api/services/999999"))
            .andExpect(status().isNotFound());
    }

    // ─────────────────────────── POST /promote (autenticado) ───────────────────────────

    @Test
    void testPromoteService_Integration_Success() throws Exception {
        ServiceItem newService = new ServiceItem();
        newService.setTitle("Servicio de Fontanería");
        newService.setDescription("Reparaciones de fontanería");
        newService.setCity("Málaga");
        newService.setPricePerMonth(200.0);
        newService.setAvailableFrom(FROM);
        newService.setAvailableUntil(UNTIL);

        mockMvc.perform(post("/api/services/promote")
                .param("ownerId", savedOwner.getId().toString())
                .param("categoryId", savedCategory.getId().toString())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newService))
                .with(user(asOwner())))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.title").value("Servicio de Fontanería"))
            .andExpect(jsonPath("$.status").value("ACTIVE"))
            .andExpect(jsonPath("$.city").value("Málaga"));
    }

    @Test
    void testPromoteService_Integration_Failure_OwnerMismatch() throws Exception {
        // Autenticado como stranger, ownerId=savedOwner → isAuthorized false → 403
        ServiceItem newService = new ServiceItem();
        newService.setTitle("Intento");
        newService.setDescription("Intento no autorizado");
        newService.setCity("Granada");
        newService.setPricePerMonth(120.0);
        newService.setAvailableFrom(FROM);
        newService.setAvailableUntil(UNTIL);

        mockMvc.perform(post("/api/services/promote")
                .param("ownerId", savedOwner.getId().toString())
                .param("categoryId", savedCategory.getId().toString())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newService))
                .with(user(asStranger())))
            .andExpect(status().isForbidden())
            .andExpect(content().string("You do not have permission to create services."));
    }

    @Test
    void testPromoteService_Integration_Failure_CategoryNotFound() throws Exception {
        ServiceItem newService = new ServiceItem();
        newService.setTitle("Pintura");
        newService.setDescription("Servicio de pintura interior");
        newService.setCity("Sevilla");
        newService.setPricePerMonth(100.0);
        newService.setAvailableFrom(FROM);
        newService.setAvailableUntil(UNTIL);

        mockMvc.perform(post("/api/services/promote")
                .param("ownerId", savedOwner.getId().toString())
                .param("categoryId", "999999")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newService))
                .with(user(asOwner())))
            .andExpect(status().isBadRequest())
            .andExpect(content().string("Categoría no encontrada"));
    }

    @Test
    void testPromoteService_Integration_Failure_MissingTitle() throws Exception {
        ServiceItem newService = new ServiceItem();
        newService.setDescription("Sin título");
        newService.setCity("Cádiz");
        newService.setPricePerMonth(80.0);
        newService.setAvailableFrom(FROM);
        newService.setAvailableUntil(UNTIL);

        mockMvc.perform(post("/api/services/promote")
                .param("ownerId", savedOwner.getId().toString())
                .param("categoryId", savedCategory.getId().toString())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newService))
                .with(user(asOwner())))
            .andExpect(status().isBadRequest())
            .andExpect(content().string("Título requerido"));
    }

    @Test
    void testPromoteService_Integration_Failure_NullPrice() throws Exception {
        ServiceItem newService = new ServiceItem();
        newService.setTitle("Servicio sin precio");
        newService.setDescription("Descripción");
        newService.setCity("Huelva");
        newService.setAvailableFrom(FROM);
        newService.setAvailableUntil(UNTIL);

        mockMvc.perform(post("/api/services/promote")
                .param("ownerId", savedOwner.getId().toString())
                .param("categoryId", savedCategory.getId().toString())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newService))
                .with(user(asOwner())))
            .andExpect(status().isBadRequest())
            .andExpect(content().string("El precio mensual debe ser positivo"));
    }

    @Test
    void testPromoteService_Integration_Failure_NegativePrice() throws Exception {
        ServiceItem newService = new ServiceItem();
        newService.setTitle("Precio negativo");
        newService.setDescription("Descripción");
        newService.setCity("Almería");
        newService.setPricePerMonth(-50.0);
        newService.setAvailableFrom(FROM);
        newService.setAvailableUntil(UNTIL);

        mockMvc.perform(post("/api/services/promote")
                .param("ownerId", savedOwner.getId().toString())
                .param("categoryId", savedCategory.getId().toString())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newService))
                .with(user(asOwner())))
            .andExpect(status().isBadRequest())
            .andExpect(content().string("El precio mensual debe ser positivo"));
    }

    @Test
    void testPromoteService_Integration_Failure_AvailableFromInPast() throws Exception {
        ServiceItem newService = new ServiceItem();
        newService.setTitle("Fecha pasada");
        newService.setDescription("Descripción");
        newService.setCity("Jaén");
        newService.setPricePerMonth(100.0);
        newService.setAvailableFrom(LocalDate.now().minusDays(1));
        newService.setAvailableUntil(UNTIL);

        mockMvc.perform(post("/api/services/promote")
                .param("ownerId", savedOwner.getId().toString())
                .param("categoryId", savedCategory.getId().toString())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newService))
                .with(user(asOwner())))
            .andExpect(status().isBadRequest())
            .andExpect(content().string("La fecha de inicio no puede ser en el pasado"));
    }

    @Test
    void testPromoteService_Integration_Failure_InvalidDateRange() throws Exception {
        ServiceItem newService = new ServiceItem();
        newService.setTitle("Fecha inválida");
        newService.setDescription("Descripción");
        newService.setCity("Córdoba");
        newService.setPricePerMonth(100.0);
        newService.setAvailableFrom(LocalDate.now().plusDays(20));
        newService.setAvailableUntil(LocalDate.now().plusDays(5));

        mockMvc.perform(post("/api/services/promote")
                .param("ownerId", savedOwner.getId().toString())
                .param("categoryId", savedCategory.getId().toString())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newService))
                .with(user(asOwner())))
            .andExpect(status().isBadRequest())
            .andExpect(content().string("La fecha de finalización debe ser después de la fecha de inicio"));
    }

    @Test
    void testPromoteService_Integration_Failure_MissingDates() throws Exception {
        ServiceItem newService = new ServiceItem();
        newService.setTitle("Sin fechas");
        newService.setDescription("Descripción");
        newService.setCity("Córdoba");
        newService.setPricePerMonth(100.0);

        mockMvc.perform(post("/api/services/promote")
                .param("ownerId", savedOwner.getId().toString())
                .param("categoryId", savedCategory.getId().toString())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newService))
                .with(user(asOwner())))
            .andExpect(status().isBadRequest())
            .andExpect(content().string("Debes especificar el rango de fechas (Desde/Hasta)"));
    }

    // ─────────────────────────── PUT /{id} (autenticado) ───────────────────────────

    @Test
    void testUpdateService_Integration_Success() throws Exception {
        ServiceItem updateData = new ServiceItem();
        updateData.setTitle("Limpieza Premium");

        mockMvc.perform(put("/api/services/" + savedService.getId())
                .param("ownerId", savedOwner.getId().toString())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateData))
                .with(user(asOwner())))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.title").value("Limpieza Premium"));

        ServiceItem inDb = serviceRepository.findById(savedService.getId()).orElseThrow();
        assertThat(inDb.getTitle()).isEqualTo("Limpieza Premium");
    }

    @Test
    void testUpdateService_Integration_Success_AllFields() throws Exception {
        ServiceItem updateData = new ServiceItem();
        updateData.setTitle("Título Actualizado");
        updateData.setDescription("Descripción actualizada");
        updateData.setCity("Barcelona");
        updateData.setPricePerMonth(250.0);
        updateData.setAvailableUntil(UNTIL.plusDays(10));

        mockMvc.perform(put("/api/services/" + savedService.getId())
                .param("ownerId", savedOwner.getId().toString())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateData))
                .with(user(asOwner())))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.title").value("Título Actualizado"))
            .andExpect(jsonPath("$.city").value("Barcelona"))
            .andExpect(jsonPath("$.pricePerMonth").value(250.0));
    }

    @Test
    void testUpdateService_Integration_Failure_ServiceNotFound() throws Exception {
        ServiceItem updateData = new ServiceItem();
        updateData.setTitle("Nuevo Título");

        mockMvc.perform(put("/api/services/999999")
                .param("ownerId", savedOwner.getId().toString())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateData))
                .with(user(asOwner())))
            .andExpect(status().isBadRequest())
            .andExpect(content().string("Servicio no encontrado"));
    }

    @Test
    void testUpdateService_Integration_Failure_OwnerMismatch() throws Exception {
        // Autenticado como stranger pero ownerId=savedOwner → isAuthorized false → 403
        mockMvc.perform(put("/api/services/" + savedService.getId())
                .param("ownerId", savedOwner.getId().toString())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"Intento no autorizado\"}")
                .with(user(asStranger())))
            .andExpect(status().isForbidden())
            .andExpect(content().string("You do not have permission to modify this service."));
    }

    @Test
    void testUpdateService_Integration_Failure_ServiceUnavailable() throws Exception {
        savedService.setStatus(ServiceStatus.UNAVAILABLE);
        serviceRepository.save(savedService);

        ServiceItem updateData = new ServiceItem();
        updateData.setTitle("Intentar modificar alquilado");

        mockMvc.perform(put("/api/services/" + savedService.getId())
                .param("ownerId", savedOwner.getId().toString())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateData))
                .with(user(asOwner())))
            .andExpect(status().isBadRequest())
            .andExpect(content().string("El servicio está actualmente alquilado y no puede ser modificado."));
    }

    @Test
    void testUpdateService_Integration_Failure_InvalidStatus() throws Exception {
        mockMvc.perform(put("/api/services/" + savedService.getId())
                .param("ownerId", savedOwner.getId().toString())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"status\":\"UNAVAILABLE\"}")
                .with(user(asOwner())))
            .andExpect(status().isBadRequest())
            .andExpect(content().string("El estado del servicio solo puede ser ACTIVE o DRAFT"));
    }

    @Test
    void testUpdateService_Integration_Failure_InvalidDateRange() throws Exception {
        mockMvc.perform(put("/api/services/" + savedService.getId())
                .param("ownerId", savedOwner.getId().toString())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"availableFrom\":\"" + LocalDate.now().plusDays(20) +
                         "\",\"availableUntil\":\"" + LocalDate.now().plusDays(5) + "\"}")
                .with(user(asOwner())))
            .andExpect(status().isBadRequest())
            .andExpect(content().string("La fecha de finalización debe ser después de la fecha de inicio"));
    }

    @Test
    void testUpdateService_Integration_Failure_AvailableFromInPast() throws Exception {
        mockMvc.perform(put("/api/services/" + savedService.getId())
                .param("ownerId", savedOwner.getId().toString())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"availableFrom\":\"" + LocalDate.now().minusDays(1) + "\"}")
                .with(user(asOwner())))
            .andExpect(status().isBadRequest())
            .andExpect(content().string("La fecha de inicio no puede ser en el pasado"));
    }

    @Test
    void testUpdateService_Integration_SetStatusToDraft_Success() throws Exception {
        mockMvc.perform(put("/api/services/" + savedService.getId())
                .param("ownerId", savedOwner.getId().toString())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"status\":\"DRAFT\"}")
                .with(user(asOwner())))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("DRAFT"));

        ServiceItem inDb = serviceRepository.findById(savedService.getId()).orElseThrow();
        assertThat(inDb.getStatus()).isEqualTo(ServiceStatus.DRAFT);
    }

    // ─────────────────────────── POST /{id}/request (autenticado) ───────────────────────────
    // Nota: aunque el controller no llama a isAuthorized(), SecurityConfig exige
    // autenticación en .anyRequest().authenticated() para POST sobre /api/services/**

    @Test
    void testRequestService_Integration_Success() throws Exception {
        mockMvc.perform(post("/api/services/" + savedService.getId() + "/request")
                .with(user(asOwner())))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("UNAVAILABLE"));

        ServiceItem inDb = serviceRepository.findById(savedService.getId()).orElseThrow();
        assertThat(inDb.getStatus()).isEqualTo(ServiceStatus.UNAVAILABLE);
    }

    @Test
    void testRequestService_Integration_Failure_NotActive() throws Exception {
        savedService.setStatus(ServiceStatus.DRAFT);
        serviceRepository.save(savedService);

        mockMvc.perform(post("/api/services/" + savedService.getId() + "/request")
                .with(user(asOwner())))
            .andExpect(status().isBadRequest())
            .andExpect(content().string("El servicio no está activo y no puede ser solicitado"));
    }

    @Test
    void testRequestService_Integration_Failure_AlreadyUnavailable() throws Exception {
        savedService.setStatus(ServiceStatus.UNAVAILABLE);
        serviceRepository.save(savedService);

        mockMvc.perform(post("/api/services/" + savedService.getId() + "/request")
                .with(user(asOwner())))
            .andExpect(status().isBadRequest())
            .andExpect(content().string("El servicio no está activo y no puede ser solicitado"));
    }

    @Test
    void testRequestService_Integration_Failure_NotFound() throws Exception {
        mockMvc.perform(post("/api/services/999999/request")
                .with(user(asOwner())))
            .andExpect(status().isBadRequest())
            .andExpect(content().string("Servicio no encontrado"));
    }

    // ─────────────────────────── POST /{id}/release (autenticado) ───────────────────────────

    @Test
    void testReleaseService_Integration_Success_ValidUntil() throws Exception {
        savedService.setStatus(ServiceStatus.UNAVAILABLE);
        savedService.setAvailableUntil(LocalDate.now().plusDays(10));
        serviceRepository.save(savedService);

        mockMvc.perform(post("/api/services/" + savedService.getId() + "/release")
                .with(user(asOwner())))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("ACTIVE"));

        ServiceItem inDb = serviceRepository.findById(savedService.getId()).orElseThrow();
        assertThat(inDb.getStatus()).isEqualTo(ServiceStatus.ACTIVE);
        assertThat(inDb.getAvailableFrom()).isEqualTo(LocalDate.now());
    }

    @Test
    void testReleaseService_Integration_ExpiredUntil_SetsDraft() throws Exception {
        savedService.setStatus(ServiceStatus.UNAVAILABLE);
        savedService.setAvailableUntil(LocalDate.now().minusDays(1));
        serviceRepository.save(savedService);

        mockMvc.perform(post("/api/services/" + savedService.getId() + "/release")
                .with(user(asOwner())))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("DRAFT"));

        ServiceItem inDb = serviceRepository.findById(savedService.getId()).orElseThrow();
        assertThat(inDb.getStatus()).isEqualTo(ServiceStatus.DRAFT);
    }

    @Test
    void testReleaseService_Integration_Failure_NotFound() throws Exception {
        mockMvc.perform(post("/api/services/999999/release")
                .with(user(asOwner())))
            .andExpect(status().isBadRequest())
            .andExpect(content().string("Servicio no encontrado"));
    }

    // ─────────────────────────── DELETE /{id} (autenticado) ───────────────────────────

    @Test
    void testDeleteService_Integration_Success() throws Exception {
        mockMvc.perform(delete("/api/services/" + savedService.getId())
                .param("ownerId", savedOwner.getId().toString())
                .with(user(asOwner())))
            .andExpect(status().isNoContent());

        assertThat(serviceRepository.findById(savedService.getId())).isEmpty();
    }

    @Test
    void testDeleteService_Integration_Failure_OwnerMismatch() throws Exception {
        // Autenticado como stranger → isAuthorized false → 403
        mockMvc.perform(delete("/api/services/" + savedService.getId())
                .param("ownerId", savedOwner.getId().toString())
                .with(user(asStranger())))
            .andExpect(status().isForbidden())
            .andExpect(content().string("You do not have permission to delete this service."));

        assertThat(serviceRepository.existsById(savedService.getId())).isTrue();
    }

    @Test
    void testDeleteService_Integration_Failure_ServiceNotFound() throws Exception {
        mockMvc.perform(delete("/api/services/999999")
                .param("ownerId", savedOwner.getId().toString())
                .with(user(asOwner())))
            .andExpect(status().isBadRequest())
            .andExpect(content().string("Servicio no encontrado"));
    }

    @Test
    void testDeleteService_Integration_Failure_ServiceUnavailable() throws Exception {
        savedService.setStatus(ServiceStatus.UNAVAILABLE);
        serviceRepository.save(savedService);

        mockMvc.perform(delete("/api/services/" + savedService.getId())
                .param("ownerId", savedOwner.getId().toString())
                .with(user(asOwner())))
            .andExpect(status().isBadRequest())
            .andExpect(content().string("El servicio está actualmente alquilado y no puede ser eliminado"));

        assertThat(serviceRepository.existsById(savedService.getId())).isTrue();
    }

    @Test
    void testDeleteService_Integration_DraftService_Success() throws Exception {
        savedService.setStatus(ServiceStatus.DRAFT);
        serviceRepository.save(savedService);

        mockMvc.perform(delete("/api/services/" + savedService.getId())
                .param("ownerId", savedOwner.getId().toString())
                .with(user(asOwner())))
            .andExpect(status().isNoContent());

        assertThat(serviceRepository.findById(savedService.getId())).isEmpty();
    }

    // ─────────────────────────── Flujo completo E2E ───────────────────────────

    @Test
    void testFullLifecycle_PromoteRequestRelease() throws Exception {
        // 1. Crear servicio nuevo
        ServiceItem newService = new ServiceItem();
        newService.setTitle("Jardinería Integral");
        newService.setDescription("Mantenimiento de jardines");
        newService.setCity("Valencia");
        newService.setPricePerMonth(80.0);
        newService.setAvailableFrom(FROM);
        newService.setAvailableUntil(UNTIL);

        String createResult = mockMvc.perform(post("/api/services/promote")
                .param("ownerId", savedOwner.getId().toString())
                .param("categoryId", savedCategory.getId().toString())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newService))
                .with(user(asOwner())))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.status").value("ACTIVE"))
            .andReturn().getResponse().getContentAsString();

        Long newId = objectMapper.readTree(createResult).get("id").asLong();

        // 2. Arrendatario solicita el servicio (requiere autenticación por .anyRequest().authenticated())
        mockMvc.perform(post("/api/services/" + newId + "/request")
                .with(user(asOwner())))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("UNAVAILABLE"));

        // 3. Solicitar de nuevo → error
        mockMvc.perform(post("/api/services/" + newId + "/request")
                .with(user(asOwner())))
            .andExpect(status().isBadRequest());

        // 4. Arrendatario libera el servicio (requiere autenticación)
        mockMvc.perform(post("/api/services/" + newId + "/release")
                .with(user(asOwner())))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("ACTIVE"));

        // 5. Propietario elimina el servicio
        mockMvc.perform(delete("/api/services/" + newId)
                .param("ownerId", savedOwner.getId().toString())
                .with(user(asOwner())))
            .andExpect(status().isNoContent());

        assertThat(serviceRepository.findById(newId)).isEmpty();
    }
}