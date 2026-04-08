package com.example.demo.user;

import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.RegisterRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class UserControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private RegisterRequest buildValidRegisterRequest() {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("test@example.com");
        req.setPassword("password123");
        req.setName("Test User");
        req.setPhone("+34612345678");
        req.setAddress("Calle Mayor 1");
        req.setCity("Sevilla");
        req.setCountry("Spain");
        return req;
    }

    private LoginRequest buildValidLoginRequest() {
        LoginRequest req = new LoginRequest();
        req.setEmail("test@example.com");
        req.setPassword("password123");
        return req;
    }

    @Test
    @DisplayName("POST /register - registro exitoso devuelve 200 con token")
    void register_success() throws Exception {
        RegisterRequest request = buildValidRegisterRequest();

        mockMvc.perform(post("/api/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(request.getEmail()))
                .andExpect(jsonPath("$.token").isNotEmpty());
    }

    @Test
    @DisplayName("POST /register - email duplicado devuelve 409")
    void register_duplicateEmail_returns409() throws Exception {
        RegisterRequest request = buildValidRegisterRequest();
        request.setEmail("duplicate@example.com");

        mockMvc.perform(post("/api/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("POST /register - email inválido devuelve 400")
    void register_invalidEmail_returns400() throws Exception {
        RegisterRequest request = buildValidRegisterRequest();
        request.setEmail("not-an-email");

        mockMvc.perform(post("/api/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /register - contraseña corta devuelve 400")
    void register_shortPassword_returns400() throws Exception {
        RegisterRequest request = buildValidRegisterRequest();
        request.setPassword("123");

        mockMvc.perform(post("/api/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /register - campos obligatorios vacíos devuelven 400")
    void register_missingFields_returns400() throws Exception {
        mockMvc.perform(post("/api/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /register - teléfono inválido devuelve 400")
    void register_invalidPhone_returns400() throws Exception {
        RegisterRequest request = buildValidRegisterRequest();
        request.setPhone("abc");

        mockMvc.perform(post("/api/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /login - credenciales correctas devuelven 200 con token")
    void login_success() throws Exception {
        RegisterRequest register = buildValidRegisterRequest();
        register.setEmail("loginok@example.com");
        mockMvc.perform(post("/api/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(register)))
                .andExpect(status().isOk());

        LoginRequest login = buildValidLoginRequest();
        login.setEmail("loginok@example.com");

        mockMvc.perform(post("/api/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(login.getEmail()))
                .andExpect(jsonPath("$.token").isNotEmpty());
    }

    @Test
    @DisplayName("POST /login - contraseña incorrecta devuelve 401")
    void login_wrongPassword_returns401() throws Exception {
        RegisterRequest register = buildValidRegisterRequest();
        register.setEmail("wrongpass@example.com");
        mockMvc.perform(post("/api/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(register)))
                .andExpect(status().isOk());

        LoginRequest login = buildValidLoginRequest();
        login.setEmail("wrongpass@example.com");
        login.setPassword("wrongpassword");

        mockMvc.perform(post("/api/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /login - usuario inexistente devuelve 404")
    void login_userNotFound_returns404() throws Exception {
        LoginRequest login = buildValidLoginRequest();
        login.setEmail("noexiste@example.com");

        mockMvc.perform(post("/api/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("POST /login - email vacío devuelve 400")
    void login_blankEmail_returns400() throws Exception {
        LoginRequest login = buildValidLoginRequest();
        login.setEmail("");

        mockMvc.perform(post("/api/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /login - email con formato inválido devuelve 400")
    void login_invalidEmailFormat_returns400() throws Exception {
        LoginRequest login = buildValidLoginRequest();
        login.setEmail("not-valid");

        mockMvc.perform(post("/api/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /login - token devuelto tiene estructura JWT válida")
    void login_tokenHasJwtStructure() throws Exception {
        RegisterRequest register = buildValidRegisterRequest();
        register.setEmail("jwtcheck@example.com");
        mockMvc.perform(post("/api/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(register)))
                .andExpect(status().isOk());

        LoginRequest login = buildValidLoginRequest();
        login.setEmail("jwtcheck@example.com");

        MvcResult result = mockMvc.perform(post("/api/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andReturn();

        String responseBody = result.getResponse().getContentAsString();
        String token = objectMapper.readTree(responseBody).get("token").asText();

        assert token.split("\\.").length == 3 : "Token no tiene estructura JWT válida";
    }
}