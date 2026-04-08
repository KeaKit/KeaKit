// services/rgpdService.ts
import { API_ROUTES } from "../config/api";

export const RGPD_VERSION = "1.0";

export interface PolicyInfo {
    needsConsent: boolean;
    currentVersion: string;
    policyContent: string;
}

export const checkNeedsConsent = async (token: string): Promise<PolicyInfo> => {
    try {
        const response = await fetch(API_ROUTES.RGPD_NEEDS_CONSENT, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            return { needsConsent: true, currentVersion: RGPD_VERSION, policyContent: "" };
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error checking RGPD needs consent:', error);
        return { needsConsent: true, currentVersion: RGPD_VERSION, policyContent: "" };
    }
};

export const checkRgpdConsent = async (token: string): Promise<boolean> => {
    try {
        const response = await fetch(API_ROUTES.RGPD_CHECK, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) return false;
        
        const data = await response.json();
        return data.hasAccepted === true;
    } catch (error) {
        console.error('Error checking RGPD consent:', error);
        return false;
    }
};

export const acceptRgpd = async (token: string, version: string): Promise<void> => {
    const response = await fetch(API_ROUTES.RGPD_ACCEPT, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ version }),
    });
    
    if (!response.ok) {
        throw new Error('Error al guardar el consentimiento');
    }
};