package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;

public class RgpdRequest {
    @NotBlank
    private String version;

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }
}