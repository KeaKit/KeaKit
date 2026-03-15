import { API_ROUTES } from "../config/api";
import {
  KitCreateRequest,
  KitResponse,
  UserArticle,
  KitPaymentDTO,
} from "../types";
import { handleResponse, fetchWithTimeout, jsonHeaders } from "./utils";

export async function fetchMyArticles(
  userId: number,
  token: string,
): Promise<UserArticle[]> {
  const res = await fetchWithTimeout(API_ROUTES.MY_ARTICLES(userId), {
    method: "GET",
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
  });

  return handleResponse<UserArticle[]>(res);
}

export async function createKit(
  payload: KitCreateRequest,
  token: string,
): Promise<KitResponse> {
  const res = await fetchWithTimeout(API_ROUTES.CREATE_KIT, {
    method: "POST",
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });

  return handleResponse<KitResponse>(res);
}

export async function getKitPayment(
  kitId: number,
  token: string,
): Promise<KitPaymentDTO> {
  const res = await fetchWithTimeout(API_ROUTES.GET_KIT_PAYMENT_BY_ID(kitId), {
    method: "GET",
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
  });

  return handleResponse<KitPaymentDTO>(res);
}
