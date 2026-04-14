package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;

public class CreatePolicyRequest {
    @NotBlank
    private String version;
    
    @NotBlank
    private String content;
    
    public String getVersion() { return version; }
    public void setVersion(String version) { this.version = version; }
    
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}