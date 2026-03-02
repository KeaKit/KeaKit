import { API_ROUTES } from '../config/api';

const jsonHeaders = { 'Content-Type': 'application/json' };
const REQUEST_TIMEOUT_MS = 12000;

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Tiempo de espera agotado al conectar con el servidor.');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const contentType = res.headers.get('content-type') ?? '';
    let message = `HTTP ${res.status}`;

    if (contentType.includes('application/json')) {
      try {
        const json = await res.json();
        message = json.message ?? json.error ?? message;
      } catch (e) {
        // Ignorar error de parseo
      }
    }

    throw new Error(message);
  }

  const contentType = res.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    throw new Error('Respuesta del servidor no es JSON');
  }

  return res.json();
}

export const paymentService = {
  /**
   * Crea un Payment Intent para un kit
   * Retorna el clientSecret para completar el pago con Stripe SDK
   */
  async createPaymentIntent(kitId: number, tenantId: number): Promise<any> {
    const url = `${API_ROUTES.PAYMENT_BASE}/create-payment-intent`;
    const payload = {
      kitId,
      tenantId,
    };

    const res = await fetchWithTimeout(url, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify(payload),
    });

    return handleResponse(res);
  },

  /**
   * Confirma un pago después de que Stripe lo ha procesado
   * Se llama después de que el usuario completó el pago con Stripe Elements/Card
   */
  async confirmPayment(kitId: number, tenantId: number, paymentIntentId: string): Promise<any> {
    const url = `${API_ROUTES.PAYMENT_BASE}/confirm-payment`;
    const payload = {
      kitId,
      tenantId,
      paymentMethodId: paymentIntentId, // Reutilizamos este campo para paymentIntentId
    };

    const res = await fetchWithTimeout(url, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify(payload),
    });

    return handleResponse(res);
  },

  /**
   * Procesa el pago de un kit (versión simplificada)
   * Usa el flujo: crear payment intent → completar con Stripe → confirmar en backend
   */
  async payKit(kitId: number, tenantId: number, paymentIntentId: string): Promise<any> {
    const url = `${API_ROUTES.PAYMENT_BASE}/pay-kit`;
    const payload = {
      kitId,
      tenantId,
      paymentMethodId: paymentIntentId,
    };

    const res = await fetchWithTimeout(url, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify(payload),
    });

    return handleResponse(res);
  },

  /**
   * Obtiene el saldo de la wallet del usuario
   */
  async getUserBalance(userId: number): Promise<any> {
    const url = `${API_ROUTES.PAYMENT_BASE}/balance/${userId}`;
    const res = await fetchWithTimeout(url, {
      method: 'GET',
      headers: jsonHeaders,
    });

    return handleResponse(res);
  },

  /**
   * Obtiene el historial de transacciones del usuario
   */
  async getUserTransactions(userId: number): Promise<any> {
    const url = `${API_ROUTES.PAYMENT_BASE}/transactions/${userId}`;
    const res = await fetchWithTimeout(url, {
      method: 'GET',
      headers: jsonHeaders,
    });

    return handleResponse(res);
  },

  /**
   * Obtiene los datos de pago del usuario (Stripe Connect)
   */
  async getUserPaymentData(userId: number): Promise<any> {
    const url = `${API_ROUTES.PAYMENT_BASE}/payment-data/${userId}`;
    const res = await fetchWithTimeout(url, {
      method: 'GET',
      headers: jsonHeaders,
    });

    return handleResponse(res);
  },

  /**
   * Obtiene las transacciones de un kit específico
   */
  async getKitTransactions(kitId: number): Promise<any> {
    const url = `${API_ROUTES.PAYMENT_BASE}/kit-transactions/${kitId}`;
    const res = await fetchWithTimeout(url, {
      method: 'GET',
      headers: jsonHeaders,
    });

    return handleResponse(res);
  },

  /**
   * Procesa un reembolso de pago
   */
  async refundPayment(kitId: number): Promise<any> {
    const url = `${API_ROUTES.PAYMENT_BASE}/refund/${kitId}`;
    const res = await fetchWithTimeout(url, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({}),
    });

    return handleResponse(res);
  },
};
