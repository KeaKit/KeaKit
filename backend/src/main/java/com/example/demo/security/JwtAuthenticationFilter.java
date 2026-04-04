package com.example.demo.security;

import com.example.demo.model.UserRole;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
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

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String authorizationHeader = request.getHeader("Authorization");
        String jwt = jwtUtil.extractTokenFromAuthHeader(authorizationHeader);

        if (jwt != null) {
            if (tokenBlacklistService.isTokenBlacklisted(jwt)) {
                logger.warn("Token is blacklisted (user logged out)");
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token is blacklisted");
                return;
            }

            if (!jwtUtil.validateToken(jwt)) {
                logger.warn("Invalid or expired token");
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid or expired token");
                return;
            }

            if (SecurityContextHolder.getContext().getAuthentication() == null) {
                String email;
                try {
                    email = jwtUtil.extractEmail(jwt);
                } catch (Exception e) {
                    logger.error("Error extracting email from token: " + e.getMessage());
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid token");
                    return;
                }

                UserDetails userDetails = userDetailsService.loadUserByUsername(email);

                Long userId = jwtUtil.extractUserId(jwt);
                UserRole role = jwtUtil.extractRole(jwt);

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
