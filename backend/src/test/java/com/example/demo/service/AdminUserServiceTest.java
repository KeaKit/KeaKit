package com.example.demo.service;

import com.example.demo.dto.AdminUserRequest;
import com.example.demo.exception.UserAlreadyExistsException;
import com.example.demo.exception.UserNotFoundException;
import com.example.demo.model.User;
import com.example.demo.model.UserRole;
import com.example.demo.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AdminUserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AdminUserService adminUserService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    // Verifica que el servicio obtiene todos los usuarios del repositorio y los mapea correctamente a respuestas

    @Test
    void getAllUsers_returnsMappedResponses() {
        User user = new User();
        user.setId(1L);
        user.setEmail("a@b.com");
        user.setName("Alice");
        user.setPassword("pwd");
        user.setRole(UserRole.USER);
        user.setPhone("+123456789");
        user.setAddress("Addr");
        user.setCity("City");
        user.setCountry("Country");

        when(userRepository.findAll()).thenReturn(Collections.singletonList(user));

        var responses = adminUserService.getAllUsers();

        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).getEmail()).isEqualTo("a@b.com");

        verify(userRepository, times(1)).findAll();
    }

    // Verifica que el servicio crea un usuario correctamente cuando el email no existe

    @Test
    void createUser_success() {
        AdminUserRequest req = new AdminUserRequest();
        req.setEmail("new@user.com");
        req.setPassword("plaintext");
        req.setName("New");
        req.setRole(UserRole.USER);
        req.setPhone("+34123456789");
        req.setAddress("Addr");
        req.setCity("City");

        when(userRepository.existsByEmail("new@user.com")).thenReturn(false);
        when(passwordEncoder.encode("plaintext")).thenReturn("encoded");

        User saved = new User();
        saved.setId(10L);
        saved.setEmail(req.getEmail());
        saved.setPassword("encoded");
        saved.setName(req.getName());
        saved.setRole(req.getRole());
        saved.setPhone(req.getPhone());
        saved.setAddress(req.getAddress());
        saved.setCity(req.getCity());
        saved.setCountry("Country");

        when(userRepository.save(any(User.class))).thenReturn(saved);

        var response = adminUserService.createUser(req);

        assertThat(response).isNotNull();
        assertThat(response.getEmail()).isEqualTo("new@user.com");

        verify(userRepository).existsByEmail("new@user.com");
        verify(passwordEncoder).encode("plaintext");
        verify(userRepository).save(any(User.class));
    }

    // Verifica que el servicio lanza UserAlreadyExistsException cuando el email ya está registrado
    @Test
    void createUser_emailExists_throws() {
        AdminUserRequest req = new AdminUserRequest();
        req.setEmail("exists@u.com");

        when(userRepository.existsByEmail("exists@u.com")).thenReturn(true);

        assertThatThrownBy(() -> adminUserService.createUser(req))
                .isInstanceOf(UserAlreadyExistsException.class);

        verify(userRepository).existsByEmail("exists@u.com");
        verify(userRepository, never()).save(any());
    }

    // Verifica que el servicio lanza UserNotFoundException cuando se intenta actualizar un usuario inexistente
    @Test
    void updateUser_notFound_throws() {
        when(userRepository.findById(5L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> adminUserService.updateUser(5L, new AdminUserRequest()))
                .isInstanceOf(UserNotFoundException.class);

        verify(userRepository).findById(5L);
    }

    // Verifica que el servicio lanza UserNotFoundException cuando se intenta eliminar un usuario inexistente
    @Test
    void deleteUser_notFound_throws() {
        when(userRepository.existsById(7L)).thenReturn(false);

        assertThatThrownBy(() -> adminUserService.deleteUser(7L))
                .isInstanceOf(UserNotFoundException.class);

        verify(userRepository).existsById(7L);
    }

    // Verifica que el servicio elimina correctamente un usuario existente
    @Test
    void deleteUser_success_deletes() {
        when(userRepository.existsById(3L)).thenReturn(true);

        adminUserService.deleteUser(3L);

        verify(userRepository).deleteById(3L);
    }
}
