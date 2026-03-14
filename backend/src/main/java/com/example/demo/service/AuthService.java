package com.example.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.example.demo.model.UserRole;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.JwtAuthenticationToken;

import com.example.demo.exception.UnauthorizedException;
import com.example.demo.exception.AccessForbiddenException;
import com.example.demo.exception.ResourceNotFoundException;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    /**
     * Obtiene el JwtAuthenticationToken desde el SecurityContext
     * 
     * @return JwtAuthenticationToken o null si no está autenticado o no es del tipo correcto
     */
    private JwtAuthenticationToken getJwtAuthenticationToken() throws UnauthorizedException {
        return Optional.ofNullable(SecurityContextHolder.getContext().getAuthentication())
            .filter(Authentication::isAuthenticated)
            .filter(auth -> auth instanceof JwtAuthenticationToken)
            .map(auth -> (JwtAuthenticationToken) auth)
            .filter(jwt -> jwt.getUserId() != null)
            .orElseThrow(() -> new UnauthorizedException("Token no válido o sesión expirada"));
    }

    /**
     * Obtiene el ID del usuario autenticado desde el token JWT
     * 
     * @return ID del usuario o null si no está autenticado
     */
    public Long getAuthenticatedUserId() throws UnauthorizedException {
        JwtAuthenticationToken jwtAuth = getJwtAuthenticationToken();
        return jwtAuth != null ? jwtAuth.getUserId() : null;
    }

    /**
     * Obtiene el rol del usuario autenticado
     * 
     * @return Rol del usuario o null si no está autenticado
     */
    public UserRole getAuthenticatedUserRole() throws UnauthorizedException {
        JwtAuthenticationToken jwtAuth = getJwtAuthenticationToken();
        return jwtAuth != null ? jwtAuth.getRole() : null;
    }

    /**
     * Obtiene el email del usuario autenticado
     * 
     * @return Email del usuario o null si no está autenticado
     */
    public String getAuthenticatedUserEmail() throws UnauthorizedException {
        JwtAuthenticationToken jwtAuth = getJwtAuthenticationToken();
        return jwtAuth != null ? jwtAuth.getEmail() : null;
    }

    /**
     * Verifica si el usuario autenticado es administrador
     * 
     * @return true si es ADMIN, false en caso contrario
     */
    public boolean isAdmin() throws UnauthorizedException {
        UserRole role = getAuthenticatedUserRole();
        return role == UserRole.ADMIN;
    }

    /**
     * Verifica si el usuario autenticado es el propietario del recurso
     * 
     * @param resourceUserId ID del usuario propietario del recurso
     * @return true si es el propietario, false en caso contrario
     */
    public boolean isOwner(Long resourceUserId) throws UnauthorizedException {
        Long authenticatedUserId = getAuthenticatedUserId();
        return authenticatedUserId != null && authenticatedUserId.equals(resourceUserId);
    }

    /**
     * Verifica si el usuario tiene acceso al recurso (es propietario o admin)
     * 
     * @param resourceUserId ID del usuario propietario del recurso
     * @return true si tiene acceso, false en caso contrario
     */
    public boolean hasAccess(Long resourceUserId) throws UnauthorizedException {
        return isAdmin() || isOwner(resourceUserId);
    }

    /**
     * Valida el acceso a un recurso de un usuario específico
     * 
     * @param resourceUserId ID del usuario propietario del recurso
     * @return ResponseEntity con error si no tiene acceso, null si tiene acceso
     *         permitido
     */
    public void validateAccess(Long resourceUserId) throws UnauthorizedException, AccessForbiddenException, ResourceNotFoundException {
        JwtAuthenticationToken jwtAuth = getJwtAuthenticationToken();

        if (resourceUserId != null && !userRepository.existsById(resourceUserId)) {
            throw new ResourceNotFoundException("Usuario no encontrado en el sistema");
        }

        if (jwtAuth.getRole() == UserRole.ADMIN) {
            return;
        }

        if (jwtAuth.getUserId() == null) {
            throw new UnauthorizedException("Token JWT no contiene información de usuario válida");
        }

        if (!jwtAuth.getUserId().equals(resourceUserId)) {
            throw new AccessForbiddenException("No tienes permisos para acceder a este recurso");
        }
    }

    /**
     * Verifica que el usuario esté autenticado
     * 
     * @return ResponseEntity con error si no está autenticado, null si está
     *         autenticado
     */
    public void requireAuthentication() throws UnauthorizedException {
        Long userId = getAuthenticatedUserId();
        if (userId == null) {
            throw new UnauthorizedException("Usuario no autenticado");
        }
    }

}
