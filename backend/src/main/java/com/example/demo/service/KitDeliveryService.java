package com.example.demo.service;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.dto.KitDeliveryResponse;
import com.example.demo.dto.UpdateDeliveryRequest;
import com.example.demo.model.Kit;
import com.example.demo.model.KitDelivery;
import com.example.demo.model.User;
import com.example.demo.model.UserRole;
import com.example.demo.repository.KitDeliveryRepository;
import com.example.demo.repository.KitRepository;
import com.example.demo.repository.UserRepository;

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
            .orElseThrow(() -> new RuntimeException("Kit not found"));

        KitDelivery delivery = kitDeliveryRepository.findByKitId(kitId)
            .orElseThrow(() -> new RuntimeException("Delivery not found"));

        validateViewAccess(kit, delivery);

        return new KitDeliveryResponse(delivery);
    }

    public KitDeliveryResponse updateTracking(Long kitId, UpdateDeliveryRequest request) {
        KitDelivery delivery = kitDeliveryRepository.findByKitId(kitId)
            .orElseThrow(() -> new RuntimeException("Delivery not found"));

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
            throw new RuntimeException("Only ADMIN can assign courier");
        }

        Kit kit = kitRepository.findById(kitId)
            .orElseThrow(() -> new RuntimeException("Kit not found"));

        User courier = userRepository.findById(courierId)
            .orElseThrow(() -> new RuntimeException("Courier not found"));

        if (courier.getRole() != UserRole.COURIER) {
            throw new RuntimeException("User is not COURIER");
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
            throw new RuntimeException("Courier not assigned to this kit");
        }

        if (kit.getTenant() == null || !kit.getTenant().getId().equals(authService.getAuthenticatedUserId())) {
            throw new RuntimeException("You don't have access to this kit");
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

        throw new RuntimeException("Only assigned courier or admin can update tracking");
    }

    private LocalDateTime buildInitialEstimate(Kit kit) {
        if (kit.getStartDate() == null) {
            return null;
        }
        LocalDate estimated = kit.getStartDate().minusDays(1);
        return estimated.atStartOfDay();
    }
}
