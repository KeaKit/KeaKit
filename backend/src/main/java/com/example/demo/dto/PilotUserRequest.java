package com.example.demo.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record PilotUserRequest(
    @NotBlank 
    @Email(message = "El email no tiene un formato válido") 
    @Pattern(regexp = "^[^@]+@[^@]+\\.[^@]+$", message = "El email no tiene un formato válido")
    String email,

    boolean active
) {}