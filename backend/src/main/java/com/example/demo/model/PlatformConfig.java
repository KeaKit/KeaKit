package com.example.demo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "platform_config")
public class PlatformConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double commissionRate;

    public PlatformConfig() {}

    public PlatformConfig(Double commissionRate) {
        this.commissionRate = commissionRate;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Double getCommissionRate() { return commissionRate; }
    public void setCommissionRate(Double commissionRate) { this.commissionRate = commissionRate; }
}