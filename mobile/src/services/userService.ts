import { API_ROUTES } from '../config/api';
import { ProfileData, UserResponse } from '../types';
import { Platform } from 'react-native';

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
    } catch (e) {
      // If we can't parse the response, use the status text
      errorMessage = res.statusText || `HTTP ${res.status}`;
    }

    if (res.status === 401 && /jwt expired|token expired|invalid token|blacklisted/i.test(errorMessage)) {
      const err = new Error('Session expired. Please log in again.');
      (err as any).name = 'TokenExpiredError';
      throw err;
    }

    throw new Error(errorMessage);
  }

  // For successful responses, try to parse JSON
  try {
    return await res.json() as Promise<T>;
  } catch (e) {
    throw new Error('Invalid response format from server');
  }
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

export async function uploadProfilePhoto(
  id: number,
  imageUri: string,
  token: string,
): Promise<UserResponse> {
  const fileName = imageUri.split('/').pop() || 'profile.jpg';
  const extension = fileName.split('.').pop()?.toLowerCase();
  const imageType = extension === 'png' ? 'image/png' : 'image/jpeg';

  const formData = new FormData();

  if (Platform.OS === 'web') {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    formData.append('file', blob, fileName);
  } else {
    // @ts-ignore: React Native FormData file object @{uri,name,type}
    formData.append('file', {
      uri: imageUri,
      name: fileName,
      type: imageType,
    });
  }

  const res = await fetch(API_ROUTES.UPDATE_PROFILE_PHOTO(id), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      // Omitimos Content-Type para que fetch añada el boundary automáticamente.
    },
    body: formData,
  });

  return handleResponse<UserResponse>(res);
}
