package com.example.demo.security;

import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TokenBlacklistService {

    // En memoria - para producción usar Redis o similar
    private final ConcurrentHashMap<String, Date> blacklistedTokens = new ConcurrentHashMap<>();

    /**
     * Invalida un token agregándolo a la blacklist
     * @param token El token JWT a invalidar
     * @param expirationDate Fecha de expiración del token
     */
    public void blacklistToken(String token, Date expirationDate) {
        blacklistedTokens.put(token, expirationDate);
        cleanExpiredTokens();
    }

    /**
     * Verifica si un token está en la blacklist
     * @param token El token JWT a verificar
     * @return true si el token está invalidado
     */
    public boolean isTokenBlacklisted(String token) {
        cleanExpiredTokens();
        return blacklistedTokens.containsKey(token);
    }

    /**
     * Limpia tokens expirados de la blacklist para liberar memoria
     */
    private void cleanExpiredTokens() {
        Date now = new Date();
        blacklistedTokens.entrySet().removeIf(entry -> entry.getValue().before(now));
    }

    /**
     * Obtiene el número de tokens en la blacklist (para debugging)
     */
    public int getBlacklistSize() {
        cleanExpiredTokens();
        return blacklistedTokens.size();
    }
}
