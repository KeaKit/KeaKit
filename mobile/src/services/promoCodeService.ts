import BASE_URL from '../config/api';
import { fetchWithTimeout, handleResponse, jsonHeaders } from './utils';

export interface PromoCodeResponse {
  id: number;
  code: string;
  discountRate: number;
  active: boolean;
  singleUse: boolean;
  pilotUserOnly: boolean;
  pilotEmails: string[];
}

export interface PromoCodeRequest {
  code: string;
  discountRate: number;
  active: boolean;
  singleUse: boolean;
  pilotUserOnly: boolean;
  pilotEmails: string[];
}

export interface PromoCodeValidationResponse {
  valid: boolean;
  discountRate: number | null;
  message: string;
}

export const getAllPromoCodes = async (token: string): Promise<PromoCodeResponse[]> => {
  const res = await fetchWithTimeout(`${BASE_URL}/api/admin/promo-codes`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse<PromoCodeResponse[]>(res);
};

export const createPromoCode = async (token: string, data: PromoCodeRequest): Promise<PromoCodeResponse> => {
  const res = await fetchWithTimeout(`${BASE_URL}/api/admin/promo-codes`, {
    method: 'POST',
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  return handleResponse<PromoCodeResponse>(res);
};

export const updatePromoCode = async (token: string, id: number, data: PromoCodeRequest): Promise<PromoCodeResponse> => {
  const res = await fetchWithTimeout(`${BASE_URL}/api/admin/promo-codes/${id}`, {
    method: 'PUT',
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  return handleResponse<PromoCodeResponse>(res);
};

export const validatePromoCode = async (
  token: string,
  code: string,
  email: string,
): Promise<PromoCodeValidationResponse> => {
  const res = await fetchWithTimeout(
    `${BASE_URL}/api/promo-codes/validate?code=${encodeURIComponent(code)}&email=${encodeURIComponent(email)}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return handleResponse<PromoCodeValidationResponse>(res);
};