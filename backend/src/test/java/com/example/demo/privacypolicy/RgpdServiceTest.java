package com.example.demo.privacypolicy;

import com.example.demo.model.PrivacyPolicy;
import com.example.demo.model.RgpdConsent;
import com.example.demo.model.User;
import com.example.demo.repository.RgpdConsentRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.AuthService;
import com.example.demo.service.PrivacyPolicyService;
import com.example.demo.service.RgpdService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class RgpdServiceTest {

    @Mock
    private AuthService authService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RgpdConsentRepository rgpdConsentRepository;

    @Mock
    private PrivacyPolicyService privacyPolicyService;

    @InjectMocks
    private RgpdService rgpdService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void needsConsent_userIdNull_returnsFalse() {
        when(authService.getAuthenticatedUserId()).thenReturn(null);

        assertThat(rgpdService.needsConsent()).isFalse();
    }

    @Test
    void needsConsent_userNotFound_returnsFalse() {
        when(authService.getAuthenticatedUserId()).thenReturn(1L);
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        assertThat(rgpdService.needsConsent()).isFalse();
    }

    @Test
    void needsConsent_currentPolicyNull_returnsTrue() {
        User user = new User();
        when(authService.getAuthenticatedUserId()).thenReturn(1L);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(privacyPolicyService.getCurrentActivePolicy()).thenReturn(null);

        assertThat(rgpdService.needsConsent()).isTrue();
    }

    @Test
    void needsConsent_noConsentExists_returnsTrue() {
        User user = new User();
        PrivacyPolicy policy = new PrivacyPolicy("2.0", "content");

        when(authService.getAuthenticatedUserId()).thenReturn(1L);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(privacyPolicyService.getCurrentActivePolicy()).thenReturn(policy);
        when(rgpdConsentRepository.findByUser(user)).thenReturn(Optional.empty());

        assertThat(rgpdService.needsConsent()).isTrue();
    }

    @Test
    void needsConsent_consentVersionDifferent_returnsTrue() {
        User user = new User();
        PrivacyPolicy policy = new PrivacyPolicy("2.0", "content");

        RgpdConsent consent = new RgpdConsent();
        consent.setAcceptedVersion("1.0");

        when(authService.getAuthenticatedUserId()).thenReturn(1L);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(privacyPolicyService.getCurrentActivePolicy()).thenReturn(policy);
        when(rgpdConsentRepository.findByUser(user)).thenReturn(Optional.of(consent));

        assertThat(rgpdService.needsConsent()).isTrue();
    }

    @Test
    void needsConsent_consentVersionMatches_returnsFalse() {
        User user = new User();
        PrivacyPolicy policy = new PrivacyPolicy("2.0", "content");

        RgpdConsent consent = new RgpdConsent();
        consent.setAcceptedVersion("2.0");

        when(authService.getAuthenticatedUserId()).thenReturn(1L);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(privacyPolicyService.getCurrentActivePolicy()).thenReturn(policy);
        when(rgpdConsentRepository.findByUser(user)).thenReturn(Optional.of(consent));

        assertThat(rgpdService.needsConsent()).isFalse();
    }

    @Test
    void needsConsent_exception_returnsTrue() {
        when(authService.getAuthenticatedUserId()).thenThrow(new RuntimeException("error"));

        assertThat(rgpdService.needsConsent()).isTrue();
    }

    @Test
    void getCurrentPolicyVersion_policyExists() {
        PrivacyPolicy policy = new PrivacyPolicy("3.0", "content");
        when(privacyPolicyService.getCurrentActivePolicy()).thenReturn(policy);

        assertThat(rgpdService.getCurrentPolicyVersion()).isEqualTo("3.0");
    }

    @Test
    void getCurrentPolicyVersion_policyNull_returnsDefault() {
        when(privacyPolicyService.getCurrentActivePolicy()).thenReturn(null);

        assertThat(rgpdService.getCurrentPolicyVersion()).isEqualTo("1.0");
    }


    @Test
    void getCurrentPolicyContent_policyExists() {
        PrivacyPolicy policy = new PrivacyPolicy("1.0", "ABC");
        when(privacyPolicyService.getCurrentActivePolicy()).thenReturn(policy);

        assertThat(rgpdService.getCurrentPolicyContent()).isEqualTo("ABC");
    }

    @Test
    void getCurrentPolicyContent_policyNull_returnsEmpty() {
        when(privacyPolicyService.getCurrentActivePolicy()).thenReturn(null);

        assertThat(rgpdService.getCurrentPolicyContent()).isEqualTo("");
    }


    @Test
    void hasCurrentUserAccepted_userIdNull_returnsFalse() {
        when(authService.getAuthenticatedUserId()).thenReturn(null);

        assertThat(rgpdService.hasCurrentUserAccepted()).isFalse();
    }

    @Test
    void hasCurrentUserAccepted_userNotFound_returnsFalse() {
        when(authService.getAuthenticatedUserId()).thenReturn(1L);
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        assertThat(rgpdService.hasCurrentUserAccepted()).isFalse();
    }

    @Test
    void hasCurrentUserAccepted_policyNull_returnsFalse() {
        User user = new User();
        when(authService.getAuthenticatedUserId()).thenReturn(1L);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(privacyPolicyService.getCurrentActivePolicy()).thenReturn(null);

        assertThat(rgpdService.hasCurrentUserAccepted()).isFalse();
    }

    @Test
    void hasCurrentUserAccepted_noConsent_returnsFalse() {
        User user = new User();
        PrivacyPolicy policy = new PrivacyPolicy("2.0", "content");

        when(authService.getAuthenticatedUserId()).thenReturn(1L);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(privacyPolicyService.getCurrentActivePolicy()).thenReturn(policy);
        when(rgpdConsentRepository.findByUser(user)).thenReturn(Optional.empty());

        assertThat(rgpdService.hasCurrentUserAccepted()).isFalse();
    }

    @Test
    void hasCurrentUserAccepted_versionMatches_returnsTrue() {
        User user = new User();
        PrivacyPolicy policy = new PrivacyPolicy("2.0", "content");

        RgpdConsent consent = new RgpdConsent();
        consent.setAcceptedVersion("2.0");

        when(authService.getAuthenticatedUserId()).thenReturn(1L);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(privacyPolicyService.getCurrentActivePolicy()).thenReturn(policy);
        when(rgpdConsentRepository.findByUser(user)).thenReturn(Optional.of(consent));

        assertThat(rgpdService.hasCurrentUserAccepted()).isTrue();
    }

    @Test
    void hasCurrentUserAccepted_versionDifferent_returnsFalse() {
        User user = new User();
        PrivacyPolicy policy = new PrivacyPolicy("2.0", "content");

        RgpdConsent consent = new RgpdConsent();
        consent.setAcceptedVersion("1.0");

        when(authService.getAuthenticatedUserId()).thenReturn(1L);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(privacyPolicyService.getCurrentActivePolicy()).thenReturn(policy);
        when(rgpdConsentRepository.findByUser(user)).thenReturn(Optional.of(consent));

        assertThat(rgpdService.hasCurrentUserAccepted()).isFalse();
    }

    @Test
    void hasCurrentUserAccepted_exception_returnsFalse() {
        when(authService.getAuthenticatedUserId()).thenThrow(new RuntimeException("error"));

        assertThat(rgpdService.hasCurrentUserAccepted()).isFalse();
    }


    @Test
    void recordConsent_createsNewConsent() {
        User user = new User();
        user.setId(1L);

        when(authService.getAuthenticatedUserId()).thenReturn(1L);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(rgpdConsentRepository.findByUser(user)).thenReturn(Optional.empty());

        rgpdService.recordConsent("2.0", "1.2.3.4");

        verify(rgpdConsentRepository).save(any(RgpdConsent.class));
    }

    @Test
    void recordConsent_updatesExistingConsent() {
        User user = new User();
        user.setId(1L);

        RgpdConsent existing = new RgpdConsent();
        existing.setAcceptedVersion("1.0");

        when(authService.getAuthenticatedUserId()).thenReturn(1L);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(rgpdConsentRepository.findByUser(user)).thenReturn(Optional.of(existing));

        rgpdService.recordConsent("2.0", "5.6.7.8");

        assertThat(existing.getAcceptedVersion()).isEqualTo("2.0");
        assertThat(existing.getIpAddress()).isEqualTo("5.6.7.8");

        verify(rgpdConsentRepository).save(existing);
    }

    @Test
    void recordConsent_userNotFound_throws() {
        when(authService.getAuthenticatedUserId()).thenReturn(1L);
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> rgpdService.recordConsent("2.0", "ip"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Usuario no encontrado");
    }
}

