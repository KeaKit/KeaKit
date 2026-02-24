import { API_ROUTES } from '../config/api';
import {
  LoginRequest,
  RegisterRequest,
  UserResponse,
} from '../types';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || `HTTP ${res.status}`);
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

