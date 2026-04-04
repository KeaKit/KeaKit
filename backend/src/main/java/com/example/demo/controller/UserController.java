package com.example.demo.controller;

import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.RegisterRequest;
import com.example.demo.dto.UserResponse;
import com.example.demo.dto.UserUpdateData;
import com.example.demo.service.UserService;
import com.example.demo.security.JwtUtil;
import com.example.demo.security.TokenBlacklistService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private TokenBlacklistService tokenBlacklistService;

    @Autowired
    private JwtUtil jwtUtil;

    private String getAuthenticatedEmail(){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) return null;
        return authentication.getName();
    }

    private Long getAuthenticatedUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication instanceof com.example.demo.security.JwtAuthenticationToken jwtToken) {
            return jwtToken.getUserId();
        }
        return null;
    }

    private boolean isAuthorizedForUser(Long targetUserId, String targetEmail) {
        Long authUserId = getAuthenticatedUserId();
        if (authUserId != null) {
            return authUserId.equals(targetUserId);
        }

        String authEmail = getAuthenticatedEmail();
        if (authEmail != null && targetEmail != null) {
            return authEmail.equals(targetEmail);
        }

        return false;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        UserResponse response = userService.register(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<UserResponse> login(@Valid @RequestBody LoginRequest request) {
        UserResponse response = userService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUser(@PathVariable Long id) {
        UserResponse response = userService.getUserById(id);
        if (!isAuthorizedForUser(id, response.getEmail())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(@PathVariable Long id, @Valid @RequestBody UserUpdateData updateData) {
        UserResponse userToUpdate = userService.getUserById(id);
        if (!isAuthorizedForUser(id, userToUpdate.getEmail())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        UserResponse response = userService.updateUser(id, updateData);
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/{id}/profile-photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateProfilePhoto(@PathVariable Long id, @RequestPart("file") MultipartFile file) {
        UserResponse userToUpdate = userService.getUserById(id);
        if (!isAuthorizedForUser(id, userToUpdate.getEmail())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        try {
            UserResponse response = userService.updateProfilePhoto(id, file);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Error interno del servidor");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(@RequestHeader("Authorization") String authorizationHeader) {
        Map<String, String> response = new HashMap<>();

        String token = jwtUtil.extractTokenFromAuthHeader(authorizationHeader);

        if (token == null) {
            response.put("message", "Invalid token format");
            return ResponseEntity.badRequest().body(response);
        }

        try {
            // Verificar que el token sea válido antes de invalidarlo
            if (jwtUtil.validateToken(token)) {
                // Obtener la fecha de expiración del token
                var expirationDate = jwtUtil.extractExpiration(token);

                // Agregar el token a la blacklist
                tokenBlacklistService.blacklistToken(token, expirationDate);

                response.put("message", "Logout successful");
                return ResponseEntity.ok(response);
            } else {
                response.put("message", "Invalid or expired token");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
        } catch (Exception e) {
            response.put("message", "Error processing logout: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
