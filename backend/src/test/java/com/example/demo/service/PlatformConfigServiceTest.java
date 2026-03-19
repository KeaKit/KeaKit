package com.example.demo.service;

import com.example.demo.dto.PlatformConfigRequest;
import com.example.demo.model.PlatformConfig;
import com.example.demo.repository.PlatformConfigRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Collections;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class PlatformConfigServiceTest {

    @Mock
    private PlatformConfigRepository repository;

    @InjectMocks
    private PlatformConfigService service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    // Devuelve el valor por defecto si no hay config en BD
    @Test
    void getCommissionRate_defaultValue() {
        when(repository.findAll()).thenReturn(Collections.emptyList());

        double rate = service.getCommissionRate();

        assertThat(rate).isEqualTo(0.2);
        verify(repository).findAll();
    }

    // Devuelve valor existente
    @Test
    void getCommissionRate_existingValue() {
        PlatformConfig config = new PlatformConfig(0.5);
        when(repository.findAll()).thenReturn(Collections.singletonList(config));

        double rate = service.getCommissionRate();

        assertThat(rate).isEqualTo(0.5);
    }

    // getConfig crea config por defecto si no existe
    @Test
    void getConfig_returnsDefaultIfEmpty() {
        when(repository.findAll()).thenReturn(Collections.emptyList());

        var response = service.getConfig();

        assertThat(response.getCommissionRate()).isEqualTo(0.2);
    }

    // update crea nueva config si no existe
    @Test
    void updateCommissionRate_createsNew() {
        when(repository.findAll()).thenReturn(Collections.emptyList());

        PlatformConfig saved = new PlatformConfig(0.3);
        saved.setId(1L);

        when(repository.save(any())).thenReturn(saved);

        PlatformConfigRequest req = new PlatformConfigRequest(0.3);

        var response = service.updateCommissionRate(req);

        assertThat(response.getCommissionRate()).isEqualTo(0.3);
        verify(repository).save(any());
    }

    // update modifica existente
    @Test
    void updateCommissionRate_updatesExisting() {
        PlatformConfig config = new PlatformConfig(0.2);
        config.setId(1L);

        when(repository.findAll()).thenReturn(Collections.singletonList(config));
        when(repository.save(any())).thenReturn(config);

        PlatformConfigRequest req = new PlatformConfigRequest(0.7);

        var response = service.updateCommissionRate(req);

        assertThat(response.getCommissionRate()).isEqualTo(0.7);
    }
}