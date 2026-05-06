export const shouldRequestAvailabilityNotification = (
  itemType: string,
): boolean => itemType === "ARTICLE";

export const getAvailabilityAlertSuccessMessage = (itemType: string): string =>
  shouldRequestAvailabilityNotification(itemType)
    ? "Te avisaremos cuando el artículo vuelva a estar disponible, y el propietario ha sido notificado de tu interés."
    : "El propietario ha sido notificado de tu interés.";
