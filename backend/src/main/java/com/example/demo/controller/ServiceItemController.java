package com.example.demo.controller;

import org.springframework.security.core.Authentication;
import com.example.demo.model.ServiceItem;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.ServiceItemService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
public class ServiceItemController {

    private final ServiceItemService serviceItemService;
    private final UserRepository userRepository;

    public ServiceItemController(ServiceItemService serviceItemService, UserRepository userRepository) {
        this.serviceItemService = serviceItemService;
        this.userRepository = userRepository;
    }

    /**
     * Listar todos los servicios activos 
     */
    @GetMapping("/active")
    public ResponseEntity<List<ServiceItem>> getActiveServices() {
        return ResponseEntity.ok(serviceItemService.findAllActive());
    }

    /**
     * Listar solo los servicios del arrendador autenticado
     */
    @GetMapping("/my-services")
    public ResponseEntity<?> getMyServices(@RequestParam Long ownerId, Authentication authentication) {
        if (!isAuthorized(ownerId, authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You do not have permission to view these services.");
        }
        return ResponseEntity.ok(serviceItemService.findByOwner(ownerId));
    }


    /**
     * Obtener detalle de un servicio por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ServiceItem> getServiceById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(serviceItemService.findById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * Promocionar un nuevo servicio
     */
    @PostMapping("/promote")
    public ResponseEntity<?> promoteService(
            @RequestBody ServiceItem service,
            @RequestParam Long ownerId,
            @RequestParam Long categoryId,
            Authentication authentication) {


        if (!isAuthorized(ownerId, authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body("You do not have permission to create services.");
        }
        try {
            ServiceItem created = serviceItemService.createAndPromote(service, ownerId, categoryId);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Actualizar un servicio (Lo hace el arrendador solo si no está alquilado)
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateService(
            @PathVariable Long id,
            @RequestParam Long ownerId,
            @RequestBody ServiceItem updateData,
            Authentication authentication) {

        if (!isAuthorized(ownerId, authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body("You do not have permission to modify this service.");
        }
        try {
            ServiceItem updated = serviceItemService.update(id, ownerId, updateData);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Alquilar un servicio (Arrendatario)
     */
    @PostMapping("/{id}/request")
    public ResponseEntity<?> requestService(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(serviceItemService.requestService(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Cancelar un servicio (Arrendatario)
     */
    @PostMapping("/{id}/release")
    public ResponseEntity<?> releaseService(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(serviceItemService.releaseService(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Eliminar un servicio (Arrendador)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteService(
            @PathVariable Long id,
            @RequestParam Long ownerId,
            Authentication authentication) {

        if (!isAuthorized(ownerId, authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body("You do not have permission to delete this service.");
        }

        try {
            serviceItemService.delete(id, ownerId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    private boolean isAuthorized(Long ownerId, Authentication authentication) {
        if (authentication == null) return false;
        String id = authentication.getName();
        
        return userRepository.findByEmail(id)
                .map(user -> user.getId().equals(ownerId))
                .orElse(false);
    }
}