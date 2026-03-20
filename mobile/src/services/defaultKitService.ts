import { API_ROUTES } from '../config/api';
import { DefaultKit, DefaultKitCreateRequest } from '../types';

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

    try {
      if (contentType.includes('application/json')) {
        const payload = await res.json();
        message = payload.message || payload.error || JSON.stringify(payload);
      } else {
        message = await res.text();
      }
    } catch {}

    throw new Error(message || `HTTP ${res.status}`);
  }

  const contentType = res.headers.get('content-type') ?? '';
  if (contentType.includes('text/plain')) {
    return res.text() as unknown as Promise<T>;
  }

  return res.json() as Promise<T>;
}


export async function fetchAllDefaultKits(token: string): Promise<DefaultKit[]> {
  const res = await fetchWithTimeout(API_ROUTES.DEFAULT_KITS, {
    method: 'GET',
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
  });

  return handleResponse<DefaultKit[]>(res);
}

export async function fetchDefaultKitById(id: number, token: string): Promise<DefaultKit> {
  const res = await fetchWithTimeout(API_ROUTES.DEFAULT_KIT_BY_ID(id), {
    method: 'GET',
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
  });

  return handleResponse<DefaultKit>(res);
}

export async function createDefaultKit(
  payload: Partial<DefaultKitCreateRequest>,
  token: string,
): Promise<DefaultKit> {
  const res = await fetchWithTimeout(API_ROUTES.DEFAULT_KITS, {
    method: 'POST',
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });

  return handleResponse<DefaultKit>(res);
}

export async function updateDefaultKit(
  id: number,
  payload: Partial<DefaultKitCreateRequest>,
  token: string,
): Promise<DefaultKit> {
  const res = await fetchWithTimeout(API_ROUTES.DEFAULT_KIT_BY_ID(id), {
    method: 'PUT',
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });

  return handleResponse<DefaultKit>(res);
}

export async function deleteDefaultKit(id: number, token: string): Promise<string> {
  const res = await fetchWithTimeout(API_ROUTES.DEFAULT_KIT_BY_ID(id), {
    method: 'DELETE',
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
  });

  if (res.status === 204 || res.status === 200) {
    return "Kit predeterminado eliminado";
  }

  return handleResponse<string>(res);
}
