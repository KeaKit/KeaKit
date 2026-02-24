import { API_ROUTES } from '../config/api';
import {
  LoginRequest,
  RegisterRequest,
  UserResponse,
} from '../types';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMessage = `HTTP ${res.status}`;

    try {
      const contentType = res.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        const errorData = await res.json();
        // Backend puede retornar ErrorResponse {message, status, error, ...} o Map<string, string> para validación
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

export async function registerUser(
  data: RegisterRequest,
): Promise<UserResponse> {
  const res = await fetch(API_ROUTES.REGISTER, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(data),
  });
  return handleResponse<UserResponse>(res);
}

export async function loginUser(
  data: LoginRequest,
): Promise<UserResponse> {
  const res = await fetch(API_ROUTES.LOGIN, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(data),
  });
  return handleResponse<UserResponse>(res);
}

export async function getUserById(
  id: number,
  token: string,
): Promise<UserResponse> {
  const res = await fetch(API_ROUTES.GET_USER(id), {
    method: 'GET',
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
  });
  return handleResponse<UserResponse>(res);
}

