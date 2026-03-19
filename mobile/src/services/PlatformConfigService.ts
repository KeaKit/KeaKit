import BASE_URL from '../config/api';

export interface PlatformConfigResponse {
  id: number;
  commissionRate: number; // decimal 0.0–1.0
}

export const getCommissionConfig = async (token: string): Promise<PlatformConfigResponse> => {
  const res = await fetch(`${BASE_URL}/api/admin/config/commission`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('No se pudo obtener la comisión');
  return res.json();
};

export const updateCommissionConfig = async (
  token: string,
  commissionRate: number,
): Promise<PlatformConfigResponse> => {
  const res = await fetch(`${BASE_URL}/api/admin/config/commission`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ commissionRate }),
  });
  if (!res.ok) throw new Error('No se pudo actualizar la comisión');
  return res.json();
};