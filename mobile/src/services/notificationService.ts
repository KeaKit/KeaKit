import AsyncStorage from "@react-native-async-storage/async-storage";
import { KitResponse } from "../types";

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  dateLabel: string;
};

const SAMPLE_NOTIFICATION: NotificationItem = {
  id: "sample-notification-tomorrow",
  title: "Kit de ejemplo",
  message: "Tu kit llega mañana",
  dateLabel: "Mañana",
};

const formatDate = (dateString?: string): string => {
  if (!dateString) return "";
  const parts = dateString.split("-");
  return parts.length === 3
    ? `${parts[2]}/${parts[1]}/${parts[0]}`
    : dateString;
};

const parseIsoDate = (dateString?: string): Date | null => {
  if (!dateString) return null;
  const parsed = new Date(`${dateString}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const buildRealNotifications = (kits: KitResponse[]): NotificationItem[] => {
  return kits
    .map((kit) => {
      const arrivalIso = kit.arrivalDate ?? kit.estimatedDeliveryDate;
      return {
        kit,
        arrivalIso,
        arrivalDate: parseIsoDate(arrivalIso),
      };
    })
    .filter(({ kit, arrivalDate }) =>
      Boolean(kit.deliveryNotification && arrivalDate),
    )
    .sort((a, b) => {
      if (!a.arrivalDate || !b.arrivalDate) return 0;
      return a.arrivalDate.getTime() - b.arrivalDate.getTime();
    })
    .slice(0, 5)
    .map(({ kit, arrivalIso }) => ({
      id: `kit-${kit.id}-${arrivalIso ?? "na"}`,
      title: `Kit ${kit.name}`,
      message: kit.deliveryNotification ?? "",
      dateLabel: arrivalIso ? formatDate(arrivalIso) : "",
    }));
};

export const buildNotifications = (kits: KitResponse[]): NotificationItem[] => {
  const real = buildRealNotifications(kits);
  return real.length > 0 ? real : [SAMPLE_NOTIFICATION];
};

const readStorageKey = (userId: number) =>
  `@KeaKit:readNotificationIds:${userId}`;

const getReadIds = async (userId: number): Promise<string[]> => {
  const raw = await AsyncStorage.getItem(readStorageKey(userId));
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === "string")
      : [];
  } catch {
    return [];
  }
};

export const getUnreadCount = async (
  userId: number,
  notifications: NotificationItem[],
): Promise<number> => {
  const readIds = await getReadIds(userId);
  const readSet = new Set(readIds);
  return notifications.filter((notification) => !readSet.has(notification.id))
    .length;
};

export const markNotificationsAsRead = async (
  userId: number,
  notifications: NotificationItem[],
): Promise<void> => {
  const readIds = await getReadIds(userId);
  const merged = new Set(readIds);

  notifications.forEach((notification) => {
    merged.add(notification.id);
  });

  await AsyncStorage.setItem(
    readStorageKey(userId),
    JSON.stringify(Array.from(merged)),
  );
};
