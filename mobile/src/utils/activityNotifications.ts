import { ActivityNotificationType } from "../types";

export const formatNotificationDateTime = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("es-ES", {
    dateStyle: "short",
    timeStyle: "short",
  });
};

export const getActivityNotificationTitle = (
  type: ActivityNotificationType,
  relatedArticleId?: number | null,
): string => {
  switch (type) {
    case "ITEM_RENTED":
      return "Objeto alquilado";
    case "RETURN_REMINDER":
      return "Fin de alquiler";
    case "DEMAND_ALERT":
      return relatedArticleId === null || relatedArticleId === undefined
        ? "Interés en tu servicio"
        : "Interés en tu artículo";
    case "ARTICLE_AVAILABLE":
      return "Artículo disponible";
    default:
      return "Notificación";
  }
};
