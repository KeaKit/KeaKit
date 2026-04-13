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
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.example.demo.repository.WalletRepository;
import org.springframework.security.core.Authentication;


import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AdminUserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private WalletRepository walletRepository;

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
        when(walletRepository.save(any())).thenReturn(null);

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
        doNothing().when(walletRepository).deleteByUserId(3L);

        adminUserService.deleteUser(3L);

        verify(walletRepository).deleteByUserId(3L);
        verify(userRepository).deleteById(3L);
    }


    @Test
    void getUsersAdmin_authenticationNull_returnsAllUsers() {
        SecurityContextHolder.getContext().setAuthentication(null);

        User u1 = new User();
        u1.setEmail("a@b.com");

        when(userRepository.findAll()).thenReturn(List.of(u1));

        var result = adminUserService.getUsersAdmin();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getEmail()).isEqualTo("a@b.com");
    }


    @Test
    void getUsersAdmin_filtersCurrentUser() {
        Authentication auth = mock(Authentication.class);
        when(auth.getName()).thenReturn("me@domain.com");
        SecurityContextHolder.getContext().setAuthentication(auth);

        User u1 = new User();
        u1.setEmail("me@domain.com");

        User u2 = new User();
        u2.setEmail("other@domain.com");

        when(userRepository.findAll()).thenReturn(List.of(u1, u2));

        var result = adminUserService.getUsersAdmin();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getEmail()).isEqualTo("other@domain.com");
    }


    @Test
    void createUser_roleNull_assignsDefaultUserRole() {
        AdminUserRequest req = new AdminUserRequest();
        req.setEmail("new@user.com");
        req.setPassword("pwd");
        req.setName("Test");
        req.setRole(null); // <--- caso a probar

        when(userRepository.existsByEmail("new@user.com")).thenReturn(false);
        when(passwordEncoder.encode("pwd")).thenReturn("encoded");

        User saved = new User();
        saved.setId(1L);
        saved.setEmail("new@user.com");
        saved.setRole(UserRole.USER); // esperado

        when(userRepository.save(any(User.class))).thenReturn(saved);
        when(walletRepository.save(any())).thenReturn(null);

        var response = adminUserService.createUser(req);

        assertThat(response.getRole()).isEqualTo(UserRole.USER);
    }

    @Test
    void updateUser_emailAlreadyExists_throws() {
        User existing = new User();
        existing.setId(10L);
        existing.setEmail("old@mail.com");

        AdminUserRequest req = new AdminUserRequest();
        req.setEmail("new@mail.com");

        when(userRepository.findById(10L)).thenReturn(Optional.of(existing));
        when(userRepository.existsByEmail("new@mail.com")).thenReturn(true);

        assertThatThrownBy(() -> adminUserService.updateUser(10L, req))
                .isInstanceOf(UserAlreadyExistsException.class)
                .hasMessageContaining("El correo ya está registrado.");
    }


    @Test
    void updateUser_passwordUpdated_encodesPassword() {
        User existing = new User();
        existing.setId(11L);
        existing.setEmail("test@mail.com");

        AdminUserRequest req = new AdminUserRequest();
        req.setPassword("newpass");

        when(userRepository.findById(11L)).thenReturn(Optional.of(existing));
        when(passwordEncoder.encode("newpass")).thenReturn("encodedPass");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        adminUserService.updateUser(11L, req);

        verify(passwordEncoder).encode("newpass");
    }

    @Test
    void updateUser_updatesAllFields() {
        User existing = new User();
        existing.setId(12L);
        existing.setEmail("old@mail.com");

        AdminUserRequest req = new AdminUserRequest();
        req.setEmail("new@mail.com");
        req.setName("NewName");
        req.setRole(UserRole.ADMIN);
        req.setPhone("123");
        req.setAddress("NewAddr");
        req.setCity("NewCity");
        req.setCountry("NewCountry");

        when(userRepository.findById(12L)).thenReturn(Optional.of(existing));
        when(userRepository.existsByEmail("new@mail.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        var response = adminUserService.updateUser(12L, req);

        assertThat(response.getEmail()).isEqualTo("new@mail.com");
        assertThat(response.getName()).isEqualTo("NewName");
        assertThat(response.getRole()).isEqualTo(UserRole.ADMIN);
        assertThat(response.getPhone()).isEqualTo("123");
        assertThat(response.getAddress()).isEqualTo("NewAddr");
        assertThat(response.getCity()).isEqualTo("NewCity");
        assertThat(response.getCountry()).isEqualTo("NewCountry");
    }

}