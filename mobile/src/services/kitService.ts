import { API_ROUTES } from '../config/api';
import { KitCreateRequest, KitResponse, UserArticle } from '../types';

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

  return res.json() as Promise<T>;
}

export async function fetchMyArticles(
  userId: number,
  token: string,
): Promise<UserArticle[]> {
  const res = await fetchWithTimeout(API_ROUTES.MY_ARTICLES(userId), {
    method: 'GET',
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
  });

  return handleResponse<UserArticle[]>(res);
}

export async function createKit(
  payload: KitCreateRequest,
  token: string,
): Promise<KitResponse> {
  const res = await fetchWithTimeout(API_ROUTES.CREATE_KIT, {
    method: 'POST',
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });

  return handleResponse<KitResponse>(res);
}
