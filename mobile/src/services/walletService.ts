import { API_ROUTES } from "../config/api";
import { Wallet } from "../types";
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
