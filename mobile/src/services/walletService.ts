import BASE_URL from '../config/api';

export interface Wallet {
  id: number;
  availableBalance: number;
  pendingBalance: number;
  currency: string;
}

export const getWalletByUserId = async (userId: number, token: string): Promise<Wallet> => {
  const response = await fetch(`${BASE_URL}/api/wallet/user/${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Error al obtener la wallet del usuario');
  }

  return response.json();
};