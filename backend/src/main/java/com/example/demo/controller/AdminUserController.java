package com.example.demo.controller;

import com.example.demo.dto.AdminUserRequest;
import com.example.demo.dto.UserResponse;
import com.example.demo.service.AdminUserDeletionService;
import com.example.demo.service.AdminUserService;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
@CrossOrigin(origins = "*")
public class AdminUserController {

    @Autowired
    private AdminUserService adminUserService;

    @Autowired
    private AdminUserDeletionService adminUserDeletionService;

    // LISTAR usuarios
    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(adminUserService.getAllUsers());
    }

    @GetMapping("/no-self")
    public ResponseEntity<List<UserResponse>> getUsersAdmin() {
        return ResponseEntity.ok(adminUserService.getUsersAdmin());
    }
    
    // CREAR usuario
    @PostMapping
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody AdminUserRequest request) {
        return ResponseEntity.ok(adminUserService.createUser(request));
    }

    // EDITAR usuario
    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody AdminUserRequest request) {

        return ResponseEntity.ok(adminUserService.updateUser(id, request));
    }

    // ELIMINAR usuario
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteUser(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            adminUserDeletionService.deleteUserWithItems(id);
            response.put("success", true);
            response.put("message", "Usuario eliminado correctamente");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            
            // Agregar información adicional según el tipo de error
            String errorMessage = e.getMessage();
            if (errorMessage.contains("alquileres activos")) {
                response.put("code", "ACTIVE_RENTALS_EXIST");
                response.put("resolution", "El usuario tiene alquileres en curso. Debe esperar a que finalicen o cancelarlos antes de eliminar.");
            } else if (errorMessage.contains("alquileres pagado")) {
                response.put("code", "PAID_RENTALS_EXIST");
                response.put("resolution", "El usuario tiene alquileres pagados pendientes. Debe esperar a que se entreguen o cancelarlos.");
            } else if (errorMessage.contains("está en un alquiler activo o pagado")) {
                response.put("code", "ITEM_IN_ACTIVE_RENTAL");
                response.put("resolution", "Este artículo/servicio está actualmente alquilado. Espere a que finalice el alquiler antes de eliminar al usuario.");
            }
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
}