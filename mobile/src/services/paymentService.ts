import { API_ROUTES } from "../config/api";
import { handleResponse, fetchWithTimeout, jsonHeaders } from "./utils";

export async function processPaymentWithWallet(
  kitId: number,
  token: string,
  amount: number,
): Promise<void> {
  console.log("Procesando pago con saldo de KeaKit...");
  const res = await fetchWithTimeout(API_ROUTES.PROCESS_PAYMENT_WALLET(kitId), {
    method: "POST",
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
    body: JSON.stringify({ amount }),
  });

  if (res.status === 500) {
    throw new Error("SERVER_ERROR_500");
  }

  return handleResponse(res);
}

export async function createPaymentIntent(
  amount: number,
  token: string,
): Promise<{ clientSecret: string }> {
  const res = await fetchWithTimeout(API_ROUTES.CREATE_PAYMENT_INTENT, {
    method: "POST",
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
    body: String(amount),
  });

  const data = await handleResponse<{ clientSecret: string }>(res);

  if (!data.clientSecret) {
    throw new Error(
      "El servidor no proporcionó una clave de confirmación (clientSecret).",
    );
  }

  return data;
}

export async function confirmStripePayment(
  clientSecret: string,
  cardElement: any,
  stripe: any,
  timeoutMs: number = 10000,
): Promise<any> {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(
      () =>
        reject(new Error("Tiempo de espera agotado al confirmar con Stripe")),
      timeoutMs,
    ),
  );

  const stripePromise = stripe?.confirmCardPayment(clientSecret, {
    payment_method: {
      card: cardElement,
    },
  });

  const res: any = await Promise.race([stripePromise, timeoutPromise]); // Devuelve la promesa que se resuelva primero

  if (res.error) {
    throw new Error(
      res.error.message || "Error al confirmar el pago con tarjeta",
    );
  }

  return res;
}

export async function processPaymentWithStripe(
  kitId: number,
  token: string,
  paymentIntentStatus: string,
): Promise<void> {
  const res = await fetchWithTimeout(API_ROUTES.PROCESS_PAYMENT_STRIPE(kitId), {
    method: "POST",
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
    body: JSON.stringify(paymentIntentStatus),
  });

  if (!res.ok) {
    return handleResponse(res);
  }
  // Si fue OK, no intentamos hacer res.json() porque la respuesta es un String.
  return;
}

export async function processPaymentWithWalletPromo(
  kitId: number,
  token: string,
  promoCode: string,
  email: string,
): Promise<void> {
  const res = await fetchWithTimeout(
    API_ROUTES.PROCESS_PAYMENT_WALLET_PROMO(kitId, promoCode, email),
    {
      method: 'POST',
      headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
    },
  );
  return handleResponse(res);
}

export async function processPaymentWithStripePromo(
  kitId: number,
  token: string,
  paymentIntentStatus: string,
  promoCode: string,
  email: string,
): Promise<void> {
  const res = await fetchWithTimeout(
    API_ROUTES.PROCESS_PAYMENT_STRIPE_PROMO(kitId, promoCode, email),
    {
      method: 'POST',
      headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
      body: JSON.stringify(paymentIntentStatus),
    },
  );
  if (!res.ok) return handleResponse(res);
}