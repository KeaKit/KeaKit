package com.example.demo.dto;

public class PolicyInfoResponse {
    private boolean needsConsent;
    private String currentVersion;
    private String policyContent;
    
    public PolicyInfoResponse(boolean needsConsent, String currentVersion, String policyContent) {
        this.needsConsent = needsConsent;
        this.currentVersion = currentVersion;
        this.policyContent = policyContent;
    }
    
    public boolean isNeedsConsent() { return needsConsent; }
    public String getCurrentVersion() { return currentVersion; }
    public String getPolicyContent() { return policyContent; }
}