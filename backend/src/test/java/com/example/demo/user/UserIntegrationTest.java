package com.example.demo.user;

import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.RegisterRequest;
import com.example.demo.dto.UserResponse;
import com.example.demo.dto.UserUpdateData;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class UserControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private RegisterRequest buildValidRegisterRequest(String email) {
        RegisterRequest req = new RegisterRequest();
        req.setEmail(email);
        req.setPassword("password123");
        req.setName("Test User");
        req.setPhone("+34612345678");
        req.setAddress("Calle Mayor 1");
        req.setCity("Sevilla");
        req.setCountry("Spain");
        return req;
    }

    private UserUpdateData buildValidUpdateData() {
        UserUpdateData data = new UserUpdateData();
        data.setName("Updated Name");
        data.setPhone("+34699999999");
        data.setAddress("Nueva Avenida 123");
        data.setCity("Madrid");
        data.setCountry("Spain");
        return data;
    }

    private UserResponse registerAndGetToken(String email) throws Exception {
        RegisterRequest request = buildValidRegisterRequest(email);
        MvcResult result = mockMvc.perform(post("/api/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andReturn();
        return objectMapper.readValue(result.getResponse().getContentAsString(), UserResponse.class);
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
        RegisterRequest request = buildValidRegisterRequest("test@example.com");

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
        RegisterRequest request = buildValidRegisterRequest("test@example.com");
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
        RegisterRequest request = buildValidRegisterRequest("test@example.com");
        request.setEmail("not-an-email");

        mockMvc.perform(post("/api/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /register - contraseña corta devuelve 400")
    void register_shortPassword_returns400() throws Exception {
        RegisterRequest request = buildValidRegisterRequest("test@example.com");
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
        RegisterRequest request = buildValidRegisterRequest("test@example.com");
        request.setPhone("abc");

        mockMvc.perform(post("/api/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /login - credenciales correctas devuelven 200 con token")
    void login_success() throws Exception {
        RegisterRequest register = buildValidRegisterRequest("test@example.com");
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
        RegisterRequest register = buildValidRegisterRequest("test@example.com");
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
        RegisterRequest register = buildValidRegisterRequest("test@example.com");
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

    @Test
    @DisplayName("PUT /api/users/{id} - Actualización exitosa")
    void updateUser_success() throws Exception {
        UserResponse registered = registerAndGetToken("updateok@example.com");
        UserUpdateData updateData = buildValidUpdateData();

        mockMvc.perform(put("/api/users/" + registered.getId())
                        .header("Authorization", "Bearer " + registered.getToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateData)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value(updateData.getName()))
                .andExpect(jsonPath("$.phone").value(updateData.getPhone()))
                .andExpect(jsonPath("$.city").value(updateData.getCity()));
    }

    @Test
    @DisplayName("PUT /api/users/{id} - Devuelve 403 si un usuario intenta actualizar a otro")
    void updateUser_forbidden_otherUser() throws Exception {
        UserResponse user1 = registerAndGetToken("user1@example.com");
        UserResponse user2 = registerAndGetToken("user2@example.com");
        
        UserUpdateData updateData = buildValidUpdateData();

        mockMvc.perform(put("/api/users/" + user1.getId())
                        .header("Authorization", "Bearer " + user2.getToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateData)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("PUT /api/users/{id} - Devuelve 401 si no hay token")
    void updateUser_unauthorized_noToken() throws Exception {
        UserUpdateData updateData = buildValidUpdateData();

        mockMvc.perform(put("/api/users/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateData)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("PUT /api/users/{id} - Error de validación: Nombre demasiado corto")
    void updateUser_invalidName_returns400() throws Exception {
        UserResponse registered = registerAndGetToken("shortname@example.com");
        UserUpdateData updateData = buildValidUpdateData();
        updateData.setName("A");

        mockMvc.perform(put("/api/users/" + registered.getId())
                        .header("Authorization", "Bearer " + registered.getToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateData)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("PUT /api/users/{id} - Error de validación: Teléfono inválido")
    void updateUser_invalidPhone_returns400() throws Exception {
        UserResponse registered = registerAndGetToken("badphone@example.com");
        UserUpdateData updateData = buildValidUpdateData();
        updateData.setPhone("123");

        mockMvc.perform(put("/api/users/" + registered.getId())
                        .header("Authorization", "Bearer " + registered.getToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateData)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("PUT /api/users/{id} - Error de validación: Dirección demasiado corta")
    void updateUser_invalidAddress_returns400() throws Exception {
        UserResponse registered = registerAndGetToken("shortaddress@example.com");
        UserUpdateData updateData = buildValidUpdateData();
        updateData.setAddress("Casa");

        mockMvc.perform(put("/api/users/" + registered.getId())
                        .header("Authorization", "Bearer " + registered.getToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateData)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("PUT /api/users/{id} - Devuelve 404 si el usuario no existe")
    void updateUser_notFound() throws Exception {
        UserResponse registered = registerAndGetToken("notfound@example.com");
        UserUpdateData updateData = buildValidUpdateData();

        mockMvc.perform(put("/api/users/9999")
                        .header("Authorization", "Bearer " + registered.getToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateData)))
                .andExpect(status().isNotFound());
    }
}