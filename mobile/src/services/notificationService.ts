import { API_ROUTES } from "../config/api";
import { ActivityNotification } from "../types";
import { fetchWithTimeout, handleResponse, jsonHeaders } from "./utils";

export async function getUserNotifications(
  userId: number,
  token: string,
): Promise<ActivityNotification[]> {
  const res = await fetchWithTimeout(API_ROUTES.USER_NOTIFICATIONS(userId), {
    method: "GET",
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
  });

  return handleResponse<ActivityNotification[]>(res);
}

export async function markNotificationRead(
  notificationId: number,
  token: string,
): Promise<void> {
  const res = await fetchWithTimeout(
    API_ROUTES.MARK_NOTIFICATION_READ(notificationId),
    {
      method: "PATCH",
      headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
    },
  );

  await handleResponse<void>(res);
}

export async function deleteNotification(
  notificationId: number,
  token: string,
): Promise<void> {
  const res = await fetchWithTimeout(
    API_ROUTES.DELETE_NOTIFICATION(notificationId),
    {
      method: "DELETE",
      headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
    },
  );

  await handleResponse<void>(res);
}
