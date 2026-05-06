import {
  getPurchaseDateValidationError,
  isFutureIsoDate,
  PURCHASE_DATE_FUTURE_ERROR,
  PURCHASE_DATE_INVALID_ERROR,
} from '../../src/utils/articlePurchaseDate';

describe('purchase date validation', () => {
  const today = new Date(2026, 4, 6, 15, 30);

  it('permite omitir la fecha de compra', () => {
    expect(getPurchaseDateValidationError('', today)).toBeNull();
    expect(getPurchaseDateValidationError('   ', today)).toBeNull();
  });

  it('permite fechas de compra pasadas o del día actual', () => {
    expect(getPurchaseDateValidationError('2026-05-05', today)).toBeNull();
    expect(getPurchaseDateValidationError('2026-05-06', today)).toBeNull();
  });

  it('rechaza fechas de compra futuras', () => {
    expect(isFutureIsoDate('2026-05-07', today)).toBe(true);
    expect(getPurchaseDateValidationError('2026-05-07', today)).toBe(PURCHASE_DATE_FUTURE_ERROR);
  });

  it('mantiene el error existente para fechas ISO inválidas', () => {
    expect(getPurchaseDateValidationError('2026-02-30', today)).toBe(PURCHASE_DATE_INVALID_ERROR);
    expect(getPurchaseDateValidationError('2026-05-06-extra', today)).toBe(PURCHASE_DATE_INVALID_ERROR);
    expect(getPurchaseDateValidationError('2026-5-6', today)).toBe(PURCHASE_DATE_INVALID_ERROR);
  });
});
