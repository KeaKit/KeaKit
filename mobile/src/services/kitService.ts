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

export async function getKit(kitId: number,
  token: string,
): Promise<KitResponse> {
  const res = await fetchWithTimeout(API_ROUTES.GET_KIT(kitId), {
    method: "GET",
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
  });

  return handleResponse<KitResponse>(res);
}

export async function getAllKits(token: string): Promise<KitResponse[]> {
  const res = await fetchWithTimeout(API_ROUTES.GET_KITS, {
    method: "GET",
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
  });

  return handleResponse<KitResponse[]>(res);
}

export async function addItemToKit(
  kitId: number,
  itemId: number,
  userId: number,
  token: string,
): Promise<KitResponse> {
  const res = await fetchWithTimeout(
    API_ROUTES.ADD_ITEM_TO_KIT(kitId, itemId, userId),
    {
      method: "POST",
      headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
    },
  );

  return handleResponse<KitResponse>(res);
}

export async function removeItemFromKit(
  kitId: number,
  itemId: number,
  userId: number,
  token: string,
): Promise<KitResponse> {
  const res = await fetchWithTimeout(
    API_ROUTES.REMOVE_ITEM_FROM_KIT(kitId, itemId, userId),
    {
      method: "DELETE",
      headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
    },
  );

  return handleResponse<KitResponse>(res);
}

export async function deleteKit(kitId: number, token: string): Promise<void> {
  const res = await fetchWithTimeout(API_ROUTES.GET_KIT(kitId), {
    method: "DELETE",
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
  });

  return handleResponse<void>(res);
}