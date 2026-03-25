package com.example.demo.service;

import com.example.demo.controller.ServiceItemController;
import com.example.demo.model.*;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.CustomUserDetails;
import com.example.demo.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = ServiceItemController.class, excludeAutoConfiguration = {
        SecurityAutoConfiguration.class,
        SecurityFilterAutoConfiguration.class
})
class ServiceItemControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ServiceItemService serviceItemService;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private com.example.demo.security.CustomUserDetailsService customUserDetailsService;

    @MockitoBean
    private com.example.demo.security.TokenBlacklistService tokenBlacklistService;

    @MockitoBean
    private JwtUtil jwtUtil;

    private User owner;
    private ServiceItem sample;

    private static final LocalDate FROM  = LocalDate.now().plusDays(1);
    private static final LocalDate UNTIL = LocalDate.now().plusDays(30);

    @BeforeEach
    void setUp() {
        owner = new User();
        owner.setId(1L);
        owner.setEmail("owner@example.com");
        owner.setName("Test Owner");
        owner.setPassword("password123");
        owner.setRole(UserRole.USER);
        owner.setPhone("123456789");
        owner.setAddress("Calle 1");
        owner.setCity("Madrid");
        owner.setCountry("España");

        sample = new ServiceItem();
        sample.setId(1L);
        sample.setTitle("Servicio de Limpieza");
        sample.setDescription("Limpieza profesional");
        sample.setCity("Madrid");
        sample.setPricePerMonth(100.0);
        sample.setStatus(ServiceStatus.ACTIVE);
        sample.setAvailableFrom(FROM);
        sample.setAvailableUntil(UNTIL);
        sample.setOwner(owner);
    }


    @Test
    void getActiveServices_success() throws Exception {
        when(serviceItemService.findAllActive()).thenReturn(List.of(sample));

        mockMvc.perform(get("/api/services/active"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].title").value("Servicio de Limpieza"))
            .andExpect(jsonPath("$[0].status").value("ACTIVE"));
    }

    @Test
    void getActiveServices_emptyList_returnsOk() throws Exception {
        when(serviceItemService.findAllActive()).thenReturn(List.of());

        mockMvc.perform(get("/api/services/active"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(0));
    }

/*
    @Test
    void getMyServices_authorized_returnsServices() throws Exception {
        when(userRepository.findByEmail("owner@example.com")).thenReturn(Optional.of(owner));
        when(serviceItemService.findByOwner(1L)).thenReturn(List.of(sample));

        mockMvc.perform(get("/api/services/my-services")
                .param("ownerId", "1")
                .with(user(ownerDetails)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(1));
    }
*/
    @Test
    void getMyServices_noAuthentication_returnsForbidden() throws Exception {
        mockMvc.perform(get("/api/services/my-services")
                .param("ownerId", "1"))
            .andExpect(status().isForbidden());
    }

    @Test
    void getMyServices_differentOwner_returnsForbidden() throws Exception {
        User otherUser = new User();
        otherUser.setId(99L);
        otherUser.setEmail("other@example.com");
        otherUser.setPassword("pwd");
        otherUser.setRole(UserRole.USER);
        when(userRepository.findByEmail("other@example.com")).thenReturn(Optional.of(otherUser));

        mockMvc.perform(get("/api/services/my-services")
                .param("ownerId", "1")
                .with(user(new CustomUserDetails(otherUser))))
            .andExpect(status().isForbidden())
            .andExpect(content().string("You do not have permission to view these services."));
    }

    @Test
    void getMyServices_userEmailNotFound_returnsForbidden() throws Exception {
        User ghost = new User();
        ghost.setId(55L);
        ghost.setEmail("ghost@example.com");
        ghost.setPassword("pwd");
        ghost.setRole(UserRole.USER);
        when(userRepository.findByEmail("ghost@example.com")).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/services/my-services")
                .param("ownerId", "55")
                .with(user(new CustomUserDetails(ghost))))
            .andExpect(status().isForbidden());
    }


    @Test
    void getServiceById_found_returnsService() throws Exception {
        when(serviceItemService.findById(1L)).thenReturn(sample);

        mockMvc.perform(get("/api/services/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.title").value("Servicio de Limpieza"));
    }

    @Test
    void getServiceById_notFound_returns404() throws Exception {
        when(serviceItemService.findById(99L)).thenThrow(new RuntimeException("Service not found"));

        mockMvc.perform(get("/api/services/99"))
            .andExpect(status().isNotFound());
    }

/*
    @Test
    void promoteService_authorized_returnsCreated() throws Exception {
        when(userRepository.findByEmail("owner@example.com")).thenReturn(Optional.of(owner));
        when(serviceItemService.createAndPromote(any(), eq(1L), eq(1L))).thenReturn(sample);

        mockMvc.perform(post("/api/services/promote")
                .param("ownerId", "1")
                .param("categoryId", "1")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"Servicio de Limpieza\",\"description\":\"Limpieza profesional\",\"city\":\"Madrid\",\"pricePerMonth\":100.0}")
                .with(user(ownerDetails)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.title").value("Servicio de Limpieza"));
    }
*/
    @Test
    void promoteService_noAuthentication_returnsForbidden() throws Exception {
        mockMvc.perform(post("/api/services/promote")
                .param("ownerId", "1")
                .param("categoryId", "1")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"Test\"}"))
            .andExpect(status().isForbidden())
            .andExpect(content().string("You do not have permission to create services."));
    }

    @Test
    void promoteService_differentOwner_returnsForbidden() throws Exception {
        User other = new User();
        other.setId(99L);
        other.setEmail("other@example.com");
        other.setPassword("pwd");
        other.setRole(UserRole.USER);
        when(userRepository.findByEmail("other@example.com")).thenReturn(Optional.of(other));

        mockMvc.perform(post("/api/services/promote")
                .param("ownerId", "1")
                .param("categoryId", "1")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"Test\"}")
                .with(user(new CustomUserDetails(other))))
            .andExpect(status().isForbidden())
            .andExpect(content().string("You do not have permission to create services."));
    }
/*
    @Test
    void promoteService_serviceThrows_returnsBadRequest() throws Exception {
        when(userRepository.findByEmail("owner@example.com")).thenReturn(Optional.of(owner));
        when(serviceItemService.createAndPromote(any(), eq(1L), eq(1L)))
            .thenThrow(new RuntimeException("Title is required"));

        mockMvc.perform(post("/api/services/promote")
                .param("ownerId", "1")
                .param("categoryId", "1")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"description\":\"desc\",\"city\":\"Madrid\",\"pricePerMonth\":100.0}")
                .with(user(ownerDetails)))
            .andExpect(status().isBadRequest())
            .andExpect(content().string("Title is required"));
    }


    @Test
    void updateService_authorized_returnsOk() throws Exception {
        when(userRepository.findByEmail("owner@example.com")).thenReturn(Optional.of(owner));
        when(serviceItemService.update(eq(1L), eq(1L), any())).thenReturn(sample);

        mockMvc.perform(put("/api/services/1")
                .param("ownerId", "1")
                .contentType(MediaType.APPLICATION_JSON)
                .with(user(ownerDetails)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.title").value("Servicio de Limpieza"));
    }
*/
    @Test
    void updateService_noAuthentication_returnsForbidden() throws Exception {
        mockMvc.perform(put("/api/services/1")
                .param("ownerId", "1")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"x\"}"))
            .andExpect(status().isForbidden())
            .andExpect(content().string("You do not have permission to modify this service."));
    }

    @Test
    void updateService_differentOwner_returnsForbidden() throws Exception {
        User other = new User();
        other.setId(99L);
        other.setEmail("other@example.com");
        other.setPassword("pwd");
        other.setRole(UserRole.USER);
        when(userRepository.findByEmail("other@example.com")).thenReturn(Optional.of(other));

        mockMvc.perform(put("/api/services/1")
                .param("ownerId", "1")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"x\"}")
                .with(user(new CustomUserDetails(other))))
            .andExpect(status().isForbidden())
            .andExpect(content().string("You do not have permission to modify this service."));
    }
/*
    @Test
    void updateService_serviceThrows_returnsBadRequest() throws Exception {
        when(userRepository.findByEmail("owner@example.com")).thenReturn(Optional.of(owner));
        when(serviceItemService.update(eq(1L), eq(1L), any()))
            .thenThrow(new RuntimeException("Service not found"));

        mockMvc.perform(put("/api/services/1")
                .param("ownerId", "1")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"x\"}")
                .with(user(ownerDetails)))
            .andExpect(status().isBadRequest())
            .andExpect(content().string("Service not found"));
    }

    @Test
    void updateService_serviceUnavailable_returnsBadRequest() throws Exception {
        when(userRepository.findByEmail("owner@example.com")).thenReturn(Optional.of(owner));
        when(serviceItemService.update(eq(1L), eq(1L), any()))
            .thenThrow(new RuntimeException("The service is currently rented and cannot be modified."));

        mockMvc.perform(put("/api/services/1")
                .param("ownerId", "1")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"x\"}")
                .with(user(ownerDetails)))
            .andExpect(status().isBadRequest())
            .andExpect(content().string("The service is currently rented and cannot be modified."));
    }
*/

    @Test
    void requestService_success() throws Exception {
        sample.setStatus(ServiceStatus.UNAVAILABLE);
        when(serviceItemService.requestService(1L)).thenReturn(sample);

        mockMvc.perform(post("/api/services/1/request"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("UNAVAILABLE"));
    }

    @Test
    void requestService_serviceNotActive_returnsBadRequest() throws Exception {
        when(serviceItemService.requestService(2L))
            .thenThrow(new RuntimeException("The service is not active and cannot be requested"));

        mockMvc.perform(post("/api/services/2/request"))
            .andExpect(status().isBadRequest())
            .andExpect(content().string("The service is not active and cannot be requested"));
    }

    @Test
    void requestService_serviceNotFound_returnsBadRequest() throws Exception {
        when(serviceItemService.requestService(99L))
            .thenThrow(new RuntimeException("Service not found"));

        mockMvc.perform(post("/api/services/99/request"))
            .andExpect(status().isBadRequest())
            .andExpect(content().string("Service not found"));
    }

    @Test
    void releaseService_success() throws Exception {
        sample.setStatus(ServiceStatus.ACTIVE);
        when(serviceItemService.releaseService(1L)).thenReturn(sample);

        mockMvc.perform(post("/api/services/1/release"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    @Test
    void releaseService_serviceNotFound_returnsBadRequest() throws Exception {
        when(serviceItemService.releaseService(99L))
            .thenThrow(new RuntimeException("Service not found"));

        mockMvc.perform(post("/api/services/99/release"))
            .andExpect(status().isBadRequest())
            .andExpect(content().string("Service not found"));
    }

/*
    @Test
    void deleteService_authorized_returnsNoContent() throws Exception {
        when(userRepository.findByEmail("owner@example.com")).thenReturn(Optional.of(owner));
        doNothing().when(serviceItemService).delete(1L, 1L);

        mockMvc.perform(delete("/api/services/1")
                .param("ownerId", "1")
                .with(user(ownerDetails)))
            .andExpect(status().isNoContent());
    }
*/
    @Test
    void deleteService_noAuthentication_returnsForbidden() throws Exception {
        mockMvc.perform(delete("/api/services/1")
                .param("ownerId", "1"))
            .andExpect(status().isForbidden())
            .andExpect(content().string("You do not have permission to delete this service."));
    }

    @Test
    void deleteService_differentOwner_returnsForbidden() throws Exception {
        User other = new User();
        other.setId(99L);
        other.setEmail("other@example.com");
        other.setPassword("pwd");
        other.setRole(UserRole.USER);
        when(userRepository.findByEmail("other@example.com")).thenReturn(Optional.of(other));

        mockMvc.perform(delete("/api/services/1")
                .param("ownerId", "1")
                .with(user(new CustomUserDetails(other))))
            .andExpect(status().isForbidden())
            .andExpect(content().string("You do not have permission to delete this service."));
    }
    /*
    @Test
    void deleteService_serviceThrows_returnsBadRequest() throws Exception {
        when(userRepository.findByEmail("owner@example.com")).thenReturn(Optional.of(owner));
        doThrow(new RuntimeException("The service is currently rented and cannot be deleted"))
            .when(serviceItemService).delete(1L, 1L);

        mockMvc.perform(delete("/api/services/1")
                .param("ownerId", "1")
                .with(user(ownerDetails)))
            .andExpect(status().isBadRequest())
            .andExpect(content().string("The service is currently rented and cannot be deleted"));
    }

    @Test
    void deleteService_serviceNotFound_returnsBadRequest() throws Exception {
        when(userRepository.findByEmail("owner@example.com")).thenReturn(Optional.of(owner));
        doThrow(new RuntimeException("Service not found"))
            .when(serviceItemService).delete(99L, 1L);

        mockMvc.perform(delete("/api/services/99")
                .param("ownerId", "1")
                .with(user(ownerDetails)))
            .andExpect(status().isBadRequest())
            .andExpect(content().string("Service not found"));
    }
    */
}