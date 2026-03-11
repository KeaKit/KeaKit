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
            .orElseThrow(() -> new RuntimeException("Service not found"));
    }

    /**
     * Promocionar servicio.
     */
    @Transactional
    public ServiceItem createAndPromote(ServiceItem service, Long ownerId, Long categoryId) {
        User owner = userRepository.findById(ownerId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Category category = categoryRepository.findById(categoryId)
            .orElseThrow(() -> new RuntimeException("Category not found"));

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
                .orElseThrow(() -> new RuntimeException("Service not found"));

        if (!service.getOwner().getId().equals(ownerId)) {
            throw new RuntimeException("Only the owner can modify this service");
        }

        if (service.getStatus() == ServiceStatus.UNAVAILABLE) {
            throw new RuntimeException("The service is currently rented and cannot be modified.");
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
                throw new RuntimeException("Service status can only be ACTIVE or DRAFT");
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
            .orElseThrow(() -> new RuntimeException("Service not found"));

        if (service.getStatus() != ServiceStatus.ACTIVE) {
            throw new RuntimeException("The service is not active and cannot be requested");
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
                .orElseThrow(() -> new RuntimeException("Service not found"));

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
        .orElseThrow(() -> new RuntimeException("Service not found"));

        if (!service.getOwner().getId().equals(ownerId)) {
            throw new RuntimeException("You do not have permission to delete this service");
        }

        if (service.getStatus() == ServiceStatus.UNAVAILABLE) {
            throw new RuntimeException("The service is currently rented and cannot be deleted");
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
            throw new RuntimeException("Title is required");
        if (service.getCity() == null || service.getCity().isEmpty()) 
            throw new RuntimeException("City is required");
        
        if (service.getPricePerMonth() == null || service.getPricePerMonth() <= 0) 
            throw new RuntimeException("Monthly price must be positive");

        LocalDate from = service.getAvailableFrom();
        LocalDate until = service.getAvailableUntil();

        if (from == null || until == null) 
            throw new RuntimeException("You must specify the date range (From/Until)");

        if (checkFromFuture && from.isBefore(LocalDate.now())) {
            throw new RuntimeException("Start date cannot be in the past");
        }
        if (until.isBefore(from)) 
            throw new RuntimeException("End date must be after the start date");
        
        if (until.isBefore(LocalDate.now())) {
             service.setStatus(ServiceStatus.DRAFT);
        }
    }

    public List<ServiceItem> findAllActive() {
        return serviceRepository.findByStatus(ServiceStatus.ACTIVE);
    }

    public List<ServiceItem> findByOwner(Long ownerId) {
        return serviceRepository.findByOwnerId(ownerId);
    }
}