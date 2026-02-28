import { API_ROUTES } from '../config/api';
import { RatingCreateRequest, RatingResponse } from '../types';

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
    } catch {
      // Si falla el parseo, usar el mensaje por defecto
    }

    throw new Error(errorMessage || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

const jsonHeaders = { 'Content-Type': 'application/json' };

export async function createRating(
  data: RatingCreateRequest,
  token: string,
): Promise<RatingResponse> {
  const res = await fetch(API_ROUTES.CREATE_RATING, {
    method: 'POST',
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  return handleResponse<RatingResponse>(res);
}

export async function getRatingsForUser(
  userId: number,
  token: string,
): Promise<RatingResponse[]> {
  const res = await fetch(API_ROUTES.GET_RATINGS_FOR_USER(userId), {
    method: 'GET',
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
  });
  return handleResponse<RatingResponse[]>(res);
}

export async function getRatingsByUser(
  userId: number,
  token: string,
): Promise<RatingResponse[]> {
  const res = await fetch(API_ROUTES.GET_RATINGS_BY_USER(userId), {
    method: 'GET',
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
  });
  return handleResponse<RatingResponse[]>(res);
}

export async function deleteRating(
  id: number,
  token: string,
): Promise<void> {
  const res = await fetch(API_ROUTES.DELETE_RATING(id), {
    method: 'DELETE',
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
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
    } catch {
      // use default message
    }
    throw new Error(errorMessage);
  }
}
