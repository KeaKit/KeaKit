import { ActivityNotificationType } from "../types";

export const formatNotificationDateTime = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("es-ES", {
    dateStyle: "short",
    timeStyle: "short",
  });
};

const NOTIFICATION_TITLES: Record<ActivityNotificationType, string> = {
  ITEM_RENTED: "Objeto alquilado",
  RETURN_REMINDER: "Fin de alquiler",
  DEMAND_ALERT: "Interés en tu artículo",
  ARTICLE_AVAILABLE: "Artículo disponible",
};

export const getActivityNotificationTitle = (
  type: ActivityNotificationType,
): string => NOTIFICATION_TITLES[type] ?? "Notificación";
