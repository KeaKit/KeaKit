import { API_ROUTES } from "../config/api";
import {
  KitCreateRequest,
  KitResponse,
  UserArticle,
  KitPaymentDTO,
  KitDeliveryResponse,
  UpdateDeliveryRequest,
  ItemFilterRequest,
  ItemFilterResponse,
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

export async function filterItemsForKit(
  filters: ItemFilterRequest,
  token: string,
): Promise<ItemFilterResponse> {
  const res = await fetchWithTimeout(API_ROUTES.FILTER_ITEMS_FOR_KIT, {
    method: "POST",
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
    body: JSON.stringify(filters),
  });

  if (res.status === 404) {
    return {
      content: [],
      page: filters.page ?? 0,
      size: filters.size ?? 10,
      totalElements: 0,
      totalPages: 0,
      hasNext: false,
      hasPrevious: false,
    };
  }

  const response = await handleResponse<ItemFilterResponse>(res);

  return {
    content: Array.isArray(response?.content) ? response.content : [],
    page: response?.page ?? (filters.page ?? 0),
    size: response?.size ?? (filters.size ?? 10),
    totalElements: response?.totalElements ?? 0,
    totalPages: response?.totalPages ?? 0,
    hasNext: response?.hasNext ?? false,
    hasPrevious: response?.hasPrevious ?? false,
  };
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

export async function validateKit(kitId: number,
  token: string,
): Promise<KitResponse> {
  const res = await fetchWithTimeout(API_ROUTES.VALIDATE_KIT(kitId), {
    method: "GET",
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
  });

  console.log(res)

  if (!res.ok) {
    const errorText = await res.text(); 
    throw new Error(errorText || "Error en la validación");
  }

  return handleResponse<KitResponse>(res);
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

export async function getMyKits(userId: number, token: string): Promise<KitResponse[]> {
  const res = await fetchWithTimeout(API_ROUTES.MY_KITS(userId), {
    method: "GET",
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
  });
  return handleResponse<KitResponse[]>(res);
}

export async function getUpdatrableTrackingKits(userId: number, token: string): Promise<KitResponse[]> {
  const res = await fetchWithTimeout(API_ROUTES.TRACKING_UPDATEABLE_KITS(userId), {
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

export async function getAssignedKits(token: string): Promise<KitResponse[]> {
  const res = await fetchWithTimeout(API_ROUTES.ASSIGNED_KITS, {
    method: "GET",
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
  });
  return handleResponse<KitResponse[]>(res);
}

export async function getAllKits(token: string): Promise<KitResponse[]> {
  const res = await fetchWithTimeout(API_ROUTES.GET_ALL_KITS, {
    method: "GET",
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
  });
  return handleResponse<KitResponse[]>(res);
}

export async function assignCourier(
  kitId: number,
  courierId: number,
  token: string
): Promise<void> {
  const res = await fetchWithTimeout(API_ROUTES.ASSIGN_COURIER(kitId, courierId), {
    method: "PATCH",
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
  });
  await handleResponse<void>(res);
}

export async function getBusyCouriers(
  token: string,
  country?: string,
  city?: string
): Promise<number[]> {
  const res = await fetchWithTimeout(API_ROUTES.BUSY_COURIERS(country, city), {
    method: "GET",
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
  });
  return handleResponse<number[]>(res);
}

export async function getUnassignedKits(
  token: string,
  country?: string,
  city?: string
): Promise<KitResponse[]> {
  const res = await fetchWithTimeout(API_ROUTES.UNASSIGNED_KITS(country, city), {
    method: "GET",
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
  });
  return handleResponse<KitResponse[]>(res);
}

export async function getKitPaymentWithPromo(
  kitId: number,
  token: string,
  promoCode: string,
  email: string,
): Promise<KitPaymentDTO> {
  const res = await fetchWithTimeout(
    API_ROUTES.GET_KIT_PAYMENT_BY_ID_PROMO(kitId, promoCode, email),
    {
      method: 'GET',
      headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
    },
  );
  return handleResponse<KitPaymentDTO>(res);
}

