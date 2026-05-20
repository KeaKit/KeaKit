package com.example.demo.dto;

import com.example.demo.model.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class AdminUserRequest {

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El formato del email no es válido")
    @Pattern(regexp = "^[^@]+@[^@]+\\.[^@]+$", message = "El formato del email no es válido")
    @Size(max = 255, message = "El email no puede tener más de 255 caracteres")
    private String email;
    
    @Size(min = 6, max = 255, message = "La contraseña debe tener entre 6 y 255 caracteres")
    private String password;

    @NotBlank(message = "El nombre es obligatorio")
    @Pattern(regexp = "^[^0-9]*$", message = "El nombre no puede contener números")
    @Size(max = 255, message = "El nombre no puede tener más de 255 caracteres")
    private String name;

    @NotNull(message = "El rol es obligatorio")
    private UserRole role;
    
    @NotBlank(message = "El teléfono es obligatorio")
    @Pattern(regexp = "^(\\+\\d{1,3})?\\d{8,12}$", message = "Formato de teléfono inválido")
    private String phone;

    @NotBlank(message = "La dirección es obligatoria")
    @Size(min = 5, max = 255, message = "La dirección debe tener entre 5 y 255 caracteres")
    @Pattern(regexp = "^(?![0-9]+$).+$", message = "La dirección no puede contener únicamente números")
    private String address;

    @NotBlank(message = "El país es obligatorio")
    @Pattern(regexp = "^[^0-9]*$", message = "El país no puede contener números")
    @Size(max = 255, message = "El país no puede tener más de 255 caracteres")
    private String country;

    @NotBlank(message = "La ciudad es obligatoria")
    @Pattern(regexp = "^[^0-9]*$", message = "La ciudad no puede contener números")
    @Size(max = 255, message = "La ciudad no puede tener más de 255 caracteres")
    private String city;

    public AdminUserRequest() {}

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
}