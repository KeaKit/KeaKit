package com.example.demo.controller;

import com.example.demo.dto.AdminUserRequest;
import com.example.demo.dto.UserResponse;
import com.example.demo.service.AdminUserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@CrossOrigin(origins = "*")
public class AdminUserController {

    @Autowired
    private AdminUserService adminUserService;

    // LISTAR usuarios
    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(adminUserService.getAllUsers());
    }

    // CREAR usuario
    @PostMapping
    public ResponseEntity<UserResponse> createUser(@RequestBody AdminUserRequest request) {
        return ResponseEntity.ok(adminUserService.createUser(request));
    }

    // EDITAR usuario
    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable Long id,
            @RequestBody AdminUserRequest request) {

        return ResponseEntity.ok(adminUserService.updateUser(id, request));
    }

    // ELIMINAR usuario
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {

        adminUserService.deleteUser(id);

        return ResponseEntity.noContent().build();
    }
}