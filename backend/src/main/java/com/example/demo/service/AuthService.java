package com.example.demo.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.example.demo.model.UserRole;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.JwtAuthenticationToken;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    /**
     * Obtiene el JwtAuthenticationToken desde el SecurityContext
     * 
     * @return JwtAuthenticationToken o null si no está autenticado o no es del tipo correcto
     */
    private JwtAuthenticationToken getJwtAuthenticationToken() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication instanceof JwtAuthenticationToken) {
            return (JwtAuthenticationToken) authentication;
        }
        return null;
    }

    /**
     * Obtiene el ID del usuario autenticado desde el token JWT
     * 
     * @return ID del usuario o null si no está autenticado
     */
    public Long getAuthenticatedUserId() {
        JwtAuthenticationToken jwtAuth = getJwtAuthenticationToken();
        return jwtAuth != null ? jwtAuth.getUserId() : null;
    }

    /**
     * Obtiene el rol del usuario autenticado
     * 
     * @return Rol del usuario o null si no está autenticado
     */
    public UserRole getAuthenticatedUserRole() {
        JwtAuthenticationToken jwtAuth = getJwtAuthenticationToken();
        return jwtAuth != null ? jwtAuth.getRole() : null;
    }

    /**
     * Obtiene el email del usuario autenticado
     * 
     * @return Email del usuario o null si no está autenticado
     */
    public String getAuthenticatedUserEmail() {
        JwtAuthenticationToken jwtAuth = getJwtAuthenticationToken();
        return jwtAuth != null ? jwtAuth.getEmail() : null;
    }

    /**
     * Verifica si el usuario autenticado es administrador
     * 
     * @return true si es ADMIN, false en caso contrario
     */
    public boolean isAdmin() {
        UserRole role = getAuthenticatedUserRole();
        return role == UserRole.ADMIN;
    }

    /**
     * Verifica si el usuario autenticado es el propietario del recurso
     * 
     * @param resourceUserId ID del usuario propietario del recurso
     * @return true si es el propietario, false en caso contrario
     */
    public boolean isOwner(Long resourceUserId) {
        Long authenticatedUserId = getAuthenticatedUserId();
        return authenticatedUserId != null && authenticatedUserId.equals(resourceUserId);
    }

    /**
     * Verifica si el usuario tiene acceso al recurso (es propietario o admin)
     * 
     * @param resourceUserId ID del usuario propietario del recurso
     * @return true si tiene acceso, false en caso contrario
     */
    public boolean hasAccess(Long resourceUserId) {
        return isAdmin() || isOwner(resourceUserId);
    }

    /**
     * Valida el acceso a un recurso de un usuario específico
     * 
     * @param resourceUserId ID del usuario propietario del recurso
     * @return ResponseEntity con error si no tiene acceso, null si tiene acceso
     *         permitido
     */
    public ResponseEntity<?> validateAccess(Long resourceUserId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("Usuario no autenticado"));
        }

        JwtAuthenticationToken jwtAuth = getJwtAuthenticationToken();

        if (jwtAuth == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("Token JWT no válido"));
        }

        if (jwtAuth.getUserId() == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("Token JWT no contiene información de usuario válida"));
        }

        // Verificar que el usuario del recurso existe en el sistema
        if (resourceUserId != null && !userRepository.existsById(resourceUserId)) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse("Usuario no encontrado en el sistema"));
        }

        if (jwtAuth.getRole() == UserRole.ADMIN) {
            return null;
        }

        if (!jwtAuth.getUserId().equals(resourceUserId)) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(createErrorResponse("No tienes permisos para acceder a este recurso"));
        }

        return null;
    }

    /**
     * Verifica que el usuario esté autenticado
     * 
     * @return ResponseEntity con error si no está autenticado, null si está
     *         autenticado
     */
    public ResponseEntity<?> requireAuthentication() {
        Long userId = getAuthenticatedUserId();
        if (userId == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("Usuario no autenticado"));
        }
        return null;
    }

    /**
     * Crea una respuesta de error en formato JSON
     * 
     * @param message Mensaje de error
     * @return Map con el error
     */
    public Map<String, String> createErrorResponse(String message) {
        Map<String, String> error = new HashMap<>();
        error.put("error", message);
        return error;
    }

}
