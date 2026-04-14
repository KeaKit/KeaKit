package com.example.demo.privacypolicy;


import com.example.demo.model.PrivacyPolicy;
import com.example.demo.repository.PrivacyPolicyRepository;
import com.example.demo.service.PrivacyPolicyService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class PrivacyPolicyServiceTest {

    @Mock
    private PrivacyPolicyRepository privacyPolicyRepository;

    @InjectMocks
    private PrivacyPolicyService privacyPolicyService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }


    @Test
    void getCurrentActivePolicy_returnsExistingActivePolicy() {
        PrivacyPolicy existing = new PrivacyPolicy("2.0", "Contenido existente");
        existing.setActive(true);

        when(privacyPolicyRepository.findTopByActiveTrueOrderByCreatedAtDesc())
                .thenReturn(Optional.of(existing));

        PrivacyPolicy result = privacyPolicyService.getCurrentActivePolicy();

        assertThat(result).isEqualTo(existing);
        verify(privacyPolicyRepository, never()).save(any());
    }

    @Test
    void getCurrentActivePolicy_createsDefaultPolicyWhenNoneExists() {
        when(privacyPolicyRepository.findTopByActiveTrueOrderByCreatedAtDesc())
                .thenReturn(Optional.empty());

        ArgumentCaptor<PrivacyPolicy> captor = ArgumentCaptor.forClass(PrivacyPolicy.class);

        PrivacyPolicy saved = new PrivacyPolicy("1.0", "CONTENIDO_REAL");
        saved.setActive(true);

        when(privacyPolicyRepository.save(any(PrivacyPolicy.class)))
                .thenReturn(saved);

        PrivacyPolicy result = privacyPolicyService.getCurrentActivePolicy();

        // Verificar que se llamó a save() con la política por defecto
        verify(privacyPolicyRepository).save(captor.capture());
        PrivacyPolicy policySaved = captor.getValue();

        assertThat(policySaved.getVersion()).isEqualTo("1.0");
        assertThat(policySaved.isActive()).isTrue();
        assertThat(policySaved.getContent()).contains("Política de Privacidad de KeaKit");

        // Verificar que el resultado final es el devuelto por el mock
        assertThat(result.getVersion()).isEqualTo("1.0");
        assertThat(result.isActive()).isTrue();
    }



    @Test
    void getAllPolicies_returnsList() {
        PrivacyPolicy p1 = new PrivacyPolicy("1.0", "A");
        PrivacyPolicy p2 = new PrivacyPolicy("2.0", "B");

        when(privacyPolicyRepository.findAll()).thenReturn(List.of(p1, p2));

        List<PrivacyPolicy> result = privacyPolicyService.getAllPolicies();

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getVersion()).isEqualTo("1.0");
        assertThat(result.get(1).getVersion()).isEqualTo("2.0");
    }


    @Test
    void createNewPolicy_deactivatesOldPolicies_andCreatesNewActivePolicy() {
        PrivacyPolicy old1 = new PrivacyPolicy("1.0", "Old1");
        old1.setActive(true);

        PrivacyPolicy old2 = new PrivacyPolicy("1.1", "Old2");
        old2.setActive(true);

        when(privacyPolicyRepository.findAll()).thenReturn(List.of(old1, old2));

        PrivacyPolicy newPolicy = new PrivacyPolicy("2.0", "Contenido nuevo");
        newPolicy.setActive(true);

        when(privacyPolicyRepository.save(any(PrivacyPolicy.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        PrivacyPolicy result = privacyPolicyService.createNewPolicy("2.0", "Contenido nuevo");

        // Verificar que las antiguas se desactivaron
        assertThat(old1.isActive()).isFalse();
        assertThat(old2.isActive()).isFalse();

        // Verificar que la nueva está activa
        assertThat(result.getVersion()).isEqualTo("2.0");
        assertThat(result.getContent()).isEqualTo("Contenido nuevo");
        assertThat(result.isActive()).isTrue();

        // Verificar llamadas a save()
        verify(privacyPolicyRepository, times(3)).save(any(PrivacyPolicy.class));
    }
}

