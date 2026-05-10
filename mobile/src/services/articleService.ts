import { API_ROUTES } from '../config/api';
import { Article, ArticleNearby, ArticlePayload, ArticleRecordDTO, UserArticle } from '../types';
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
): Promise<UserArticle[]> {
 

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
  
  return handleResponse<UserArticle[]>(res);
}

export async function getArticleById(id: number, token: string): Promise<Article> {
    const res = await fetch(API_ROUTES.GET_ARTICLE(id), {
        method: 'GET',
        headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
    });
    return handleResponse<Article>(res);
}

export async function requestArticleAvailabilityNotification(
  articleId: number,
  requesterId: number,
  token: string,
  startDate?: string,
  endDate?: string,
): Promise<string> {
  return postTextResult(
    API_ROUTES.REQUEST_AVAILABILITY_NOTIFICATION(
      articleId,
      requesterId,
      startDate,
      endDate,
    ),
    token,
  );
}

export async function createDemandAlert(
  articleId: number,
  requesterId: number,
  token: string,
  startDate?: string,
  endDate?: string,
): Promise<string> {
  return postTextResult(
    API_ROUTES.CREATE_DEMAND_ALERT(articleId, requesterId, startDate, endDate),
    token,
  );
}

async function postTextResult(url: string, token: string): Promise<string> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    let errorMessage = `HTTP ${res.status}`;
    try {
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await res.json();
        errorMessage = data.message || data.error || JSON.stringify(data);
      } else {
        errorMessage = await res.text();
      }
    } catch {}
    throw new Error(normalizeErrorMessage(errorMessage));
  }

  const contentType = res.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return res.json();
  }
  return res.text();
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
  imageUri?: string,
  imageName?: string,
): Promise<Article> {
  // Si hay imagen, usar el endpoint con imagen
  if (imageUri && imageName) {
    const formData = new FormData();
    
    // Añadir los datos del artículo como JSON
    formData.append('data', JSON.stringify(payload));
    
    // Añadir la imagen
    if (Platform.OS === 'web') {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      formData.append('image', blob, imageName);
    } else {
      const imageType = imageName.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
      formData.append('image', {
        uri: imageUri,
        type: imageType,
        name: imageName,
      } as any);
    }
    
    const res = await fetch(API_ROUTES.UPDATE_ARTICLE_WITH_IMAGE(id, ownerId), {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    return handleResponse<Article>(res);
  } 
  
  // Sin imagen, usar el endpoint JSON original
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

export async function getNearbyArticles(
  city: string,
  country: string,
  token: string,
  radiusKm = 150,
): Promise<ArticleNearby[]> {
  const res = await fetch(API_ROUTES.ARTICLE_NEARBY(city, country, radiusKm), {
    method: 'GET',
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
  });
  return handleResponse<ArticleNearby[]>(res);
}

export async function getArticlesForMap(
  token: string,
  country?: string,
  includeRented: boolean = false,
): Promise<ArticleNearby[]> {
  const res = await fetch(API_ROUTES.ARTICLE_MAP(country, includeRented), {
    method: 'GET',
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
  });
  return handleResponse<ArticleNearby[]>(res);
}

export const getArticleRecord = async (articleId: number, token: string): Promise<ArticleRecordDTO[]> => {
  const response = await fetch(API_ROUTES.GET_ARTICLE_HISTORY(articleId), {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('No se pudo obtener el historial del artículo');
  }

  return await response.json();
};

// Definir el tipo según el backend
export interface ReturnRequest {
  condition: 'GOOD' | 'DAMAGED';
}

export const processArticleReturn = async (
  articleId: number, 
  ownerId: number, 
  condition: 'GOOD' | 'DAMAGED', 
  token: string
) => {
  const response = await fetch(API_ROUTES.ARTICLE_RETURN(articleId, ownerId), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ condition }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al procesar la devolución');
  }

  return await response.json();
};
