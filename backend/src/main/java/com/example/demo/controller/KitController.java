package com.example.demo.controller;


import java.util.stream.Collectors;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.KitCreateRequest;
import com.example.demo.dto.KitResponse;
import com.example.demo.dto.RentedItemResponse;
import com.example.demo.model.Kit;
import com.example.demo.service.KitService;

@RestController
@RequestMapping("/api/kits")
@CrossOrigin(origins = "*")
public class KitController {

    @Autowired
    private KitService kitService;

    @PostMapping("/create")
    public ResponseEntity<?> createKit(@RequestBody KitCreateRequest request) {
        try {
            KitResponse response = kitService.create(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllKits() {
        try {
            List<KitResponse> response = kitService.findAll()
                .stream()
                .map(KitResponse::new)
                .collect(Collectors.toList());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getKit(@PathVariable Long id) {
        try {
            KitResponse response = kitService.findById(id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateKit(@PathVariable Long id, @RequestBody Kit updateData) {
        try {
            KitResponse response = kitService.update(id, updateData);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteKit(@PathVariable Long id) {
        try {
            kitService.deleteById(id);
            return ResponseEntity.ok("Kit deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @GetMapping("/rented/{userId}")
    public ResponseEntity<?> getRentedKitsByUser(@PathVariable Long userId) {
        try {
            List<RentedItemResponse> response = kitService.findRentedItemsByTenant(userId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/my-kits/{tenantId}")
    public ResponseEntity<?> getMyKits(@PathVariable Long tenantId) {
        try {
            List<KitResponse> response = kitService.findByTenantId(tenantId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/my-kits/{tenantId}/{kitId}")
    public ResponseEntity<?> getMyKitTracking(@PathVariable Long tenantId, @PathVariable Long kitId) {
        try {
            KitResponse response = kitService.findTrackingKitById(kitId, tenantId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PatchMapping("confirm/{id}")
    public ResponseEntity<?> confirmKitStatus(@PathVariable Long id) {
        try {
            kitService.confirmKitStatus(id);
            return ResponseEntity.ok("Kit status confirmed succesfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(e.getMessage());
        }
    }

}
