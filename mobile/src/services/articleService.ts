import { API_ROUTES } from '../config/api';
import { Article, ArticlePayload } from '../types';
import { Platform } from 'react-native';

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
  queryFilters?: { 
    categoryId?: number; 
    condition?: string; 
    minPrice?: number; 
    maxPrice?: number 
  }
): Promise<Article[]> {
 

  let url = API_ROUTES.MY_ARTICLES(userId);


  if (queryFilters) {
    const params = new URLSearchParams();
    
    if (queryFilters.categoryId) {
      params.append('categoryId', queryFilters.categoryId.toString());
    }
    if (queryFilters.condition) {
      params.append('condition', queryFilters.condition);
    }

    if (queryFilters.minPrice !== undefined && queryFilters.minPrice !== null) {
      params.append('minPrice', queryFilters.minPrice.toString());
    }
    if (queryFilters.maxPrice !== undefined && queryFilters.maxPrice !== null) {
      params.append('maxPrice', queryFilters.maxPrice.toString());
    }
    
    const queryString = params.toString();
    if (queryString) {

      url += (url.includes('?') ? '&' : '?') + queryString; 
    }
  }

  const res = await fetch(url, {
    method: 'GET',
    headers: { 
      ...jsonHeaders, 
      Authorization: `Bearer ${token}` 
    },
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
  categoryId: number,
  token: string,
  payload: ArticlePayload,
): Promise<Article> {
  const res = await fetch(API_ROUTES.UPLOAD_ARTICLE(ownerId,categoryId), {
    method: 'POST',
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  return handleResponse<Article>(res);
}

export async function uploadArticleWithImage(
  ownerId: number,
  categoryId: number,
  token: string,
  payload: ArticlePayload,
  imageUri: string,
  imageName: string
): Promise<Article> {
  const formData = new FormData();
  
  formData.append('data', JSON.stringify(payload));
  
  // Agregar archivo de imagen
  if (Platform.OS === 'web') {
    // Si estamos en entorno web
    const response = await fetch(imageUri);
    const blob = await response.blob();
    formData.append('image', blob, imageName);
  } else {
    // React Native móvil
    const imageType = imageName.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
    formData.append('image', {
      uri: imageUri,
      type: imageType,
      name: imageName
    } as any);
  }

  const res = await fetch(API_ROUTES.UPLOAD_ARTICLE_WITH_IMAGE(ownerId, categoryId), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
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