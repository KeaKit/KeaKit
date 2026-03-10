package com.example.demo.security;

import com.example.demo.model.UserRole;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;

/**
 * Token de autenticación personalizado que incluye información adicional del usuario
 * extraída del JWT (userId, role, email).
 */
public class JwtAuthenticationToken extends UsernamePasswordAuthenticationToken {

    private final Long userId;
    private final UserRole role;
    private final String email;

    public JwtAuthenticationToken(
            Object principal,
            Object credentials,
            Collection<? extends GrantedAuthority> authorities,
            Long userId,
            UserRole role,
            String email) {
        super(principal, credentials, authorities);
        this.userId = userId;
        this.role = role;
        this.email = email;
    }

    public Long getUserId() {
        return userId;
    }

    public UserRole getRole() {
        return role;
    }

    public String getEmail() {
        return email;
    }
}
