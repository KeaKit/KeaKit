export const PURCHASE_DATE_FUTURE_ERROR = 'La fecha de compra no puede ser posterior a hoy';
export const PURCHASE_DATE_INVALID_ERROR = 'Fecha de compra no válida';

export const isValidIsoDate = (iso: string): boolean => {
  if (!iso) {
    return true;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    return false;
  }
  const parts = iso.split('-');
  const [y, m, d] = parts.map((part) => Number(part));
  if (m < 1 || m > 12) {
    return false;
  }
  if (d < 1 || d > 31) {
    return false;
  }
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
};

export const isFutureIsoDate = (iso: string, today = new Date()): boolean => {
  if (!isValidIsoDate(iso)) {
    return false;
  }
  const [y, m, d] = iso.split('-').map((part) => Number(part));
  const selectedDate = new Date(y, m - 1, d);
  const currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return selectedDate > currentDate;
};

export const getPurchaseDateValidationError = (
  purchaseDate: string,
  today = new Date(),
): string | null => {
  const normalizedPurchaseDate = purchaseDate.trim();
  if (!normalizedPurchaseDate) {
    return null;
  }
  if (!isValidIsoDate(normalizedPurchaseDate)) {
    return PURCHASE_DATE_INVALID_ERROR;
  }
  if (isFutureIsoDate(normalizedPurchaseDate, today)) {
    return PURCHASE_DATE_FUTURE_ERROR;
  }
  return null;
};
