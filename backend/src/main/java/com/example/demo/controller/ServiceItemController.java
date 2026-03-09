package com.example.demo.controller;

import com.example.demo.model.ServiceItem;
import com.example.demo.service.ServiceItemService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
public class ServiceItemController {

    private final ServiceItemService serviceItemService;

    public ServiceItemController(ServiceItemService serviceItemService) {
        this.serviceItemService = serviceItemService;
    }

    /**
     * Listar todos los servicios activos 
     */
    @GetMapping("/active")
    public ResponseEntity<List<ServiceItem>> getActiveServices() {
        return ResponseEntity.ok(serviceItemService.findAllActive());
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
            @RequestParam Long categoryId) {
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
            @RequestBody ServiceItem updateData) {
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
            @RequestParam Long ownerId) {
        try {
            serviceItemService.delete(id, ownerId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}