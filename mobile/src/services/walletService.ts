import { API_ROUTES } from "../config/api";
import { Wallet, Transaction } from "../types";
import { handleResponse, fetchWithTimeout, jsonHeaders } from "./utils";

export interface WithdrawalPayload {
  bankAccount: string;
  amount: number;
}

export const getWalletByUserId = async (
  userId: number,
  token: string,
): Promise<Wallet> => {
  const res = await fetchWithTimeout(API_ROUTES.GET_WALLET_BY_USER_ID(userId), {
    method: "GET",
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
  });

  return handleResponse<Wallet>(res);
};

export const getLoggedUserWallet = async (token: string): Promise<Wallet> => {
  const res = await fetchWithTimeout(API_ROUTES.GET_MY_WALLET, {
    method: "GET",
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
  });

  return handleResponse<Wallet>(res);
};

export const getLoggedUserTransactions = async (token: string): Promise<Transaction[]> => {
  const res = await fetchWithTimeout(API_ROUTES.GET_MY_TRANSACTIONS, {
    method: "GET",
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
  });

  return handleResponse<Transaction[]>(res);
};

export const withdrawFromLoggedUserWallet = async (
  token: string,
  payload: WithdrawalPayload,
): Promise<Transaction> => {
  const res = await fetchWithTimeout(API_ROUTES.WITHDRAW_FROM_MY_WALLET, {
    method: "POST",
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });

  return handleResponse<Transaction>(res);
};