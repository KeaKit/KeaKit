import { API_ROUTES } from '../config/api';
import { ProfileData, UserResponse } from '../types';

const jsonHeaders = { 'Content-Type': 'application/json' };

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMessage = `HTTP ${res.status}`;

    try {
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await res.json();
        errorMessage =
          errorData.message ||
          errorData.error ||
          Object.values(errorData)[0] as string ||
          JSON.stringify(errorData);
      } else {
        errorMessage = await res.text();
      }
    } catch {}

    throw new Error(errorMessage);
  }
  return res.json() as Promise<T>;
}

export async function updateProfile(
  id: number,
  data: Partial<ProfileData>,
  token: string,
): Promise<UserResponse> {
  const res = await fetch(API_ROUTES.UPDATE_PROFILE(id), {
    method: 'PUT',
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  return handleResponse<UserResponse>(res);
}