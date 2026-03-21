package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.demo.dto.KitDeliveryResponse;
import com.example.demo.dto.UpdateDeliveryRequest;
import com.example.demo.service.KitDeliveryService;

@RestController
@RequestMapping("/api/kits")
@CrossOrigin(origins = "*")
public class KitDeliveryController {

    @Autowired
    private KitDeliveryService kitDeliveryService;

    @GetMapping("/{kitId}/tracking")
    public ResponseEntity<?> getTracking(@PathVariable Long kitId) {
        try {
            KitDeliveryResponse response = kitDeliveryService.getTracking(kitId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PatchMapping("/{kitId}/tracking")
    public ResponseEntity<?> updateTracking(
            @PathVariable Long kitId,
            @RequestBody UpdateDeliveryRequest request
    ) {
        try {
            KitDeliveryResponse response = kitDeliveryService.updateTracking(kitId, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PatchMapping("/{kitId}/assign-courier/{courierId}")
    public ResponseEntity<?> assignCourier(
            @PathVariable Long kitId,
            @PathVariable Long courierId
    ) {
        try {
            KitDeliveryResponse response = kitDeliveryService.assignCourier(kitId, courierId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/courier/assigned")
    public ResponseEntity<?> getAssignedKits() {
        try {
            return ResponseEntity.ok(kitDeliveryService.getAssignedKitsForCourier());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

}
