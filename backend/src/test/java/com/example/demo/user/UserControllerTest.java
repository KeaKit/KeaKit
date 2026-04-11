package com.example.demo.user;

import com.example.demo.controller.UserController;
import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.RegisterRequest;
import com.example.demo.dto.UserResponse;
import com.example.demo.dto.UserUpdateData;
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
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Date;

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
        private UserResponse profileResponse;

        @BeforeEach
        void setUp() {
                User user = new User("new.user@test.com", "hashed-password", "New User", UserRole.USER, "666555444",
                                "Street 1", "Sevilla", "Spain");
                user.setId(10L);

                registerResponse = new UserResponse(user, "register-token");
                loginResponse = new UserResponse(user, "login-token");
                profileResponse = new UserResponse(user);

                SecurityContextHolder.clearContext();
        }

        @Test
        void register_success() throws Exception {
                when(userService.register(any(RegisterRequest.class), anyString())).thenReturn(registerResponse);

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
                when(userService.register(any(RegisterRequest.class), anyString()))
                                .thenThrow(new UserAlreadyExistsException("Email already exists"));

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
                when(userService.login(any(LoginRequest.class))).thenReturn(loginResponse);

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
                when(userService.login(any(LoginRequest.class)))
                                .thenThrow(new InvalidCredentialsException("Invalid password"));

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
                when(userService.login(any(LoginRequest.class))).thenThrow(new UserNotFoundException("User not found"));

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

        @Test
        void getUser_authorized_returnsUserProfile() throws Exception {
                SecurityContextHolder.getContext().setAuthentication(
                                new UsernamePasswordAuthenticationToken("new.user@test.com", null));
                when(userService.getUserById(10L)).thenReturn(profileResponse);

                mockMvc.perform(get("/api/users/10"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.id").value(10L))
                                .andExpect(jsonPath("$.email").value("new.user@test.com"))
                                .andExpect(jsonPath("$.name").value("New User"));
        }

        @Test
        void getUser_notAuthorized_returnsForbidden() throws Exception {
                SecurityContextHolder.getContext().setAuthentication(
                                new UsernamePasswordAuthenticationToken("other.user@test.com", null));
                when(userService.getUserById(10L)).thenReturn(profileResponse);

                mockMvc.perform(get("/api/users/10"))
                                .andExpect(status().isForbidden());
        }

        @Test
        void updateUser_authorized_returnsUpdatedProfile() throws Exception {
                SecurityContextHolder.getContext().setAuthentication(
                                new UsernamePasswordAuthenticationToken("new.user@test.com", null));

                User updatedUser = new User("new.user@test.com", "hashed-password", "Updated Name", UserRole.USER,
                                "666555444", "Street 2", "Valencia", "Spain");
                updatedUser.setId(10L);
                UserResponse updatedResponse = new UserResponse(updatedUser);

                when(userService.getUserById(10L)).thenReturn(profileResponse);
                when(userService.updateUser(eq(10L), any(UserUpdateData.class))).thenReturn(updatedResponse);

                mockMvc.perform(put("/api/users/10")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                                                {
                                                  "name":"Updated Name",
                                                  "address":"Street 2",
                                                  "city":"Valencia"
                                                }
                                                """))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.id").value(10L))
                                .andExpect(jsonPath("$.name").value("Updated Name"))
                                .andExpect(jsonPath("$.city").value("Valencia"));
        }

        @Test
        void updateUser_notAuthorized_returnsForbidden() throws Exception {
                SecurityContextHolder.getContext().setAuthentication(
                                new UsernamePasswordAuthenticationToken("other.user@test.com", null));
                when(userService.getUserById(10L)).thenReturn(profileResponse);

                mockMvc.perform(put("/api/users/10")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                                                {
                                                  "name":"Updated Name"
                                                }
                                                """))
                                .andExpect(status().isForbidden());
        }

        @Test
        void logout_invalidTokenFormat_returnsBadRequest() throws Exception {
                when(jwtUtil.extractTokenFromAuthHeader("bad")).thenReturn(null);

                mockMvc.perform(post("/api/users/logout")
                                .header("Authorization", "bad"))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.message").value("Invalid token format"));
        }

        @Test
        void logout_invalidOrExpiredToken_returnsUnauthorized() throws Exception {
                when(jwtUtil.extractTokenFromAuthHeader("Bearer token")).thenReturn("token");
                when(jwtUtil.validateToken("token")).thenReturn(false);

                mockMvc.perform(post("/api/users/logout")
                                .header("Authorization", "Bearer token"))
                                .andExpect(status().isUnauthorized())
                                .andExpect(jsonPath("$.message").value("Invalid or expired token"));
        }

        @Test
        void logout_validToken_blacklistsAndReturnsOk() throws Exception {
                when(jwtUtil.extractTokenFromAuthHeader("Bearer token")).thenReturn("token");
                when(jwtUtil.validateToken("token")).thenReturn(true);
                when(jwtUtil.extractExpiration("token")).thenReturn(new Date());

                mockMvc.perform(post("/api/users/logout")
                                .header("Authorization", "Bearer token"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.message").value("Logout successful"));

                verify(tokenBlacklistService).blacklistToken(eq("token"), any());
        }

        @Test
        void logout_exception_returnsInternalServerError() throws Exception {
                when(jwtUtil.extractTokenFromAuthHeader("Bearer token")).thenReturn("token");
                when(jwtUtil.validateToken("token")).thenThrow(new RuntimeException("boom"));

                mockMvc.perform(post("/api/users/logout")
                                .header("Authorization", "Bearer token"))
                                .andExpect(status().isInternalServerError())
                                .andExpect(jsonPath("$.message").value("Error processing logout: boom"));
        }

        @Test
        void logout_validTokenWithNullExpiration_stillBlacklistsAndReturnsOk() throws Exception {
                when(jwtUtil.extractTokenFromAuthHeader("Bearer token")).thenReturn("token");
                when(jwtUtil.validateToken("token")).thenReturn(true);
                when(jwtUtil.extractExpiration("token")).thenReturn(null); // ← caso no cubierto

                mockMvc.perform(post("/api/users/logout")
                                .header("Authorization", "Bearer token"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.message").value("Logout successful"));

                verify(tokenBlacklistService).blacklistToken(eq("token"), isNull());
        }

        @Test
        void register_ipHeaderNull_usesRemoteAddr() throws Exception {
                User user = new User("test@test.com", "pwd", "Test", UserRole.USER,
                                "123", "Addr", "City", "Country");
                user.setId(1L);
                UserResponse resp = new UserResponse(user);

                when(userService.register(any(RegisterRequest.class), eq("88.99.11.22"))).thenReturn(resp);

                mockMvc.perform(post("/api/users/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                                                {
                                                "email":"test@test.com",
                                                "password":"12345678",
                                                "name":"Test",
                                                "phone":"666555444",
                                                "address":"Street 1",
                                                "city":"Sevilla",
                                                "country":"Spain"
                                                }
                                                """)
                                .with(r -> {
                                        r.setRemoteAddr("88.99.11.22");
                                        return r;
                                }))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.email").value("test@test.com"));
        }

        @Test
        void register_ipHeaderEmpty_usesRemoteAddr() throws Exception {
        User user = new User("test@test.com", "pwd", "Test", UserRole.USER,
                "123", "Addr", "City", "Country");
        user.setId(1L);
        UserResponse resp = new UserResponse(user);

        when(userService.register(any(RegisterRequest.class), eq("55.66.77.88"))).thenReturn(resp);

        mockMvc.perform(post("/api/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                "email":"test@test.com",
                                "password":"12345678",
                                "name":"Test",
                                "phone":"666555444",
                                "address":"Street 1",
                                "city":"Sevilla",
                                "country":"Spain"
                                }
                                """)
                        .header("X-Forwarded-For", "")
                        .with(r -> {
                                r.setRemoteAddr("55.66.77.88");
                                return r;
                        }))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("test@test.com"));
        }


        @Test
        void register_ipHeaderPresent_doesNotUseRemoteAddr() throws Exception {
        User user = new User("test@test.com", "pwd", "Test", UserRole.USER,
                "123", "Addr", "City", "Country");
        user.setId(1L);
        UserResponse resp = new UserResponse(user);

        when(userService.register(any(RegisterRequest.class), eq("1.2.3.4"))).thenReturn(resp);

        mockMvc.perform(post("/api/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                "email":"test@test.com",
                                "password":"12345678",
                                "name":"Test",
                                "phone":"666555444",
                                "address":"Street 1",
                                "city":"Sevilla",
                                "country":"Spain"
                                }
                                """)
                        .header("X-Forwarded-For", "1.2.3.4")
                        .with(r -> {
                                r.setRemoteAddr("99.99.99.99"); // NO debe usarse
                                return r;
                        }))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("test@test.com"));
        }


        @Test
        void register_remoteAddrNull_returnsUnknown() throws Exception {
        User user = new User("test@test.com", "pwd", "Test", UserRole.USER,
                "123", "Addr", "City", "Country");
        user.setId(1L);
        UserResponse resp = new UserResponse(user);

        when(userService.register(any(RegisterRequest.class), eq("unknown"))).thenReturn(resp);

        mockMvc.perform(post("/api/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                "email":"test@test.com",
                                "password":"12345678",
                                "name":"Test",
                                "phone":"666555444",
                                "address":"Street 1",
                                "city":"Sevilla",
                                "country":"Spain"
                                }
                                """)
                        .with(r -> {
                                r.setRemoteAddr(null);
                                return r;
                        }))
                .andExpect(status().isOk());
        }


        @Test
        void register_remoteAddrEmpty_returnsUnknown() throws Exception {
        User user = new User("test@test.com", "pwd", "Test", UserRole.USER,
                "123", "Addr", "City", "Country");
        user.setId(1L);
        UserResponse resp = new UserResponse(user);

        when(userService.register(any(RegisterRequest.class), eq("unknown"))).thenReturn(resp);

        mockMvc.perform(post("/api/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                "email":"test@test.com",
                                "password":"12345678",
                                "name":"Test",
                                "phone":"666555444",
                                "address":"Street 1",
                                "city":"Sevilla",
                                "country":"Spain"
                                }
                                """)
                        .with(r -> {
                                r.setRemoteAddr("");
                                return r;
                        }))
                .andExpect(status().isOk());
        }


        @Test
        void register_ipv6Localhost_returnsUnknown() throws Exception {
        User user = new User("test@test.com", "pwd", "Test", UserRole.USER,
                "123", "Addr", "City", "Country");
        user.setId(1L);
        UserResponse resp = new UserResponse(user);

        when(userService.register(any(RegisterRequest.class), eq("unknown"))).thenReturn(resp);

        mockMvc.perform(post("/api/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                "email":"test@test.com",
                                "password":"12345678",
                                "name":"Test",
                                "phone":"666555444",
                                "address":"Street 1",
                                "city":"Sevilla",
                                "country":"Spain"
                                }
                                """)
                        .with(r -> {
                                r.setRemoteAddr("0:0:0:0:0:0:0:1");
                                return r;
                        }))
                .andExpect(status().isOk());
        }


}