import { API_ROUTES } from "../config/api";
import { Wallet, Transaction, WithdrawRequest, TransactionWithDetails } from "../types";
import { handleResponse, fetchWithTimeout, jsonHeaders } from "./utils";

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

export const withdrawToBank = async (
  token: string,
  payload: WithdrawRequest,
): Promise<string> => {
  const res = await fetchWithTimeout(API_ROUTES.WITHDRAW_TO_BANK, {
    method: "POST",
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Error al procesar la retirada");
  }

  return handleResponse<string>(res);
};

export async function getTransactionDetails(
  transactionId: number,
  token: string,
): Promise<TransactionWithDetails> {
  const res = await fetch(API_ROUTES.GET_TRANSACTION_DETAILS(transactionId), {
    method: "GET",
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
  });
  return handleResponse<TransactionWithDetails>(res);
}
