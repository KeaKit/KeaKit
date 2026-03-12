package com.example.demo.user;

import com.example.demo.controller.UserController;
import com.example.demo.dto.UserResponse;
import com.example.demo.exception.InvalidCredentialsException;
import com.example.demo.exception.UserAlreadyExistsException;
import com.example.demo.exception.UserNotFoundException;
import com.example.demo.model.User;
import com.example.demo.model.UserRole;
import com.example.demo.security.JwtUtil;
import com.example.demo.security.TokenBlacklistService;
import com.example.demo.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = UserController.class, excludeAutoConfiguration = {
        SecurityAutoConfiguration.class,
        SecurityFilterAutoConfiguration.class
})
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private TokenBlacklistService tokenBlacklistService;

    @MockitoBean
    private JwtUtil jwtUtil;

    @MockitoBean
    private com.example.demo.security.CustomUserDetailsService customUserDetailsService;

    private UserResponse registerResponse;
    private UserResponse loginResponse;

    @BeforeEach
    void setUp() {
        User user = new User("new.user@test.com", "hashed-password", "New User", UserRole.USER, "666555444", "Street 1", "Sevilla", "Spain");
        user.setId(10L);

        registerResponse = new UserResponse(user, "register-token");
        loginResponse = new UserResponse(user, "login-token");
    }

    @Test
    void register_success() throws Exception {
        when(userService.register(any())).thenReturn(registerResponse);

        mockMvc.perform(post("/api/users/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "email":"new.user@test.com",
                          "password":"plain-password",
                          "name":"New User",
                          "phone":"666555444",
                          "address":"Street 1",
                          "city":"Sevilla",
                          "country":"Spain"
                        }
                        """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(10L))
            .andExpect(jsonPath("$.email").value("new.user@test.com"))
            .andExpect(jsonPath("$.token").value("register-token"));
    }

    @Test
    void register_userAlreadyExists_returnsConflict() throws Exception {
        when(userService.register(any())).thenThrow(new UserAlreadyExistsException("Email already exists"));

        mockMvc.perform(post("/api/users/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "email":"new.user@test.com",
                          "password":"plain-password",
                          "name":"New User",
                          "phone":"666555444",
                          "address":"Street 1",
                          "city":"Sevilla",
                          "country":"Spain"
                        }
                        """))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.message").value("Email already exists"));
    }

    @Test
    void login_success() throws Exception {
        when(userService.login(any())).thenReturn(loginResponse);

        mockMvc.perform(post("/api/users/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "email":"new.user@test.com",
                          "password":"plain-password"
                        }
                        """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.email").value("new.user@test.com"))
            .andExpect(jsonPath("$.token").value("login-token"));
    }

    @Test
    void login_invalidCredentials_returnsUnauthorized() throws Exception {
        when(userService.login(any())).thenThrow(new InvalidCredentialsException("Invalid password"));

        mockMvc.perform(post("/api/users/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "email":"new.user@test.com",
                          "password":"wrong-password"
                        }
                        """))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.message").value("Invalid password"));
    }

    @Test
    void login_userNotFound_returnsNotFound() throws Exception {
        when(userService.login(any())).thenThrow(new UserNotFoundException("User not found"));

        mockMvc.perform(post("/api/users/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "email":"missing.user@test.com",
                          "password":"plain-password"
                        }
                        """))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.message").value("User not found"));
    }
}
