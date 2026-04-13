import { API_ROUTES } from "../config/api";
import { handleResponse, fetchWithTimeout, jsonHeaders } from "./utils";

export async function fetchItemsForRent(
  ownerId: number,
  token: string,
): Promise<any[]> {
  const res = await fetchWithTimeout(API_ROUTES.ITEMS_FOR_RENT(ownerId), {
    method: "GET",
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
  });

  return handleResponse<unknown[]>(res);
}
