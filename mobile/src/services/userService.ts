import { API_ROUTES } from '../config/api';
import { ProfileData } from '../types';

export const updateProfile = async (id: number, data: Partial<ProfileData>, token: string) => {
  const response = await fetch(API_ROUTES.UPDATE_PROFILE(id), {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error('Error al actualizar el perfil.');
  return response.json();
};