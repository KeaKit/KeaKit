package com.example.demo.email;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.example.demo.dto.KitResponse;
import com.example.demo.dto.UserResponse;
import com.example.demo.service.GuaranteeReturnEmailService;
import com.example.demo.service.KitService;
import com.example.demo.service.UserService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
public class GuaranteeReturnEmailServiceTest {

    @Mock
    private KitService kitService;

    @Mock
    private UserService userService;

    @InjectMocks
    private GuaranteeReturnEmailService emailService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(emailService, "sendGridApiKey", "SG.test_key");
        ReflectionTestUtils.setField(emailService, "fromEmail", "no-reply@keakit.app");
    }

    @Test
    void sendGuaranteeNotification_kitNotFound_logsWarnAndReturns() {
        when(kitService.findById(1L)).thenReturn(null);

        emailService.sendGuaranteeNotification(1L);

        verify(userService, never()).getUserById(any());
    }

    @Test
    void sendGuaranteeNotification_userNotFound_logsWarnAndReturns() {
        KitResponse kit = mock(KitResponse.class);
        lenient().when(kit.getId()).thenReturn(1L);
        lenient().when(kit.getTenantId()).thenReturn(100L);

        when(kitService.findById(1L)).thenReturn(kit);
        
        when(userService.getUserById(100L)).thenReturn(null);

        emailService.sendGuaranteeNotification(1L);

        verify(userService, times(1)).getUserById(100L);
    }

@Test
    void sendGuaranteeNotification_userEmailEmpty_logsWarnAndReturns() {
        KitResponse kit = mock(KitResponse.class);
        lenient().when(kit.getId()).thenReturn(1L);
        lenient().when(kit.getTenantId()).thenReturn(100L);

        UserResponse tenant = mock(UserResponse.class);
        when(tenant.getEmail()).thenReturn(""); 

        when(kitService.findById(1L)).thenReturn(kit);
        when(userService.getUserById(100L)).thenReturn(tenant);

        emailService.sendGuaranteeNotification(1L);

        verify(userService, times(1)).getUserById(100L);
    }

    @Test
    void sendGuaranteeNotification_missingApiKey_logsWarnAndReturns() {
        ReflectionTestUtils.setField(emailService, "sendGridApiKey", "");

        KitResponse kit = mock(KitResponse.class);
        when(kit.getId()).thenReturn(1L);
        when(kit.getTenantId()).thenReturn(100L);

        UserResponse tenant = mock(UserResponse.class);
        when(tenant.getEmail()).thenReturn("test@user.com");

        when(kitService.findById(1L)).thenReturn(kit);
        when(userService.getUserById(100L)).thenReturn(tenant);

        emailService.sendGuaranteeNotification(1L);

        verify(userService, times(1)).getUserById(100L);
    }

    @Test
    void sendGuaranteeNotification_templateLoadFails_doesNotThrowException() {
        KitResponse kit = mock(KitResponse.class);
        when(kit.getId()).thenReturn(1L);
        when(kit.getTenantId()).thenReturn(100L);
        when(kit.getName()).thenReturn("Kit Pro");

        UserResponse tenant = mock(UserResponse.class);
        when(tenant.getEmail()).thenReturn("test@user.com");
        when(tenant.getName()).thenReturn("Juan");

        when(kitService.findById(1L)).thenReturn(kit);
        when(userService.getUserById(100L)).thenReturn(tenant);

        assertDoesNotThrow(() -> emailService.sendGuaranteeNotification(1L));
    }
}