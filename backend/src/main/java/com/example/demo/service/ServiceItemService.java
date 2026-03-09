package com.example.demo.service;

import com.example.demo.model.*;
import com.example.demo.repository.*;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;

@Service
public class ServiceItemService {

    private final ServiceRepository serviceRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;

    public ServiceItemService(ServiceRepository serviceRepository, UserRepository userRepository, 
                              CategoryRepository categoryRepository) {
        this.serviceRepository = serviceRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
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
            throw new RuntimeException("Solo el dueño puede modificar este servicio");
        }

        if (service.getStatus() == ServiceStatus.UNAVAILABLE) {
            throw new RuntimeException("El servicio está actualmente alquilado y no puede modificarse.");
        }

        if (updateData.getTitle() != null) service.setTitle(updateData.getTitle());
        if (updateData.getDescription() != null) service.setDescription(updateData.getDescription());
        if (updateData.getPricePerMonth() != null) service.setPricePerMonth(updateData.getPricePerMonth());
        if (updateData.getCity() != null) service.setCity(updateData.getCity());

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
                throw new RuntimeException("El estado manual solo puede ser ACTIVE o DRAFT");
            }
        }
        validateServiceData(service, startMonthChanged);

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
            throw new RuntimeException("El servicio no está activo para ser solicitado");
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
            throw new RuntimeException("El servicio está alquilado y no puede eliminarse.");
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
            throw new RuntimeException("El título es obligatorio");
        if (service.getCity() == null || service.getCity().isEmpty()) 
            throw new RuntimeException("La ciudad es obligatoria");
        
        if (service.getPricePerMonth() == null || service.getPricePerMonth() <= 0) 
            throw new RuntimeException("El precio mensual debe ser positivo");

        LocalDate from = service.getAvailableFrom();
        LocalDate until = service.getAvailableUntil();

        if (from == null || until == null) 
            throw new RuntimeException("Debes indicar el rango de fechas (Desde/Hasta)");

        if (checkFromFuture && from.isBefore(LocalDate.now())) {
            throw new RuntimeException("La fecha de inicio no puede ser anterior a hoy");
        }
        if (until.isBefore(from)) 
            throw new RuntimeException("La fecha de fin debe ser posterior a la de inicio");
        
        if (until.isBefore(LocalDate.now())) {
             service.setStatus(ServiceStatus.DRAFT);
        }
    }

    public List<ServiceItem> findAllActive() {
        return serviceRepository.findByStatus(ServiceStatus.ACTIVE);
    }
}