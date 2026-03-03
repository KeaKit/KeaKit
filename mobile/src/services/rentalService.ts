import { API_ROUTES } from '../config/api';
import { ReturnRequest, ReturnResponse, UserArticle, ArticleReviewDetail } from '../types';

const jsonHeaders = { 'Content-Type': 'application/json' };

/**
 * Procesa la devolución de un artículo individual.
 * El arrendador indica si el artículo está en buen estado (GOOD) o dañado (DAMAGED).
 */
export async function processArticleReturn(
  articleId: number,
  ownerId: number,
  token: string,
  request: ReturnRequest,
): Promise<ReturnResponse> {
  const res = await fetch(API_ROUTES.PROCESS_RETURN(articleId, ownerId), {
    method: 'POST',
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
    body: JSON.stringify(request),
  });

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
    throw new Error(errorMessage);
  }

  return res.json();
}

/**
 * Obtiene el detalle de revisión de un artículo (incluye info del inquilino).
 */
export async function getArticleReviewDetail(
  articleId: number,
  token: string,
): Promise<ArticleReviewDetail> {
  const res = await fetch(API_ROUTES.ARTICLE_REVIEW_DETAIL(articleId), {
    method: 'GET',
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error('Error al obtener los detalles de revisión del artículo');
  }

  return res.json();
}

/**
 * Obtiene los artículos pendientes de revisión de un propietario.
 */
export async function getPendingReviewArticles(
  ownerId: number,
  token: string,
): Promise<UserArticle[]> {
  const res = await fetch(API_ROUTES.PENDING_REVIEW_ARTICLES(ownerId), {
    method: 'GET',
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error('Error al obtener los artículos pendientes de revisión');
  }

  return res.json();
}
