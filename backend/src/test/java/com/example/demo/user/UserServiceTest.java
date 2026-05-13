package com.example.demo.user;

import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.RegisterRequest;
import com.example.demo.dto.UserResponse;
import com.example.demo.dto.UserUpdateData;
import com.example.demo.exception.InvalidCredentialsException;
import com.example.demo.exception.UserAlreadyExistsException;
import com.example.demo.exception.UserNotFoundException;
import com.example.demo.model.User;
import com.example.demo.model.UserRole;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.WalletRepository;
import com.example.demo.security.JwtUtil;
import com.example.demo.service.UserService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private WalletRepository walletRepository;

    @InjectMocks
    private UserService userService;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private User existingUser;
    private static final String TEST_IP = "127.0.0.1";

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest();
        registerRequest.setEmail("new.user@test.com");
        registerRequest.setPassword("plain-password");
        registerRequest.setName("New User");
        registerRequest.setPhone("666555444");
        registerRequest.setAddress("Street 1");
        registerRequest.setCity("Sevilla");
        registerRequest.setCountry("Spain");

        loginRequest = new LoginRequest();
        loginRequest.setEmail("new.user@test.com");
        loginRequest.setPassword("plain-password");

        existingUser = new User("new.user@test.com", "hashed-password", "New User", UserRole.USER, "", "", "", "");
        existingUser.setId(10L);
    }

    @Test
    void register_success_createsUserWalletAndToken() {
        when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(registerRequest.getPassword())).thenReturn("hashed-password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User saved = invocation.getArgument(0);
            saved.setId(10L);
            return saved;
        });
        when(jwtUtil.generateToken("new.user@test.com", 10L, UserRole.USER, 0)).thenReturn("jwt-token");

        // CORREGIDO: Ahora pasamos la IP
        UserResponse response = userService.register(registerRequest, TEST_IP);

        assertNotNull(response);
        assertEquals(10L, response.getId());
        assertEquals("new.user@test.com", response.getEmail());
        assertEquals(UserRole.USER, response.getRole());
        assertEquals("jwt-token", response.getToken());

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());

        User userToSave = userCaptor.getValue();
        assertEquals("new.user@test.com", userToSave.getEmail());
        assertEquals("hashed-password", userToSave.getPassword());
        assertEquals("New User", userToSave.getName());
        assertEquals(UserRole.USER, userToSave.getRole());

        verify(walletRepository).save(any());
        verify(jwtUtil).generateToken("new.user@test.com", 10L, UserRole.USER, 0);
    }

    @Test
    void register_existingEmail_throwsUserAlreadyExistsException() {
        when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(true);

        // CORREGIDO: Ahora pasamos la IP
        assertThrows(UserAlreadyExistsException.class, () -> userService.register(registerRequest, TEST_IP));

        verify(userRepository, never()).save(any(User.class));
        verify(walletRepository, never()).save(any());
        verify(jwtUtil, never()).generateToken(any(), any(), any(), any());
    }

    @Test
    void login_success_returnsUserResponseWithToken() {
        when(userRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.of(existingUser));
        when(passwordEncoder.matches(loginRequest.getPassword(), existingUser.getPassword())).thenReturn(true);
        when(jwtUtil.generateToken(existingUser.getEmail(), existingUser.getId(), existingUser.getRole(), existingUser.getTokenVersion())).thenReturn("jwt-token");

        UserResponse response = userService.login(loginRequest);

        assertNotNull(response);
        assertEquals(existingUser.getId(), response.getId());
        assertEquals(existingUser.getEmail(), response.getEmail());
        assertEquals("jwt-token", response.getToken());

        verify(jwtUtil).generateToken(eq(existingUser.getEmail()), eq(existingUser.getId()), eq(existingUser.getRole()), eq(existingUser.getTokenVersion()));
    }

    @Test
    void login_userNotFound_throwsUserNotFoundException() {
        when(userRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () -> userService.login(loginRequest));

        verify(passwordEncoder, never()).matches(any(), any());
        verify(jwtUtil, never()).generateToken(any(), any(), any(), any());
    }

    @Test
    void login_wrongPassword_throwsInvalidCredentialsException() {
        when(userRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.of(existingUser));
        when(passwordEncoder.matches(loginRequest.getPassword(), existingUser.getPassword())).thenReturn(false);

        assertThrows(InvalidCredentialsException.class, () -> userService.login(loginRequest));

        verify(jwtUtil, never()).generateToken(any(), any(), any(), any());
    }

    @Test
    void getUserById_success_returnsUserResponse() {
        when(userRepository.findById(10L)).thenReturn(Optional.of(existingUser));

        UserResponse response = userService.getUserById(10L);

        assertNotNull(response);
        assertEquals(10L, response.getId());
        assertEquals("new.user@test.com", response.getEmail());
        assertEquals("New User", response.getName());
    }

    @Test
    void getUserById_userNotFound_throwsUserNotFoundException() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () -> userService.getUserById(999L));
    }

    @Test
    void updateUser_success_updatesOnlyProvidedFields() {
        UserUpdateData updateData = new UserUpdateData();
        updateData.setName("Updated Name");
        updateData.setCity("Valencia");

        when(userRepository.findById(10L)).thenReturn(Optional.of(existingUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserResponse response = userService.updateUser(10L, updateData);

        assertNotNull(response);
        assertEquals("Updated Name", response.getName());
        assertEquals("Valencia", response.getCity());
        assertEquals("new.user@test.com", response.getEmail());

        verify(userRepository).save(existingUser);
    }

    @Test
    void updateUser_userNotFound_throwsUserNotFoundException() {
        UserUpdateData updateData = new UserUpdateData();
        updateData.setName("Updated Name");

        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () -> userService.updateUser(999L, updateData));

        verify(userRepository, never()).save(any(User.class));
    }
}