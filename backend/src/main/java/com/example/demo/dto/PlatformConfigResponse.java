package com.example.demo.dto;

import com.example.demo.model.PlatformConfig;

public class PlatformConfigResponse {

    private Long id;
    private Double commissionRate;

    public PlatformConfigResponse(PlatformConfig config) {
        this.id = config.getId();
        this.commissionRate = config.getCommissionRate();
    }

    public Long getId() { return id; }
    public Double getCommissionRate() { return commissionRate; }
}