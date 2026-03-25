package com.example.demo.dto;

import com.example.demo.model.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.NotBlank;;

public class AdminUserRequest {

    // Formato de email correcto y máximo 255 caracteres
    @Email(message = "El formato del email no es válido")
    @Size(max = 255, message = "El email no puede tener más de 255 caracteres")
    private String email;
    
    // Máximo 255 caracteres
    @Size(min = 6, message = "Password must be at least 6 characters")
    @Size(max = 255, message = "La contraseña no puede tener más de 255 caracteres")
    private String password;

    // Sin números y (opcionalmente) podríamos ponerle un máximo también
    @Pattern(regexp = "^[^0-9]*$", message = "El nombre no puede contener números")
    @Size(max = 255, message = "El nombre no puede tener más de 255 caracteres")
    private String name;

    private UserRole role;
    
    // Solo números
    @Pattern(regexp = "^[0-9]*$", message = "El teléfono solo puede contener números")
    private String phone;

    // Más de 255 caracteres (mínimo 256)
    @Size(max = 255, message = "La dirección no puede tener más de 255 caracteres")
    @Pattern(regexp = "^(?![0-9]+$).+$", message = "La dirección no puede contener únicamente números")
    private String address;

    // Sin números y máximo 255 caracteres
    @Pattern(regexp = "^[^0-9]*$", message = "El país no puede contener números")
    @Size(max = 255, message = "El país no puede tener más de 255 caracteres")
    private String country;

    // Sin números y máximo 255 caracteres
    @Pattern(regexp = "^[^0-9]*$", message = "La ciudad no puede contener números")
    @Size(max = 255, message = "La ciudad no puede tener más de 255 caracteres")
    private String city;

    public AdminUserRequest() {}

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }
}