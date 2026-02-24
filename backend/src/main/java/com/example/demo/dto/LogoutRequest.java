package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;

public class LogoutRequest {
    @NotBlank(message = "Token is required")
    private String token;

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}
