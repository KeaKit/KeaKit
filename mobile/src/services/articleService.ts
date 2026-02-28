import { API_ROUTES } from '../config/api';
import { Article } from '../types';

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

    throw new Error(errorMessage);
  }
  return res.json() as Promise<T>;
}

export async function getMyArticles(userId: number, token: string): Promise<Article[]> {
  const res = await fetch(API_ROUTES.MY_ARTICLES(userId), {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return handleResponse<Article[]>(res);
}