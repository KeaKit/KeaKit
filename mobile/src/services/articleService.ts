import { API_ROUTES } from '../config/api';
import { Article, ArticlePayload } from '../types';

const normalizeErrorMessage = (raw: string): string => {
  const lower = raw.toLowerCase();
  if (lower.includes('owner not found'))   return 'El propietario no existe.';
  if (lower.includes('article not found')) return 'El artículo no existe.';
  if (lower.includes('unauthorized'))      return 'No tienes permiso para realizar esta acción.';
  return raw;
};

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMessage = `HTTP ${res.status}`;
    try {
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await res.json();
        errorMessage = errorData.message || errorData.error || JSON.stringify(errorData);
      } else {
        errorMessage = await res.text();
      }
    } catch {}
    throw new Error(normalizeErrorMessage(errorMessage));
  }
  return res.json() as Promise<T>;
}

const jsonHeaders = { 'Content-Type': 'application/json' };


export async function getMyArticles(
  userId: number,
  token: string,
): Promise<Article[]> {
  const res = await fetch(API_ROUTES.MY_ARTICLES(userId), {
    method: 'GET',
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
  });
  return handleResponse<Article[]>(res);
}

export async function getArticleById(id: number, token: string): Promise<Article> {
    const res = await fetch(API_ROUTES.GET_ARTICLE(id), {
        method: 'GET',
        headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
    });
    return handleResponse<Article>(res);
}

export async function uploadArticle(
  ownerId: number,
  token: string,
  payload: ArticlePayload,
): Promise<Article> {
  const res = await fetch(API_ROUTES.UPLOAD_ARTICLE(ownerId), {
    method: 'POST',
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  return handleResponse<Article>(res);
}

export async function updateArticle(
  id: number,
  ownerId: number,
  token: string,
  payload: Partial<ArticlePayload>,
): Promise<Article> {
  const res = await fetch(API_ROUTES.UPDATE_ARTICLE(id, ownerId), {
    method: 'PUT',
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  return handleResponse<Article>(res);
}

export async function deleteArticle(
  id: number,
  ownerId: number,
  token: string,
): Promise<void> {
  const res = await fetch(API_ROUTES.DELETE_ARTICLE(id, ownerId), {
    method: 'DELETE',
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    let errorMessage = `HTTP ${res.status}`;
    try { errorMessage = await res.text(); } catch {}
    throw new Error(normalizeErrorMessage(errorMessage));
  }
}


export async function toggleRent(
  id: number,
  ownerId: number,
  token: string,
): Promise<Article> {
  const res = await fetch(API_ROUTES.TOGGLE_RENT(id, ownerId), {
    method: 'POST',
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
  });
  return handleResponse<Article>(res);
}