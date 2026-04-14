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

export const uploadProfileImage = async (image: File, token: string): Promise<UserResponse> => {
  const formData = new FormData();
  formData.append('image', image);
  const res = await fetch(API_ROUTES.UPLOAD_PROFILE_IMAGE, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  return handleResponse<UserResponse>(res);
};

export interface PublicUserProfile {
  profileImageUrl?: string;
  founderBadge: boolean;
}

export const getPublicUserProfile = async (userId: number): Promise<PublicUserProfile> => {
  const res = await fetch(API_ROUTES.GET_PUBLIC_USER_PROFILE(userId), {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return handleResponse<PublicUserProfile>(res);
};