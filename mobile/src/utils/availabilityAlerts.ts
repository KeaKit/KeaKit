export const shouldRequestAvailabilityNotification = (
  itemType: string,
): boolean => itemType === "ARTICLE";

export const getAvailabilityAlertSuccessMessage = (_itemType: string): string =>
  "El propietario ha sido notificado de tu interés.";
