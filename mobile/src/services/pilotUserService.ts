import BASE_URL from '../config/api';
import { fetchWithTimeout, handleResponse, jsonHeaders } from './utils';

export interface PilotUserResponse {
  id: number;
  email: string;
  active: boolean;
}

export interface PilotUserRequest {
  email: string;
  active: boolean;
}

export const getAllPilotUsers = async (token: string): Promise<PilotUserResponse[]> => {
  const res = await fetchWithTimeout(`${BASE_URL}/api/admin/pilot-users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse<PilotUserResponse[]>(res);
};

export const getActivePilotEmails = async (token: string): Promise<string[]> => {
  const res = await fetchWithTimeout(`${BASE_URL}/api/admin/pilot-users/active-emails`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse<string[]>(res);
};

export const createPilotUser = async (token: string, data: PilotUserRequest): Promise<PilotUserResponse> => {
  const res = await fetchWithTimeout(`${BASE_URL}/api/admin/pilot-users`, {
    method: 'POST',
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  return handleResponse<PilotUserResponse>(res);
};

export const updatePilotUser = async (token: string, id: number, data: PilotUserRequest): Promise<PilotUserResponse> => {
  const res = await fetchWithTimeout(`${BASE_URL}/api/admin/pilot-users/${id}`, {
    method: 'PUT',
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  return handleResponse<PilotUserResponse>(res);
};

export const bulkSetActivePilotUsers = async (
  token: string,
  ids: number[],
  active: boolean,
): Promise<void> => {
  const res = await fetchWithTimeout(`${BASE_URL}/api/admin/pilot-users/bulk-active`, {
    method: 'PATCH',
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
    body: JSON.stringify({ ids, active }),
  });
  return handleResponse<void>(res);
};