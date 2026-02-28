import { API_ROUTES } from '../config/api';
import { CreatePaymentIntentRequest, CreatePaymentIntentResponse } from '../types';

export async function createPaymentIntent(
  payload: CreatePaymentIntentRequest,
  token: string,
): Promise<CreatePaymentIntentResponse> {
  const res = await fetch(API_ROUTES.CREATE_PAYMENT_INTENT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`);

  return JSON.parse(text) as CreatePaymentIntentResponse;
}
