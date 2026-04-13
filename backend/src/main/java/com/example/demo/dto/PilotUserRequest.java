package com.example.demo.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record PilotUserRequest(
    @NotBlank @Email(message = "El email no tiene un formato válido") String email,
    boolean active
) {}