import { API_ROUTES } from '../config/api';
import { Service, ServicePayload } from '../types';
import { Platform } from 'react-native';

const normalizeErrorMessage = (raw: string): string => {
  const lower = raw.toLowerCase();
  if (lower.includes('user not found')) return 'El usuario no existe.';
  if (lower.includes('service not found')) return 'El servicio no existe.';
  if (lower.includes('unauthorized')) return 'No tienes permiso para realizar esta acción.';
  if (lower.includes('currently rented')) return 'El servicio está alquilado y no puede modificarse.';
  if (lower.includes('not active')) return 'El servicio no está activo.';
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

// Obtener servicios activos (catálogo)
export async function getActiveServices(token: string): Promise<Service[]> {
  const res = await fetch(API_ROUTES.ACTIVE_SERVICES, {
    method: 'GET',
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
  });
  return handleResponse<Service[]>(res);
}

// Obtener servicios del usuario
export async function getMyServices(userId: number, token: string): Promise<Service[]> {
  const res = await fetch(API_ROUTES.MY_SERVICES(userId), {
    method: 'GET',
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
  });
  return handleResponse<Service[]>(res);
}

// Obtener servicio por ID
export async function getServiceById(id: number, token: string): Promise<Service> {
  const res = await fetch(API_ROUTES.GET_SERVICE(id), {
    method: 'GET',
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
  });
  return handleResponse<Service>(res);
}

// Promocionar nuevo servicio
export async function promoteService(
  ownerId: number,
  categoryId: number,
  token: string,
  payload: ServicePayload,
): Promise<Service> {
  const url = `${API_ROUTES.PROMOTE_SERVICE}?ownerId=${ownerId}&categoryId=${categoryId}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  return handleResponse<Service>(res);
}

// Actualizar servicio
export async function updateService(
  id: number,
  ownerId: number,
  token: string,
  payload: Partial<ServicePayload>,
): Promise<Service> {
  const url = `${API_ROUTES.UPDATE_SERVICE(id)}?ownerId=${ownerId}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  return handleResponse<Service>(res);
}

// Eliminar servicio
export async function deleteService(
  id: number,
  ownerId: number,
  token: string,
): Promise<void> {
  const url = `${API_ROUTES.DELETE_SERVICE(id)}?ownerId=${ownerId}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    let errorMessage = `HTTP ${res.status}`;
    try { errorMessage = await res.text(); } catch {}
    throw new Error(normalizeErrorMessage(errorMessage));
  }
}

// Solicitar servicio (alquilar)
export async function requestService(id: number, token: string): Promise<Service> {
  const res = await fetch(API_ROUTES.REQUEST_SERVICE(id), {
    method: 'POST',
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
  });
  return handleResponse<Service>(res);
}

// Liberar servicio (cancelar alquiler)
export async function releaseService(id: number, token: string): Promise<Service> {
  const res = await fetch(API_ROUTES.RELEASE_SERVICE(id), {
    method: 'POST',
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
  });
  return handleResponse<Service>(res);
}