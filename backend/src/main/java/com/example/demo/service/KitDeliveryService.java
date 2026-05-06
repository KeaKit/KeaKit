package com.example.demo.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.dto.KitDeliveryResponse;
import com.example.demo.dto.KitResponse;
import com.example.demo.dto.UpdateDeliveryRequest;
import com.example.demo.model.DeliveryMethod;
import com.example.demo.model.DeliveryStatus;
import com.example.demo.model.Kit;
import com.example.demo.model.KitDelivery;
import com.example.demo.model.KitStatus;
import com.example.demo.model.User;
import com.example.demo.model.UserRole;
import com.example.demo.repository.KitDeliveryRepository;
import com.example.demo.repository.KitRepository;
import com.example.demo.repository.UserRepository;

import java.util.List;
import java.util.Objects;

@Service
public class KitDeliveryService {

    @Autowired
    private KitDeliveryRepository kitDeliveryRepository;

    @Autowired
    private KitRepository kitRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthService authService;

    public KitDelivery ensureDeliveryExists(Kit kit) {
        return kitDeliveryRepository.findByKitId(kit.getId())
            .orElseGet(() -> {
                KitDelivery delivery = new KitDelivery();

                delivery.setKit(kit);
                delivery.setEstimatedArrival(buildInitialEstimate(kit));
                delivery.setLastUpdate(LocalDateTime.now());
                
                return kitDeliveryRepository.save(delivery);
            });
    }

    public KitDeliveryResponse getTracking(Long kitId) {
        Kit kit = kitRepository.findById(kitId)
            .orElseThrow(() -> new RuntimeException("Kit no encontrado"));

        KitDelivery delivery = kitDeliveryRepository.findByKitId(kitId)
            .orElseThrow(() -> new RuntimeException("Delivery no encontrado"));

        validateViewAccess(kit, delivery);

        return new KitDeliveryResponse(delivery);
    }

    public KitDeliveryResponse updateTracking(Long kitId, UpdateDeliveryRequest request) {
        KitDelivery delivery = kitDeliveryRepository.findByKitId(kitId)
            .orElseThrow(() -> new RuntimeException("Delivery no encontrado"));

        validateUpdateAccess(delivery);

        if (request.getEstimatedArrival() != null) {
            delivery.setEstimatedArrival(request.getEstimatedArrival());
        }

        if (request.getLastLocation() != null) {
            delivery.setLastLocation(request.getLastLocation());
        }

        if (request.getStatus() != null) {
            delivery.setStatus(request.getStatus());
        }

        delivery.setLastUpdate(LocalDateTime.now());
        KitDelivery saved = kitDeliveryRepository.save(delivery);

        return new KitDeliveryResponse(saved);
    }

    public KitDeliveryResponse assignCourier(Long kitId, Long courierId) {
        if (!authService.isAdmin()) {
            throw new RuntimeException("Solo un ADMIN puede asignar un repartidor");
        }

        Kit kit = kitRepository.findById(kitId)
            .orElseThrow(() -> new RuntimeException("Kit no encontrado"));

        User courier = userRepository.findById(courierId)
            .orElseThrow(() -> new RuntimeException("Repartidor no encontrado"));

        if (courier.getRole() != UserRole.COURIER) {
            throw new RuntimeException("El usuario no es un COURIER");
        }

        KitDelivery delivery = kitDeliveryRepository.findByKitId(kitId)
            .orElseGet(() -> ensureDeliveryExists(kit));

        delivery.setAssignedCourier(courier);

        KitDelivery saved = kitDeliveryRepository.save(delivery);

        return new KitDeliveryResponse(saved);
    }

    private void validateViewAccess(Kit kit, KitDelivery delivery) {
        UserRole role = authService.getAuthenticatedUserRole();

        if (role == UserRole.ADMIN) {
            return;
        }

        if (role == UserRole.COURIER) {
            User courier = delivery.getAssignedCourier();
            if (courier != null && courier.getId().equals(authService.getAuthenticatedUserId())) {
                return;
            }
            throw new RuntimeException("Repartidor no asignado a este kit");
        }

        if (kit.getTenant() == null || !kit.getTenant().getId().equals(authService.getAuthenticatedUserId())) {
            throw new RuntimeException("No tienes acceso a este kit");
        }
    }

    private void validateUpdateAccess(KitDelivery delivery) {
        UserRole role = authService.getAuthenticatedUserRole();

        if (role == UserRole.ADMIN) {
            return;
        }

        if (role == UserRole.COURIER) {
            User courier = delivery.getAssignedCourier();
            if (courier != null && courier.getId().equals(authService.getAuthenticatedUserId())) {
                return;
            }
        }

        throw new RuntimeException("Solo el repartidor asignado o un administrador puede actualizar el seguimiento");
    }

    private LocalDateTime buildInitialEstimate(Kit kit) {
        if (kit.getStartDate() == null) {
            return null;
        }
        LocalDate estimated = kit.getStartDate().minusDays(1);
        return estimated.atStartOfDay();
    }

    public List<KitResponse> getAssignedKitsForCourier() {
        UserRole role = authService.getAuthenticatedUserRole();

        if (role != UserRole.COURIER && role != UserRole.ADMIN) {
            throw new RuntimeException("Solo el COURIER o un ADMIN puede acceder a los kits asignados");
        }

        Long courierId = authService.getAuthenticatedUserId();
        List<KitDelivery> deliveries = kitDeliveryRepository.findByAssignedCourierId(courierId);

        return deliveries.stream()
            .filter(d -> d.getAssignedCourier() != null)
            .filter(d -> {
                // Quitar si ya está entregado y el kit está ACTIVE (confirmada recepción)
                boolean completed = d.getStatus() == DeliveryStatus.DELIVERED
                        && d.getKit() != null
                        && d.getKit().getStatus() == KitStatus.ACTIVE;
                return !completed;
            })
            .map(KitDelivery::getKit)
            .filter(Objects::nonNull)
            .map(KitResponse::new)
            .collect(Collectors.toList());
    }

    public List<Long> getBusyCourierIds(String country, String city) {
    if (!authService.isAdmin()) {
        throw new RuntimeException("Solo un ADMIN puede ver los repartidores ocupados");
    }

    return kitDeliveryRepository.findAll().stream()
        .filter(d -> d.getAssignedCourier() != null)
        .filter(d -> {
            boolean completed = d.getStatus() == DeliveryStatus.DELIVERED
                    && d.getKit() != null
                    && d.getKit().getStatus() == KitStatus.ACTIVE;
            return !completed;
        })
        .filter(d -> d.getAssignedCourier().getCountry() != null)
        .filter(d -> country == null || country.isBlank() || country.equalsIgnoreCase(d.getAssignedCourier().getCountry()))
        .filter(d -> city == null || city.isBlank() || city.equalsIgnoreCase(d.getAssignedCourier().getCity()))
        .map(d -> d.getAssignedCourier().getId())
        .distinct()
        .collect(Collectors.toList());
    }

    public List<KitResponse> getUnassignedPaidKits(String country, String city) {
        if (!authService.isAdmin()) {
            throw new RuntimeException("Solo un ADMIN puede ver los kits no asignados");
        }

        return kitRepository.findAll().stream()
            .filter(k -> k.getStatus() == KitStatus.PAID)
            .filter(k -> k.getDeliveryMethod() == DeliveryMethod.COURIER)
            .filter(k -> kitDeliveryRepository.findByKitId(k.getId())
                .map(d -> d.getAssignedCourier() == null)
                .orElse(true))
            .filter(k -> country == null || country.isBlank() || country.equalsIgnoreCase(k.getCountry()))
            .filter(k -> city == null || city.isBlank() || city.equalsIgnoreCase(k.getCity()))
            .map(KitResponse::new)
            .collect(Collectors.toList());
    }
}
