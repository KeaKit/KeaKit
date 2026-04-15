package com.example.demo.controller;

import com.example.demo.dto.BulkPilotUserRequest;
import com.example.demo.dto.PilotUserRequest;
import com.example.demo.dto.PilotUserResponse;
import com.example.demo.service.PilotUserService;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/pilot-users")
@CrossOrigin(origins = "*")
public class AdminPilotUserController {

    @Autowired
    private PilotUserService pilotUserService;

    @GetMapping
    public ResponseEntity<List<PilotUserResponse>> getAll() {
        return ResponseEntity.ok(pilotUserService.findAll());
    }

    @GetMapping("/active-emails")
    public ResponseEntity<List<String>> getActiveEmails() {
        return ResponseEntity.ok(pilotUserService.findAllActiveEmails());
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody PilotUserRequest request) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(pilotUserService.create(request));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody PilotUserRequest request) {
        try {
            return ResponseEntity.ok(pilotUserService.update(id, request));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PatchMapping("/bulk-active")
    public ResponseEntity<?> bulkSetActive(@Valid @RequestBody BulkPilotUserRequest request) {
        try {
            pilotUserService.bulkSetActive(request);
            return ResponseEntity.ok("Estado actualizado correctamente");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}