package com.example.demo.security;

import com.example.demo.dto.UserResponse;
import com.example.demo.model.UserRole;
import com.example.demo.service.UserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private TokenBlacklistService tokenBlacklistService;

    @Autowired
    @Lazy
    private UserService userService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String authorizationHeader = request.getHeader("Authorization");
        String jwt = jwtUtil.extractTokenFromAuthHeader(authorizationHeader);
        String email = null;

        if (jwt != null) {
            try {
                email = jwtUtil.extractEmail(jwt);
            } catch (Exception e) {
                logger.error("Error extracting email from token: " + e.getMessage());
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.getWriter().write("Token expired or invalid");
                    return;
            }
        }

        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            // Verificar si el token está en la blacklist
            if (tokenBlacklistService.isTokenBlacklisted(jwt)) {
                logger.warn("Token is blacklisted (user logged out): " + email);
                filterChain.doFilter(request, response);
                return;
            }

            if (jwtUtil.validateToken(jwt)) {
                // Extraer información adicional del token
                Long userId = jwtUtil.extractUserId(jwt);
                UserRole role = jwtUtil.extractRole(jwt);

                Integer tokenVersion = jwtUtil.extractTokenVersion(jwt);
                UserResponse user = userService.getUserById(userId);

                if (user == null || tokenVersion == null || tokenVersion != user.getTokenVersion()) {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\":\"SESSION_INVALIDATED\"}");
                    return;
                }

                UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());

                // Usar el token de autenticación personalizado con información adicional
                JwtAuthenticationToken authenticationToken =
                    new JwtAuthenticationToken(
                        userDetails, 
                        null, 
                        userDetails.getAuthorities(),
                        userId,
                        role,
                        email
                    );

                authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authenticationToken);
            }
        }

        filterChain.doFilter(request, response);
    }
}
