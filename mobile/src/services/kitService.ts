import { API_ROUTES } from "../config/api";
import {
  KitCreateRequest,
  KitResponse,
  UserArticle,
  KitPaymentDTO,
  KitDeliveryResponse,
  UpdateDeliveryRequest
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

export async function deleteKit(kitId: number, token: string): Promise<void> {
  const res = await fetchWithTimeout(API_ROUTES.GET_KIT(kitId), {
    method: "DELETE",
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
  });

  return handleResponse<void>(res);
}

export async function getMyKits(userId: number, token: string): Promise<KitResponse[]> {
  const res = await fetchWithTimeout(API_ROUTES.MY_KITS(userId), {
    method: "GET",
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
  });
  return handleResponse<KitResponse[]>(res);
}

export async function getKitTracking(
  kitId: number,
  token: string,
): Promise<KitDeliveryResponse> {
  const res = await fetchWithTimeout(API_ROUTES.GET_KIT_TRACKING(kitId), {
    method: "GET",
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
  });
  return handleResponse<KitDeliveryResponse>(res);
}

export async function updateKitTracking(
  kitId: number,
  payload: UpdateDeliveryRequest,
  token: string,
): Promise<KitDeliveryResponse> {
  const res = await fetchWithTimeout(API_ROUTES.UPDATE_KIT_TRACKING(kitId), {
    method: "PATCH",
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  return handleResponse<KitDeliveryResponse>(res);
}