package com.example.demo.service;

import com.example.demo.dto.PromoCodeValidationResponse;
import com.example.demo.model.*;
import com.example.demo.repository.CategoryRepository;
import com.example.demo.repository.ServiceRepository;
import com.example.demo.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import com.example.demo.dto.ServiceWithRentalsDTO;
import com.example.demo.repository.KitRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ServiceItemServiceTest {

    @Mock private ServiceRepository serviceRepository;
    @Mock private UserRepository userRepository;
    @Mock private CategoryRepository categoryRepository;
    @Mock private PromoCodeService promoCodeService;
    @Mock private KitRepository kitRepository;


    @InjectMocks
    private ServiceItemService serviceItemService;

    private User owner;
    private Category category;
    private ServiceItem service;

    private static final LocalDate FROM  = LocalDate.now().plusDays(1);
    private static final LocalDate UNTIL = LocalDate.now().plusDays(30);

    @BeforeEach
    void setUp() {
        owner = new User();
        owner.setId(1L);
        owner.setName("Owner");
        owner.setEmail("owner@example.com");
        owner.setPassword("password123");
        owner.setRole(UserRole.USER);
        owner.setPhone("123456789");
        owner.setAddress("Calle 1");
        owner.setCity("Madrid");
        owner.setCountry("España");

        category = new Category("Mantenimiento", "Servicios de mantenimiento", 5.0, 500.0);
        category.setId(1L);
        category.setStatus(CategoryStatus.ACTIVE);

        service = new ServiceItem();
        service.setId(1L);
        service.setTitle("Servicio de Limpieza");
        service.setDescription("Limpieza profesional del hogar");
        service.setCity("Madrid");
        service.setPricePerMonth(100.0);
        service.setStatus(ServiceStatus.ACTIVE);
        service.setAvailableFrom(FROM);
        service.setAvailableUntil(UNTIL);
        service.setOwner(owner);
        service.setCategory(category);

        when(userRepository.findById(1L)).thenReturn(Optional.of(owner));
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
    }

    // Helper para crear un ServiceItem simple
    private ServiceItem makeService(Long id, ServiceStatus status) {
        ServiceItem s = new ServiceItem();
        s.setId(id);
        s.setTitle("Servicio Test");
        s.setDescription("Descripción");
        s.setCity("Madrid");
        s.setPricePerMonth(100.0);
        s.setAvailableFrom(FROM);
        s.setAvailableUntil(UNTIL);
        s.setStatus(status);
        s.setOwner(owner);
        s.setCategory(category);
        return s;
    }


    @Test
    void findAll_returnsAllServices() {
        List<ServiceItem> list = List.of(
            makeService(1L, ServiceStatus.ACTIVE),
            makeService(2L, ServiceStatus.DRAFT)
        );
        when(serviceRepository.findAll()).thenReturn(list);

        List<ServiceItem> result = serviceItemService.findAll();

        assertThat(result).hasSize(2);
        verify(serviceRepository).findAll();
    }


    @Test
    void findAllActive_returnsOnlyActiveServices() {
        List<ServiceItem> actives = List.of(makeService(1L, ServiceStatus.ACTIVE));
        when(serviceRepository.findByStatus(ServiceStatus.ACTIVE)).thenReturn(actives);

        List<ServiceItem> result = serviceItemService.findAllActive();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getStatus()).isEqualTo(ServiceStatus.ACTIVE);
        verify(serviceRepository).findByStatus(ServiceStatus.ACTIVE);
    }

    @Test
    void findAllActive_emptyList_returnsEmpty() {
        when(serviceRepository.findByStatus(ServiceStatus.ACTIVE)).thenReturn(List.of());

        List<ServiceItem> result = serviceItemService.findAllActive();

        assertThat(result).isEmpty();
    }


    @Test
    void findById_found_returnsService() {
        when(serviceRepository.findById(1L)).thenReturn(Optional.of(service));

        ServiceItem result = serviceItemService.findById(1L);

        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getTitle()).isEqualTo("Servicio de Limpieza");
    }

    @Test
    void findById_notFound_throws() {
        when(serviceRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> serviceItemService.findById(99L));
    assertThat(ex.getMessage()).contains("Servicio no encontrado");
    }


    @Test
    void findByOwner_returnsServicesByOwner() {
        List<ServiceItem> ownerServices = List.of(service);
        when(serviceRepository.findByOwnerId(1L)).thenReturn(ownerServices);
        when(kitRepository.countActiveAndFutureRentedUnits(eq(1L), any(LocalDate.class))).thenReturn(1);

        List<ServiceWithRentalsDTO> result = serviceItemService.findByOwner(1L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).id()).isEqualTo(1L);
        verify(serviceRepository).findByOwnerId(1L);
verify(kitRepository).countActiveAndFutureRentedUnits(eq(1L), any(LocalDate.class));
    }

    @Test
    void findByOwner_noServices_returnsEmpty() {
        when(serviceRepository.findByOwnerId(99L)).thenReturn(List.of());

        List<ServiceWithRentalsDTO> result = serviceItemService.findByOwner(99L);

        assertThat(result).isEmpty();
    }


    @Test
    void createAndPromote_success_returnsActiveService() {
        when(serviceRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ServiceItem newService = new ServiceItem();
        newService.setTitle("Fontanería");
        newService.setDescription("Servicio de fontanería profesional");
        newService.setCity("Barcelona");
        newService.setPricePerMonth(150.0);
        newService.setAvailableFrom(FROM);
        newService.setAvailableUntil(UNTIL);

        ServiceItem result = serviceItemService.createAndPromote(newService, 1L, 1L);

        assertThat(result.getStatus()).isEqualTo(ServiceStatus.ACTIVE);
        assertThat(result.getOwner()).isEqualTo(owner);
        assertThat(result.getCategory()).isEqualTo(category);
        verify(serviceRepository).save(any());
    }

    @Test
    void createAndPromote_userNotFound_throws() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        ServiceItem newService = makeService(null, null);

        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> serviceItemService.createAndPromote(newService, 99L, 1L));
        assertThat(ex.getMessage()).contains("Usuario no encontrado");
    }

    @Test
    void createAndPromote_categoryNotFound_throws() {
        when(categoryRepository.findById(99L)).thenReturn(Optional.empty());

        ServiceItem newService = makeService(null, null);

        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> serviceItemService.createAndPromote(newService, 1L, 99L));
        assertThat(ex.getMessage()).contains("Categoría no encontrada");
    }

    @Test
    void createAndPromote_missingTitle_throws() {
        ServiceItem newService = makeService(null, null);
        newService.setTitle(null);

        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> serviceItemService.createAndPromote(newService, 1L, 1L));
        assertThat(ex.getMessage()).contains("Título requerido");
    }

    @Test
    void createAndPromote_emptyTitle_throws() {
        ServiceItem newService = makeService(null, null);
        newService.setTitle("");

        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> serviceItemService.createAndPromote(newService, 1L, 1L));
        assertThat(ex.getMessage()).contains("Título requerido");
    }

    @Test
    void createAndPromote_missingCity_throws() {
        ServiceItem newService = makeService(null, null);
        newService.setCity(null);

        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> serviceItemService.createAndPromote(newService, 1L, 1L));
        assertThat(ex.getMessage()).contains("Ciudad requerida");
    }

    @Test
    void createAndPromote_emptyCity_throws() {
        ServiceItem newService = makeService(null, null);
        newService.setCity("");

        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> serviceItemService.createAndPromote(newService, 1L, 1L));
        assertThat(ex.getMessage()).contains("Ciudad requerida");
    }

    @Test
    void createAndPromote_nullPrice_throws() {
        ServiceItem newService = makeService(null, null);
        newService.setPricePerMonth(null);

        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> serviceItemService.createAndPromote(newService, 1L, 1L));
        assertThat(ex.getMessage()).contains("El precio mensual debe ser positivo");
    }

    @Test
    void createAndPromote_negativePrice_throws() {
        ServiceItem newService = makeService(null, null);
        newService.setPricePerMonth(-10.0);

        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> serviceItemService.createAndPromote(newService, 1L, 1L));
        assertThat(ex.getMessage()).contains("El precio mensual debe ser positivo");
    }

    @Test
    void createAndPromote_zeroPricePerMonth_throws() {
        ServiceItem newService = makeService(null, null);
        newService.setPricePerMonth(0.0);

        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> serviceItemService.createAndPromote(newService, 1L, 1L));
        assertThat(ex.getMessage()).contains("El precio mensual debe ser positivo");
    }

    @Test
    void createAndPromote_nullDates_throws() {
        ServiceItem newService = makeService(null, null);
        newService.setAvailableFrom(null);
        newService.setAvailableUntil(null);

        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> serviceItemService.createAndPromote(newService, 1L, 1L));
        assertThat(ex.getMessage()).contains("Debes especificar el rango de fechas");
    }

    @Test
    void createAndPromote_availableFromInPast_throws() {
        ServiceItem newService = makeService(null, null);
        newService.setAvailableFrom(LocalDate.now().minusDays(1));

        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> serviceItemService.createAndPromote(newService, 1L, 1L));
        assertThat(ex.getMessage()).contains("La fecha de inicio no puede ser en el pasado");
    }

    @Test
    void createAndPromote_availableUntilBeforeFrom_throws() {
        ServiceItem newService = makeService(null, null);
        newService.setAvailableFrom(LocalDate.now().plusDays(10));
        newService.setAvailableUntil(LocalDate.now().plusDays(5));

        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> serviceItemService.createAndPromote(newService, 1L, 1L));
        assertThat(ex.getMessage()).contains("La fecha de finalización debe ser después de la fecha de inicio");
    }

    @Test
    void createAndPromote_untilInPast_setsStatusDraft() {
        when(serviceRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ServiceItem newService = makeService(null, null);
        newService.setAvailableFrom(LocalDate.now());
        newService.setAvailableUntil(LocalDate.now().minusDays(1));
        assertThatThrownBy(() -> serviceItemService.createAndPromote(newService, 1L, 1L))
            .isInstanceOf(RuntimeException.class)
            .hasMessage("La fecha de finalización debe ser después de la fecha de inicio");
    }


    @Test
    void update_success_updatesAllFields() {
        when(serviceRepository.findById(1L)).thenReturn(Optional.of(service));
        when(serviceRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ServiceItem updateData = new ServiceItem();
        updateData.setTitle("Nuevo Título");
        updateData.setDescription("Nueva descripción");
        updateData.setCity("Barcelona");
        updateData.setPricePerMonth(200.0);
        updateData.setAvailableFrom(LocalDate.now().plusDays(2));
        updateData.setAvailableUntil(LocalDate.now().plusDays(60));

        ServiceItem result = serviceItemService.update(1L, 1L, updateData);

        assertThat(result.getTitle()).isEqualTo("Nuevo Título");
        assertThat(result.getDescription()).isEqualTo("Nueva descripción");
        assertThat(result.getCity()).isEqualTo("Barcelona");
        assertThat(result.getPricePerMonth()).isEqualTo(200.0);
    }

    @Test
    void update_onlyTitle_updatesOnlyTitle() {
        when(serviceRepository.findById(1L)).thenReturn(Optional.of(service));
        when(serviceRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ServiceItem updateData = new ServiceItem();
        updateData.setTitle("Solo Título");

        ServiceItem result = serviceItemService.update(1L, 1L, updateData);

        assertThat(result.getTitle()).isEqualTo("Solo Título");
        assertThat(result.getCity()).isEqualTo("Madrid"); // no cambiado
    }

    @Test
    void update_serviceNotFound_throws() {
        when(serviceRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> serviceItemService.update(99L, 1L, new ServiceItem()));
        assertThat(ex.getMessage()).contains("Servicio no encontrado");
    }

    @Test
    void update_notOwner_throws() {
        ServiceItem s = makeService(2L, ServiceStatus.ACTIVE);
        User otherOwner = new User();
        otherOwner.setId(99L);
        s.setOwner(otherOwner);
        when(serviceRepository.findById(2L)).thenReturn(Optional.of(s));

        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> serviceItemService.update(2L, 1L, new ServiceItem()));
        assertThat(ex.getMessage()).contains("Solo el propietario puede modificar este servicio");
    }

    @Test
    void update_serviceUnavailable_throws() {
        ServiceItem s = makeService(3L, ServiceStatus.UNAVAILABLE);
        when(serviceRepository.findById(3L)).thenReturn(Optional.of(s));

        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> serviceItemService.update(3L, 1L, new ServiceItem()));
        assertThat(ex.getMessage()).contains("alquilado y no puede ser modificado");
    }

    @Test
    void update_statusSetToActive_succeeds() {
        when(serviceRepository.findById(1L)).thenReturn(Optional.of(service));
        when(serviceRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ServiceItem updateData = new ServiceItem();
        updateData.setStatus(ServiceStatus.ACTIVE);

        ServiceItem result = serviceItemService.update(1L, 1L, updateData);

        assertThat(result.getStatus()).isEqualTo(ServiceStatus.ACTIVE);
    }

    @Test
    void update_statusSetToDraft_succeeds() {
        when(serviceRepository.findById(1L)).thenReturn(Optional.of(service));
        when(serviceRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ServiceItem updateData = new ServiceItem();
        updateData.setStatus(ServiceStatus.DRAFT);

        ServiceItem result = serviceItemService.update(1L, 1L, updateData);

        assertThat(result.getStatus()).isEqualTo(ServiceStatus.DRAFT);
    }

    @Test
    void update_statusSetToUnavailable_throws() {
        when(serviceRepository.findById(1L)).thenReturn(Optional.of(service));

        ServiceItem updateData = new ServiceItem();
        updateData.setStatus(ServiceStatus.UNAVAILABLE);

        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> serviceItemService.update(1L, 1L, updateData));
        assertThat(ex.getMessage()).contains("El estado del servicio solo puede ser ACTIVE o DRAFT");
    }

    @Test
    void update_availableFromChanged_triggersDateValidation() {
        when(serviceRepository.findById(1L)).thenReturn(Optional.of(service));
        when(serviceRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        LocalDate newFrom = LocalDate.now().plusDays(5);
        ServiceItem updateData = new ServiceItem();
        updateData.setAvailableFrom(newFrom);

        ServiceItem result = serviceItemService.update(1L, 1L, updateData);

        assertThat(result.getAvailableFrom()).isEqualTo(newFrom);
    }

    @Test
    void update_availableFromInPast_throws() {
        when(serviceRepository.findById(1L)).thenReturn(Optional.of(service));

        ServiceItem updateData = new ServiceItem();
        updateData.setAvailableFrom(LocalDate.now().minusDays(1));

        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> serviceItemService.update(1L, 1L, updateData));
        assertThat(ex.getMessage()).contains("La fecha de inicio no puede ser en el pasado");
    }

    @Test
    void update_availableUntilBeforeFrom_throws() {
        when(serviceRepository.findById(1L)).thenReturn(Optional.of(service));

        ServiceItem updateData = new ServiceItem();
        updateData.setAvailableFrom(LocalDate.now().plusDays(20));
        updateData.setAvailableUntil(LocalDate.now().plusDays(5));

        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> serviceItemService.update(1L, 1L, updateData));
        assertThat(ex.getMessage()).contains("La fecha de finalización debe ser después de la fecha de inicio");
    }

    @Test
    void update_onlyUntilChanged_doesNotCheckFromFuture() {
        // availableFrom no cambia  ->  checkFromFuture = false   ->   no valida que from sea futuro
        when(serviceRepository.findById(1L)).thenReturn(Optional.of(service));
        when(serviceRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ServiceItem updateData = new ServiceItem();
        updateData.setAvailableUntil(UNTIL.plusDays(10));

        ServiceItem result = serviceItemService.update(1L, 1L, updateData);

        assertThat(result.getAvailableUntil()).isEqualTo(UNTIL.plusDays(10));
    }

    @Test
    void update_totalUnitsChanged_updatesUnits() {
        when(serviceRepository.findById(1L)).thenReturn(Optional.of(service));
        when(serviceRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ServiceItem updateData = new ServiceItem();
        updateData.setTotalUnits(7);

        ServiceItem result = serviceItemService.update(1L, 1L, updateData);

        assertThat(result.getTotalUnits()).isEqualTo(7);
    }

    @Test
    void update_totalUnitsLessThanOne_throws() {
        when(serviceRepository.findById(1L)).thenReturn(Optional.of(service));

        ServiceItem updateData = new ServiceItem();
        updateData.setTotalUnits(0);

        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> serviceItemService.update(1L, 1L, updateData));
        assertThat(ex.getMessage()).contains("unidades disponibles deben ser al menos 1");
    }

    @Test
    void update_expiredUntil_setsStatusToDraft() {
        // until < today pero from no cambia  ->  checkFromFuture = false
        service.setAvailableFrom(LocalDate.now().minusDays(5)); // from en el pasado (ya guardado)
        when(serviceRepository.findById(1L)).thenReturn(Optional.of(service));
        when(serviceRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ServiceItem updateData = new ServiceItem();
        updateData.setAvailableUntil(LocalDate.now().minusDays(1));

        ServiceItem result = serviceItemService.update(1L, 1L, updateData);

        assertThat(result.getStatus()).isEqualTo(ServiceStatus.DRAFT);
    }


    @Test
    void requestService_activeService_setsUnavailable() {
        when(serviceRepository.findById(1L)).thenReturn(Optional.of(service));
        when(serviceRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ServiceItem result = serviceItemService.requestService(1L);

        assertThat(result.getStatus()).isEqualTo(ServiceStatus.UNAVAILABLE);
        verify(serviceRepository).save(service);
    }

    @Test
    void requestService_serviceNotFound_throws() {
        when(serviceRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> serviceItemService.requestService(99L));
        assertThat(ex.getMessage()).contains("Servicio no encontrado");
    }

    @Test
    void requestService_draftService_throws() {
        ServiceItem draft = makeService(2L, ServiceStatus.DRAFT);
        when(serviceRepository.findById(2L)).thenReturn(Optional.of(draft));

        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> serviceItemService.requestService(2L));
        assertThat(ex.getMessage()).contains("El servicio no está activo y no puede ser solicitado");
    }

    @Test
    void requestService_unavailableService_throws() {
        ServiceItem unavail = makeService(3L, ServiceStatus.UNAVAILABLE);
        when(serviceRepository.findById(3L)).thenReturn(Optional.of(unavail));

        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> serviceItemService.requestService(3L));
        assertThat(ex.getMessage()).contains("El servicio no está activo y no puede ser solicitado");
    }


    @Test
    void releaseService_validUntilInFuture_setsActive() {
        ServiceItem s = makeService(1L, ServiceStatus.UNAVAILABLE);
        s.setAvailableUntil(LocalDate.now().plusDays(10));
        when(serviceRepository.findById(1L)).thenReturn(Optional.of(s));
        when(serviceRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ServiceItem result = serviceItemService.releaseService(1L);

        assertThat(result.getStatus()).isEqualTo(ServiceStatus.ACTIVE);
        assertThat(result.getAvailableFrom()).isEqualTo(LocalDate.now());
    }

    @Test
    void releaseService_validUntilInPast_setsDraft() {
        ServiceItem s = makeService(1L, ServiceStatus.UNAVAILABLE);
        s.setAvailableUntil(LocalDate.now().minusDays(1));
        when(serviceRepository.findById(1L)).thenReturn(Optional.of(s));
        when(serviceRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ServiceItem result = serviceItemService.releaseService(1L);

        assertThat(result.getStatus()).isEqualTo(ServiceStatus.DRAFT);
        assertThat(result.getAvailableFrom()).isEqualTo(LocalDate.now());
    }

    @Test
    void releaseService_serviceNotFound_throws() {
        when(serviceRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> serviceItemService.releaseService(99L));
        assertThat(ex.getMessage()).contains("Servicio no encontrado");
    }

    @Test
    void releaseService_savesUpdatedService() {
        ServiceItem s = makeService(5L, ServiceStatus.UNAVAILABLE);
        s.setAvailableUntil(LocalDate.now().plusDays(5));
        when(serviceRepository.findById(5L)).thenReturn(Optional.of(s));
        when(serviceRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        serviceItemService.releaseService(5L);

        verify(serviceRepository).save(s);
    }


    @Test
    void delete_success_deletesService() {
        when(serviceRepository.findById(1L)).thenReturn(Optional.of(service));
        doNothing().when(serviceRepository).delete(service);

        serviceItemService.delete(1L, 1L);

        verify(serviceRepository).delete(service);
    }

    @Test
    void delete_serviceNotFound_throws() {
        when(serviceRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> serviceItemService.delete(99L, 1L));
        assertThat(ex.getMessage()).contains("Servicio no encontrado");
    }

    @Test
    void delete_notOwner_throws() {
        ServiceItem s = makeService(2L, ServiceStatus.ACTIVE);
        User other = new User();
        other.setId(99L);
        s.setOwner(other);
        when(serviceRepository.findById(2L)).thenReturn(Optional.of(s));

        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> serviceItemService.delete(2L, 1L));
        assertThat(ex.getMessage()).contains("No tienes permiso para eliminar este servicio");
    }

    @Test
    void delete_serviceUnavailable_throws() {
        ServiceItem s = makeService(3L, ServiceStatus.UNAVAILABLE);
        when(serviceRepository.findById(3L)).thenReturn(Optional.of(s));

        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> serviceItemService.delete(3L, 1L));
        assertThat(ex.getMessage()).contains("El servicio está actualmente alquilado y no puede ser eliminado");
    }

    @Test
    void delete_draftService_deletesSuccessfully() {
        ServiceItem draft = makeService(4L, ServiceStatus.DRAFT);
        when(serviceRepository.findById(4L)).thenReturn(Optional.of(draft));
        doNothing().when(serviceRepository).delete(draft);

        serviceItemService.delete(4L, 1L);

        verify(serviceRepository).delete(draft);
    }


    @Test
    void autoExpireServices_expiredActiveService_setsDraft() {
        ServiceItem expired = makeService(1L, ServiceStatus.ACTIVE);
        expired.setAvailableUntil(LocalDate.now().minusDays(1));

        when(serviceRepository.findByStatus(ServiceStatus.ACTIVE)).thenReturn(List.of(expired));
        when(serviceRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        serviceItemService.autoExpireServices();

        assertThat(expired.getStatus()).isEqualTo(ServiceStatus.DRAFT);
        verify(serviceRepository).save(expired);
    }

    @Test
    void autoExpireServices_nonExpiredActiveService_remainsActive() {
        ServiceItem nonExpired = makeService(2L, ServiceStatus.ACTIVE);
        nonExpired.setAvailableUntil(LocalDate.now().plusDays(5));

        when(serviceRepository.findByStatus(ServiceStatus.ACTIVE)).thenReturn(List.of(nonExpired));

        serviceItemService.autoExpireServices();

        assertThat(nonExpired.getStatus()).isEqualTo(ServiceStatus.ACTIVE);
        verify(serviceRepository, never()).save(any());
    }

    @Test
    void autoExpireServices_mixedServices_onlyExpiredSetToDraft() {
        ServiceItem expired = makeService(1L, ServiceStatus.ACTIVE);
        expired.setAvailableUntil(LocalDate.now().minusDays(1));

        ServiceItem valid = makeService(2L, ServiceStatus.ACTIVE);
        valid.setAvailableUntil(LocalDate.now().plusDays(5));

        when(serviceRepository.findByStatus(ServiceStatus.ACTIVE)).thenReturn(List.of(expired, valid));
        when(serviceRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        serviceItemService.autoExpireServices();

        assertThat(expired.getStatus()).isEqualTo(ServiceStatus.DRAFT);
        assertThat(valid.getStatus()).isEqualTo(ServiceStatus.ACTIVE);
        verify(serviceRepository, times(1)).save(expired);
        verify(serviceRepository, never()).save(valid);
    }

    @Test
    void autoExpireServices_noActiveServices_doesNothing() {
        when(serviceRepository.findByStatus(ServiceStatus.ACTIVE)).thenReturn(List.of());

        serviceItemService.autoExpireServices();

        verify(serviceRepository, never()).save(any());
    }

    @Test
    void autoExpireServices_expiresExactlyToday_doesNotExpire() {
        // until = today -> isBefore(today) es false -> NO expira
        ServiceItem expiresExactlyToday = makeService(3L, ServiceStatus.ACTIVE);
        expiresExactlyToday.setAvailableUntil(LocalDate.now());

        when(serviceRepository.findByStatus(ServiceStatus.ACTIVE)).thenReturn(List.of(expiresExactlyToday));

        serviceItemService.autoExpireServices();

        assertThat(expiresExactlyToday.getStatus()).isEqualTo(ServiceStatus.ACTIVE);
        verify(serviceRepository, never()).save(any());
    }

    // ------------ createAndPromote — ownerCommissionPromoCode ------------
    
    @Test
    void createAndPromote_withValidOwnerCommissionPromoCode_succeeds() {
        when(serviceRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(promoCodeService.validateForOwnerCommissionReductionAllowReservedByUser("OWNER10", "owner@example.com"))
            .thenReturn(new PromoCodeValidationResponse(true, 0.10, "Código aplicado correctamente"));
    
        ServiceItem newService = makeService(null, null);
        newService.setOwnerCommissionPromoCode("owner10"); // minúsculas, se normalizará
    
        ServiceItem result = serviceItemService.createAndPromote(newService, 1L, 1L);
    
        assertThat(result.getOwnerCommissionPromoCode()).isEqualTo("OWNER10");
        verify(promoCodeService).validateForOwnerCommissionReductionAllowReservedByUser("OWNER10", "owner@example.com");
    }
    
    @Test
    void createAndPromote_withInvalidOwnerCommissionPromoCode_throws() {
        when(promoCodeService.validateForOwnerCommissionReductionAllowReservedByUser("INVALIDO", "owner@example.com"))
            .thenReturn(new PromoCodeValidationResponse(false, null, "Código promocional no válido"));
    
        ServiceItem newService = makeService(null, null);
        newService.setOwnerCommissionPromoCode("INVALIDO");
    
        assertThatThrownBy(() -> serviceItemService.createAndPromote(newService, 1L, 1L))
            .isInstanceOf(RuntimeException.class)
            .hasMessage("Código promocional no válido");
        verify(serviceRepository, never()).save(any());
    }
    
    @Test
    void createAndPromote_withNullOwnerCommissionPromoCode_doesNotCallPromoValidation() {
        when(serviceRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
    
        ServiceItem newService = makeService(null, null);
        newService.setOwnerCommissionPromoCode(null);
    
        serviceItemService.createAndPromote(newService, 1L, 1L);
    
        verify(promoCodeService, never())
            .validateForOwnerCommissionReductionAllowReservedByUser(any(), any());
    }
    
    @Test
    void createAndPromote_withBlankOwnerCommissionPromoCode_normalizesToNull() {
        when(serviceRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
    
        ServiceItem newService = makeService(null, null);
        newService.setOwnerCommissionPromoCode("   ");
    
        serviceItemService.createAndPromote(newService, 1L, 1L);
    
        verify(promoCodeService, never())
            .validateForOwnerCommissionReductionAllowReservedByUser(any(), any());
    }
    
    @Test
    void createAndPromote_withValidOwnerPromoCode_callsReserveOwnerSingleUse() {
        when(serviceRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(promoCodeService.validateForOwnerCommissionReductionAllowReservedByUser("OWNER10", "owner@example.com"))
            .thenReturn(new PromoCodeValidationResponse(true, 0.10, "Código aplicado correctamente"));
        doNothing().when(promoCodeService).reserveOwnerSingleUseIfNeeded("OWNER10", "owner@example.com");
    
        ServiceItem newService = makeService(null, null);
        newService.setOwnerCommissionPromoCode("OWNER10");
    
        serviceItemService.createAndPromote(newService, 1L, 1L);
    
        verify(promoCodeService).reserveOwnerSingleUseIfNeeded("OWNER10", "owner@example.com");
    }
    
    // ------------ update — ownerCommissionPromoCode ------------
    
    @Test
    void update_withNewOwnerCommissionPromoCode_validatesAndReserves() {
        when(serviceRepository.findById(1L)).thenReturn(Optional.of(service));
        when(serviceRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(promoCodeService.validateForOwnerCommissionReductionAllowReservedByUser("OWNER10", "owner@example.com"))
            .thenReturn(new PromoCodeValidationResponse(true, 0.10, "Código aplicado correctamente"));
        doNothing().when(promoCodeService).reserveOwnerSingleUseIfNeeded("OWNER10", "owner@example.com");
    
        ServiceItem updateData = new ServiceItem();
        updateData.setOwnerCommissionPromoCode("owner10"); // minúsculas, normalizar
    
        ServiceItem result = serviceItemService.update(1L, 1L, updateData);
    
        assertThat(result.getOwnerCommissionPromoCode()).isEqualTo("OWNER10");
        verify(promoCodeService).validateForOwnerCommissionReductionAllowReservedByUser("OWNER10", "owner@example.com");
        verify(promoCodeService).reserveOwnerSingleUseIfNeeded("OWNER10", "owner@example.com");
    }
    
    @Test
    void update_withInvalidOwnerCommissionPromoCode_throws() {
        when(serviceRepository.findById(1L)).thenReturn(Optional.of(service));
        when(promoCodeService.validateForOwnerCommissionReductionAllowReservedByUser("MALO", "owner@example.com"))
            .thenReturn(new PromoCodeValidationResponse(false, null, "Código promocional no válido"));
    
        ServiceItem updateData = new ServiceItem();
        updateData.setOwnerCommissionPromoCode("MALO");
    
        assertThatThrownBy(() -> serviceItemService.update(1L, 1L, updateData))
            .isInstanceOf(RuntimeException.class)
            .hasMessage("Código promocional no válido");
        verify(serviceRepository, never()).save(any());
    }
    
    @Test
    void update_withSameOwnerCommissionPromoCode_doesNotResetConsumedFlag() {
        service.setOwnerCommissionPromoCode("OWNER10");
        service.setOwnerCommissionPromoConsumed(true);
        when(serviceRepository.findById(1L)).thenReturn(Optional.of(service));
        when(serviceRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(promoCodeService.validateForOwnerCommissionReductionAllowReservedByUser("OWNER10", "owner@example.com"))
            .thenReturn(new PromoCodeValidationResponse(true, 0.10, "Código aplicado correctamente"));
    
        ServiceItem updateData = new ServiceItem();
        updateData.setOwnerCommissionPromoCode("OWNER10");
    
        ServiceItem result = serviceItemService.update(1L, 1L, updateData);
    
        assertThat(result.isOwnerCommissionPromoConsumed()).isTrue();
    }
    
    @Test
    void update_withDifferentOwnerCommissionPromoCode_resetsConsumedFlag() {
        service.setOwnerCommissionPromoCode("OWNER10");
        service.setOwnerCommissionPromoConsumed(true);
        when(serviceRepository.findById(1L)).thenReturn(Optional.of(service));
        when(serviceRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(promoCodeService.validateForOwnerCommissionReductionAllowReservedByUser("OWNER20", "owner@example.com"))
            .thenReturn(new PromoCodeValidationResponse(true, 0.20, "Código aplicado correctamente"));
    
        ServiceItem updateData = new ServiceItem();
        updateData.setOwnerCommissionPromoCode("OWNER20");
    
        ServiceItem result = serviceItemService.update(1L, 1L, updateData);
    
        assertThat(result.isOwnerCommissionPromoConsumed()).isFalse();
    }
    
    @Test
    void update_removingOwnerCommissionPromoCode_normalizesToNullAndClearsConsumed() {
        service.setOwnerCommissionPromoCode("OWNER10");
        service.setOwnerCommissionPromoConsumed(true);
        when(serviceRepository.findById(1L)).thenReturn(Optional.of(service));
        when(serviceRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
    
        ServiceItem updateData = new ServiceItem();
        updateData.setOwnerCommissionPromoCode("  "); // blank = eliminar
    
        ServiceItem result = serviceItemService.update(1L, 1L, updateData);
    
        assertThat(result.getOwnerCommissionPromoCode()).isNull();
        assertThat(result.isOwnerCommissionPromoConsumed()).isFalse();
        verify(promoCodeService, never()).validateForOwnerCommissionReductionAllowReservedByUser(any(), any());
    }
}