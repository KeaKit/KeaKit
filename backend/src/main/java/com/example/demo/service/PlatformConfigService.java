package com.example.demo.service;

import com.example.demo.dto.PlatformConfigRequest;
import com.example.demo.dto.PlatformConfigResponse;
import com.example.demo.model.PlatformConfig;
import com.example.demo.repository.PlatformConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PlatformConfigService {

    private static final double DEFAULT_COMMISSION_RATE = 0.2;

    @Autowired
    private PlatformConfigRepository platformConfigRepository;

    public double getCommissionRate() {
        return platformConfigRepository.findAll()
                .stream()
                .findFirst()
                .map(PlatformConfig::getCommissionRate)
                .orElse(DEFAULT_COMMISSION_RATE);
    }

    public PlatformConfigResponse getConfig() {
        PlatformConfig config = platformConfigRepository.findAll()
                .stream()
                .findFirst()
                .orElseGet(() -> new PlatformConfig(DEFAULT_COMMISSION_RATE));
        return new PlatformConfigResponse(config);
    }

    public PlatformConfigResponse updateCommissionRate(PlatformConfigRequest request) {
        PlatformConfig config = platformConfigRepository.findAll()
                .stream()
                .findFirst()
                .orElseGet(() -> new PlatformConfig(DEFAULT_COMMISSION_RATE));

        config.setCommissionRate(request.commissionRate());
        PlatformConfig saved = platformConfigRepository.save(config);
        return new PlatformConfigResponse(saved);
    }
}