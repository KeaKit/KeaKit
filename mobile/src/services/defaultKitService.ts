import { API_ROUTES } from '../config/api';
import { DefaultKit, DefaultKitCreateRequest } from '../types';
import { handleResponse, fetchWithTimeout, jsonHeaders } from './utils';


export async function fetchAllDefaultKits(token: string): Promise<DefaultKit[]> {
  const res = await fetchWithTimeout(API_ROUTES.DEFAULT_KITS, {
    method: 'GET',
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
  });

  return handleResponse<DefaultKit[]>(res);
}

export async function fetchDefaultKitById(id: number, token: string): Promise<DefaultKit> {
  const res = await fetchWithTimeout(API_ROUTES.DEFAULT_KIT_BY_ID(id), {
    method: 'GET',
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
  });

  return handleResponse<DefaultKit>(res);
}

export async function createDefaultKit(
  payload: Partial<DefaultKitCreateRequest>,
  token: string,
): Promise<DefaultKit> {
  const res = await fetchWithTimeout(API_ROUTES.DEFAULT_KITS, {
    method: 'POST',
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });

  return handleResponse<DefaultKit>(res);
}

export async function updateDefaultKit(
  id: number,
  payload: Partial<DefaultKitCreateRequest>,
  token: string,
): Promise<DefaultKit> {
  const res = await fetchWithTimeout(API_ROUTES.DEFAULT_KIT_BY_ID(id), {
    method: 'PUT',
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });

  return handleResponse<DefaultKit>(res);
}

export async function deleteDefaultKit(id: number, token: string): Promise<string> {
  const res = await fetchWithTimeout(API_ROUTES.DEFAULT_KIT_BY_ID(id), {
    method: 'DELETE',
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
  });

  if (res.status === 204 || res.status === 200) {
    return "Kit predeterminado eliminado";
  }

  return handleResponse<string>(res);
}
