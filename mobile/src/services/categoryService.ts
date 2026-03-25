import { API_ROUTES } from '../config/api';
// Asegúrate de tener la interfaz Category exportada en tu archivo types
import { Article, Category } from '../types';

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


export async function fetchAllCategories(token: string): Promise<Category[]> {
  const res = await fetchWithTimeout(API_ROUTES.CATEGORIES, {
    method: 'GET',
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
  });

  return handleResponse<Category[]>(res);
}


export async function fetchCategoryById(id: number, token: string): Promise<Category> {
  const res = await fetchWithTimeout(API_ROUTES.CATEGORY_BY_ID(id), {
    method: 'GET',
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
  });

  return handleResponse<Category>(res);
}

export async function createCategory(
  payload: Partial<Category>, 
  token: string
): Promise<Category> {
  const res = await fetchWithTimeout(API_ROUTES.CATEGORIES, {
    method: 'POST',
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });

  return handleResponse<Category>(res);
}


export async function updateCategory(
  id: number, 
  payload: Partial<Category>, 
  token: string
): Promise<Category> {
  const res = await fetchWithTimeout(API_ROUTES.CATEGORY_BY_ID(id), {
    method: 'PUT',
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });

  return handleResponse<Category>(res);
}


export async function deleteCategory(id: number, token: string): Promise<string> {
  const res = await fetchWithTimeout(API_ROUTES.CATEGORY_BY_ID(id), {
    method: 'DELETE',
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
  });

  return handleResponse<string>(res);
}

export async function fetchArticleCountByCategory(categoryId: number, token: string): Promise<number> {
  const res = await fetchWithTimeout(API_ROUTES.GET_NUMBER_OF_ARTICLES_BY_CATEGORY(categoryId), {
    method: 'GET',
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
  });
  return handleResponse<number>(res);
}


export async function fetchLatestArticlesByCategory(categoryId: number, token: string): Promise<Article[]> {
  const res = await fetchWithTimeout(API_ROUTES.GET_LATEST_ARTICLES_BY_CATEGORY(categoryId), {
    method: 'GET',
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
  });
  return handleResponse<Article[]>(res);
}