package com.example.demo.service;

import com.example.demo.model.*;
import com.example.demo.repository.*;
import com.example.demo.dto.PromoCodeValidationResponse;
import com.example.demo.dto.ServiceWithRentalsDTO;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ServiceItemService {

    private final ServiceRepository serviceRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final PromoCodeService promoCodeService;
    private final KitRepository kitRepository;

    public ServiceItemService(ServiceRepository serviceRepository, UserRepository userRepository, 
                              CategoryRepository categoryRepository, PromoCodeService promoCodeService, KitRepository kitRepository) {
        this.serviceRepository = serviceRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.promoCodeService = promoCodeService;
        this.kitRepository = kitRepository;
    }

    public List<ServiceItem> findAll() {
        return serviceRepository.findAll();
    }

    public ServiceItem findById(Long id) {
        return serviceRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Servicio no encontrado"));
    }

    /**
     * Promocionar servicio.
     */
    @Transactional
    public ServiceItem createAndPromote(ServiceItem service, Long ownerId, Long categoryId) {
        User owner = userRepository.findById(ownerId)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        Category category = categoryRepository.findById(categoryId)
            .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        validateServiceData(service, true);
        normalizeOwnerCommissionPromoState(service, false);
        validateOwnerCommissionPromoCode(service.getOwnerCommissionPromoCode(), owner.getEmail());
        reserveOwnerSingleUseIfNeeded(service.getOwnerCommissionPromoCode(), owner.getEmail());

        service.setOwner(owner);
        service.setCategory(category);
        service.setStatus(ServiceStatus.ACTIVE); 
        
        return serviceRepository.save(service);
    }

    /**
     * Actualizar servicio solo si no está alquilado (UNAVAILABLE).
     */
    @Transactional
    public ServiceItem update(Long id, Long ownerId, ServiceItem updateData) {
        ServiceItem service = serviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Servicio no encontrado"));

        if (!service.getOwner().getId().equals(ownerId)) {
            throw new RuntimeException("Solo el propietario puede modificar este servicio");
        }

        if (service.getStatus() == ServiceStatus.UNAVAILABLE) {
            throw new RuntimeException("El servicio está actualmente alquilado y no puede ser modificado.");
        }

        if (updateData.getTitle() != null) service.setTitle(updateData.getTitle());
        if (updateData.getDescription() != null) service.setDescription(updateData.getDescription());
        if (updateData.getPricePerMonth() != null) service.setPricePerMonth(updateData.getPricePerMonth());
        if (updateData.getCity() != null) service.setCity(updateData.getCity());
        if (updateData.getTotalUnits() != null) {
            if (updateData.getTotalUnits() < 1) {
                throw new RuntimeException("Las unidades disponibles deben ser al menos 1");
            }
            service.setTotalUnits(updateData.getTotalUnits());
        }

        boolean startMonthChanged = false;
        if (updateData.getAvailableFrom() != null && !updateData.getAvailableFrom().equals(service.getAvailableFrom())) {
            service.setAvailableFrom(updateData.getAvailableFrom());
            startMonthChanged = true;
        }
        
        if (updateData.getAvailableUntil() != null) {
            service.setAvailableUntil(updateData.getAvailableUntil());
        }

        if (updateData.getStatus() != null) {
            if (updateData.getStatus() == ServiceStatus.ACTIVE || updateData.getStatus() == ServiceStatus.DRAFT) {
                service.setStatus(updateData.getStatus());
            } else {
                throw new RuntimeException("El estado del servicio solo puede ser ACTIVE o DRAFT");
            }
        }

        if (updateData.getOwnerCommissionPromoCode() != null) {
            String previousCode = service.getOwnerCommissionPromoCode();
            service.setOwnerCommissionPromoCode(updateData.getOwnerCommissionPromoCode());
            normalizeOwnerCommissionPromoState(service, !sameCode(previousCode, service.getOwnerCommissionPromoCode()));
        }

        validateServiceData(service, startMonthChanged);
        validateOwnerCommissionPromoCode(service.getOwnerCommissionPromoCode(), service.getOwner().getEmail());
        reserveOwnerSingleUseIfNeeded(service.getOwnerCommissionPromoCode(), service.getOwner().getEmail());

        return serviceRepository.save(service);
    }

    /**
     * Solicitar servicio por parte de un cliente.
     */
    @Transactional
    public ServiceItem requestService(Long serviceId) {
        ServiceItem service = serviceRepository.findById(serviceId)
            .orElseThrow(() -> new RuntimeException("Servicio no encontrado"));

        if (service.getStatus() != ServiceStatus.ACTIVE) {
            throw new RuntimeException("El servicio no está activo y no puede ser solicitado");
        }
        service.setStatus(ServiceStatus.UNAVAILABLE); 
        return serviceRepository.save(service);
    }

    /**
     * El arrendatario cancela el servicio
     */
    @Transactional
    public ServiceItem releaseService(Long serviceId) {
        ServiceItem service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Servicio no encontrado"));

        service.setAvailableFrom(LocalDate.now());
        
        if (service.getAvailableUntil().isBefore(LocalDate.now())) {
            service.setStatus(ServiceStatus.DRAFT);
        } else {
            service.setStatus(ServiceStatus.ACTIVE);
        }

        return serviceRepository.save(service);
    }

    /**
     * Eliminar manualmente por el dueño.
     */
    public void delete(Long serviceId, Long ownerId) {
       ServiceItem service = serviceRepository.findById(serviceId)
        .orElseThrow(() -> new RuntimeException("Servicio no encontrado"));

        if (!service.getOwner().getId().equals(ownerId)) {
            throw new RuntimeException("No tienes permiso para eliminar este servicio");
        }

        if (service.getStatus() == ServiceStatus.UNAVAILABLE) {
            throw new RuntimeException("El servicio está actualmente alquilado y no puede ser eliminado");
        }
        serviceRepository.delete(service);
    }

    /**
     * Expiración automatica por fecha
     */
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void autoExpireServices() {
        List<ServiceItem> activeServices = serviceRepository.findByStatus(ServiceStatus.ACTIVE);
        LocalDate today = LocalDate.now();

        for (ServiceItem s : activeServices) {
            if (s.getAvailableUntil().isBefore(today)) {
                s.setStatus(ServiceStatus.DRAFT);
                serviceRepository.save(s);
            }
        }
    }

    /**
     * Validacion campos
     * @param checkFromFuture Si es true, valida que la fecha de inicio no sea en el pasado.
     */
    private void validateServiceData(ServiceItem service, boolean checkFromFuture) {
        if (service.getTitle() == null || service.getTitle().isEmpty()) 
            throw new RuntimeException("Título requerido");
        if (service.getCity() == null || service.getCity().isEmpty()) 
            throw new RuntimeException("Ciudad requerida");
        
        if (service.getPricePerMonth() == null || service.getPricePerMonth() <= 0) 
            throw new RuntimeException("El precio mensual debe ser positivo");

        LocalDate from = service.getAvailableFrom();
        LocalDate until = service.getAvailableUntil();

        if (from == null || until == null) 
            throw new RuntimeException("Debes especificar el rango de fechas (Desde/Hasta)");

        if (checkFromFuture && from.isBefore(LocalDate.now())) {
            throw new RuntimeException("La fecha de inicio no puede ser en el pasado");
        }
        if (until.isBefore(from)) 
            throw new RuntimeException("La fecha de finalización debe ser después de la fecha de inicio");
        
        if (until.isBefore(LocalDate.now())) {
             service.setStatus(ServiceStatus.DRAFT);
        }
    }

    public List<ServiceItem> findAllActive() {
        return serviceRepository.findByStatus(ServiceStatus.ACTIVE);
    }

    public List<ServiceWithRentalsDTO> findByOwner(Long ownerId) {
    List<ServiceItem> services = serviceRepository.findByOwnerId(ownerId);
    LocalDate today = LocalDate.now();

    return services.stream().map(service -> {
        // Calculamos cuántas unidades de este servicio específico están en kits pagados/activos hoy
        int rentedUnits = kitRepository.countActiveAndFutureRentedUnits(service.getId(), today);

        return new ServiceWithRentalsDTO(
            service.getId(),
            service.getTitle(),
            service.getCity(),
            service.getPricePerMonth(),
            service.getStatus(),
            service.getTotalUnits(),
            rentedUnits,
            service.getAvailableFrom(),
            service.getAvailableUntil()
        );
    }).collect(Collectors.toList());
}

    private void validateOwnerCommissionPromoCode(String promoCode, String ownerEmail) {
        if (promoCode == null || promoCode.isBlank()) {
            return;
        }

        if (promoCodeService == null) {
            return;
        }

        if (ownerEmail == null || ownerEmail.isBlank()) {
            throw new RuntimeException("Owner email is required to validate owner promo code");
        }

        PromoCodeValidationResponse validation = promoCodeService
            .validateForOwnerCommissionReductionAllowReservedByUser(promoCode.trim(), ownerEmail);

        if (!validation.isValid()) {
            throw new RuntimeException(validation.getMessage());
        }
    }

    private void reserveOwnerSingleUseIfNeeded(String promoCode, String ownerEmail) {
        if (promoCodeService == null || promoCode == null || promoCode.isBlank()) {
            return;
        }
        promoCodeService.reserveOwnerSingleUseIfNeeded(promoCode, ownerEmail);
    }

    private void normalizeOwnerCommissionPromoState(ServiceItem service, boolean resetConsumedFlag) {
        String normalized = normalizePromoCode(service.getOwnerCommissionPromoCode());
        service.setOwnerCommissionPromoCode(normalized);

        if (normalized == null) {
            service.setOwnerCommissionPromoConsumed(false);
            return;
        }

        if (resetConsumedFlag) {
            service.setOwnerCommissionPromoConsumed(false);
        }
    }

    private String normalizePromoCode(String code) {
        if (code == null) {
            return null;
        }
        String normalized = code.trim().toUpperCase();
        return normalized.isBlank() ? null : normalized;
    }

    private boolean sameCode(String left, String right) {
        String l = normalizePromoCode(left);
        String r = normalizePromoCode(right);
        if (l == null && r == null) {
            return true;
        }
        if (l == null || r == null) {
            return false;
        }
        return l.equals(r);
    }
}