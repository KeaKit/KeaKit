package com.example.demo.notification;

import com.example.demo.controller.NotificationController;
import com.example.demo.model.Notification;
import com.example.demo.model.NotificationType;
import com.example.demo.model.User;
import com.example.demo.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = NotificationController.class, excludeAutoConfiguration = {
        SecurityAutoConfiguration.class,
        SecurityFilterAutoConfiguration.class
})
class NotificationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private NotificationService notificationService;

    // Beans extra necesarios por cómo tenéis montada la seguridad genérica en otros controllers
    @MockitoBean
    private com.example.demo.repository.UserRepository userRepository;
    @MockitoBean
    private com.example.demo.security.CustomUserDetailsService customUserDetailsService;
    @MockitoBean
    private com.example.demo.security.TokenBlacklistService tokenBlacklistService;
    @MockitoBean
    private com.example.demo.security.JwtUtil jwtUtil;

    private Notification testNotification;

    @BeforeEach
    void setUp() {
        User user = new User();
        user.setId(1L);

        testNotification = new Notification(user, "Test Message", NotificationType.ITEM_RENTED, 100L);
        testNotification.setId(1L);
    }

    @Test
    void getUserNotifications_returns200AndList() throws Exception {
        when(notificationService.getUserNotifications(1L)).thenReturn(List.of(testNotification));

        mockMvc.perform(get("/api/notifications/user/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].message").value("Test Message"))
                .andExpect(jsonPath("$[0].type").value("ITEM_RENTED"))
                .andExpect(jsonPath("$[0].relatedKitId").value(100));
    }

    @Test
    void markAsRead_returns200_whenSuccessful() throws Exception {
        doNothing().when(notificationService).markAsRead(1L);

        mockMvc.perform(patch("/api/notifications/1/read"))
                .andExpect(status().isOk());
    }

    @Test
    void markAsRead_returns400_whenNotFound() throws Exception {
        doThrow(new RuntimeException("Notification not found")).when(notificationService).markAsRead(99L);

        mockMvc.perform(patch("/api/notifications/99/read"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Notification not found"));
    }
}