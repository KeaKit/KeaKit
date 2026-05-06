package com.example.demo.controller;

import com.example.demo.dto.AdminUserRequest;
import com.example.demo.dto.UserResponse;
import com.example.demo.model.UserRole;
import com.example.demo.service.AdminUserService;
import com.example.demo.service.AdminUserDeletionService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class AdminUserControllerTest {

    private MockMvc mockMvc;

    @Mock
    private AdminUserService adminUserService;

    @Mock
    private AdminUserDeletionService adminUserDeletionService;

    @InjectMocks
    private AdminUserController adminUserController;

    private ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(adminUserController).build();
    }

    // Verifica que el endpoint GET /api/admin/users devuelve la lista de usuarios correctamente

    @Test
    void getAllUsers_returnsOk() throws Exception {
        // Build a User and create a UserResponse from it (use available constructor)
        var user = new com.example.demo.model.User();
        user.setId(1L);
        user.setEmail("a@b.com");
        user.setName("Alice");
        user.setPassword("pwd");
        user.setRole(UserRole.USER);
        user.setPhone("+123456789");
        user.setAddress("Addr");
        user.setCity("City");
        user.setCountry("Country");

        UserResponse resp = new UserResponse(user);

        when(adminUserService.getAllUsers()).thenReturn(Collections.singletonList(resp));

        mockMvc.perform(get("/api/admin/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    // Verifica que el endpoint POST /api/admin/users crea un usuario y devuelve status 200 con el email correcto

    @Test
    void createUser_returnsOk() throws Exception {
        AdminUserRequest req = new AdminUserRequest();
        req.setEmail("c@d.com");
        req.setPassword("pppppp");
        req.setName("Carlos");
        req.setRole(UserRole.USER);

        req.setPhone("123456789"); // Entre 9 y 15 caracteres
        req.setAddress("Calle Falsa 123"); // Más de 5 caracteres
        req.setCity("Madrid"); // Sin números
        req.setCountry("Espana");

    var user = new com.example.demo.model.User();
    user.setEmail("c@d.com");
    user.setName("C");
    user.setPassword("p");
    user.setRole(UserRole.USER);
    user.setPhone("+34123456789");
    user.setAddress("Addr");
    user.setCity("City");
    user.setCountry("Country");

    UserResponse resp = new UserResponse(user);
        when(adminUserService.createUser(any(AdminUserRequest.class))).thenReturn(resp);

        mockMvc.perform(post("/api/admin/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath(".email").value("c@d.com"));
    }

    // Verifica que el endpoint PUT /api/admin/users/{id} actualiza un usuario y devuelve los datos actualizados

    @Test
    void updateUser_returnsOk() throws Exception {
        AdminUserRequest req = new AdminUserRequest();
        req.setName("UpdatedNombre");
        req.setEmail("correo@actualizado.com");
        req.setRole(UserRole.USER);
        req.setPhone("987654321");
        req.setAddress("Avenida Siempre Viva 742");
        req.setCity("Barcelona");
        req.setCountry("Espana");

    var user2 = new com.example.demo.model.User();
    user2.setName("Updated");
    user2.setEmail("x@y.com");
    user2.setPassword("p");
    user2.setRole(UserRole.USER);
    user2.setPhone("+34123456789");
    user2.setAddress("Addr");
    user2.setCity("City");
    user2.setCountry("Country");

    UserResponse resp = new UserResponse(user2);

        when(adminUserService.updateUser(any(Long.class), any(AdminUserRequest.class))).thenReturn(resp);

        mockMvc.perform(put("/api/admin/users/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath(".name").value("Updated"));
    }

    @Test
    void deleteUser_returnsOk() throws Exception {
        doNothing().when(adminUserDeletionService).deleteUserWithItems(2L);

        mockMvc.perform(delete("/api/admin/users/2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Usuario eliminado correctamente"));
    }


    @Test
    void deleteUser_activeRentals_returnsBadRequestWithCode() throws Exception {
        String errorMessage = "El usuario tiene alquileres activos";

        // Simular excepción desde el servicio
        org.mockito.Mockito.doThrow(new RuntimeException(errorMessage))
                .when(adminUserDeletionService).deleteUserWithItems(5L);

        mockMvc.perform(delete("/api/admin/users/5"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value(errorMessage))
                .andExpect(jsonPath("$.code").value("ACTIVE_RENTALS_EXIST"))
                .andExpect(jsonPath("$.resolution").exists());
    }

    @Test
    void deleteUser_paidRentals_returnsBadRequestWithCode() throws Exception {
        String errorMessage = "Tiene alquileres pagado pendientes";

        org.mockito.Mockito.doThrow(new RuntimeException(errorMessage))
                .when(adminUserDeletionService).deleteUserWithItems(6L);

        mockMvc.perform(delete("/api/admin/users/6"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value(errorMessage))
                .andExpect(jsonPath("$.code").value("PAID_RENTALS_EXIST"))
                .andExpect(jsonPath("$.resolution").exists());
    }

    @Test
    void deleteUser_itemInActiveRental_returnsBadRequestWithCode() throws Exception {
        String errorMessage = "El artículo está en un alquiler activo o pagado";

        org.mockito.Mockito.doThrow(new RuntimeException(errorMessage))
                .when(adminUserDeletionService).deleteUserWithItems(7L);

        mockMvc.perform(delete("/api/admin/users/7"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value(errorMessage))
                .andExpect(jsonPath("$.code").value("ITEM_IN_ACTIVE_RENTAL"))
                .andExpect(jsonPath("$.resolution").exists());
    }

    @Test
    void deleteUser_genericError_returnsBadRequestWithoutCode() throws Exception {
        String errorMessage = "Error inesperado";

        org.mockito.Mockito.doThrow(new RuntimeException(errorMessage))
                .when(adminUserDeletionService).deleteUserWithItems(8L);

        mockMvc.perform(delete("/api/admin/users/8"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value(errorMessage))
                .andExpect(jsonPath("$.code").doesNotExist())
                .andExpect(jsonPath("$.resolution").doesNotExist());
    }


    @Test
    void getUsersAdmin_returnsEmptyList() throws Exception {
        when(adminUserService.getUsersAdmin()).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/admin/users/no-self"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void getUsersAdmin_returnsList() throws Exception {
        var user = new com.example.demo.model.User();
        user.setId(1L);
        user.setEmail("test@domain.com");
        user.setName("Test");
        user.setPassword("pwd");
        user.setRole(UserRole.USER);
        user.setPhone("123");
        user.setAddress("Addr");
        user.setCity("City");
        user.setCountry("Country");

        UserResponse resp = new UserResponse(user);

        when(adminUserService.getUsersAdmin()).thenReturn(Collections.singletonList(resp));

        mockMvc.perform(get("/api/admin/users/no-self"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].email").value("test@domain.com"));
    }

}