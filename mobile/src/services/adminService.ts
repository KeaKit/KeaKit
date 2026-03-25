import { API_ROUTES } from '../config/api';
import { UserResponse } from '../types';

type AdminUserPayload = {
  name: string;
  email: string;
  password?: string;
  role?: string;
  phone: string;
  address: string;
  city: string;
  country: string;
};

const jsonHeaders = { 'Content-Type': 'application/json' };

// Normaliza errores del backend
const normalizeErrorMessage = (raw: string): string => {
  const lower = raw.toLowerCase();
  if (lower.includes('email already')) return 'El correo ya está registrado.';
  if (lower.includes('not found')) return 'Usuario no encontrado.';
  return raw;
};

// Manejo de respuestas HTTP y parseo seguro de JSON
async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMessage = `HTTP ${res.status}`;

    try {
      const contentType = res.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        const errorData = await res.json();
        errorMessage = errorData.message || errorData.error || JSON.stringify(errorData);
      } else {
        errorMessage = await res.text();
      }
    } catch {}

    throw new Error(normalizeErrorMessage(errorMessage));
  }

  // DELETE 204 no content
  if (res.status === 204) return {} as T;

  // Intentamos parsear JSON
  const contentType = res.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    return res.json() as Promise<T>;
  }

  const text = await res.text();
  if (!text) return {} as T;

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error('Respuesta del servidor no es JSON válido: ' + text);
  }
}

// Listar usuarios
export async function getAllUsers(token: string): Promise<UserResponse[]> {
  const res = await fetch(API_ROUTES.GET_ALL_USERS, {
    method: 'GET',
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
  });
  return handleResponse<UserResponse[]>(res);
}

export async function getAdminUsers(token: string): Promise<UserResponse[]> {
  const res = await fetch(API_ROUTES.GET_ADMIN_ALL_USERS, {
    method: 'GET',
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
  });
  return handleResponse<UserResponse[]>(res);
}


// Eliminar usuario
export async function deleteUser(id: number, token: string): Promise<void> {
  const res = await fetch(API_ROUTES.DELETE_USER(id), {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  await handleResponse<void>(res); // manejar 204
}

export async function createUser(
  data: AdminUserPayload,
  token: string
): Promise<UserResponse> {
  const res = await fetch(API_ROUTES.CREATE_USER, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  return handleResponse<UserResponse>(res);
}

export async function updateUser(
  id: number,
  data: Partial<AdminUserPayload>,
  token: string
): Promise<UserResponse> {
  const res = await fetch(API_ROUTES.UPDATE_USER(id), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  return handleResponse<UserResponse>(res);
}