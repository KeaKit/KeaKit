import { API_ROUTES } from '../config/api';
import {
  LoginRequest,
  RegisterRequest,
  UserResponse,
} from '../types';

const normalizeErrorMessage = (raw: string): string => {
  const lower = raw.toLowerCase();
  if (lower.includes('email should be valid'))    return 'El formato del correo no es válido.';
  if (lower.includes('password must be at least')) return 'La contraseña es demasiado débil (mínimo 6 caracteres).';
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

