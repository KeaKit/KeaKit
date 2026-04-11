package com.example.demo.controller;

import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.PublicUserProfileDto;
import com.example.demo.dto.RegisterRequest;
import com.example.demo.dto.UserResponse;
import com.example.demo.dto.UserUpdateData;
import com.example.demo.service.UserService;
import com.example.demo.security.JwtUtil;
import com.example.demo.security.TokenBlacklistService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

import com.example.demo.model.User; 
import org.springframework.web.multipart.MultipartFile;  
import java.io.IOException;  

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
        return authentication.getName();
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
        String authenticatedEmail = getAuthenticatedEmail();

        UserResponse response = userService.getUserById(id);
        if (!authenticatedEmail.equals(response.getEmail())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(@PathVariable Long id, @Valid @RequestBody UserUpdateData updateData) {
        String authenticatedEmail = getAuthenticatedEmail();

        UserResponse userToUpdate = userService.getUserById(id);
        if (!authenticatedEmail.equals(userToUpdate.getEmail())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        UserResponse response = userService.updateUser(id, updateData);
        return ResponseEntity.ok(response);
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

    @PatchMapping("/profile/image")
    public ResponseEntity<UserResponse> updateProfileImage(
            @RequestParam("image") MultipartFile image,
            Authentication authentication) throws IOException {
        User currentUser = userService.findByEmail(authentication.getName());
        User updated = userService.updateProfileImage(currentUser.getId(), image);
        return ResponseEntity.ok(new UserResponse(updated));
    }

    // UserController.java
    @GetMapping("/{id}/public-profile")
    public ResponseEntity<PublicUserProfileDto> getPublicUserProfile(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getPublicUserProfile(id));
    }
}
