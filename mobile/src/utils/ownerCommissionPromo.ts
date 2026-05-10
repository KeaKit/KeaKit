export function formatOwnerCommissionPromoBadgeLabel(promoCode?: string | null): string | null {
  const normalizedCode = promoCode?.trim();
  return normalizedCode ? `Descuento comisión: ${normalizedCode}` : null;
}
