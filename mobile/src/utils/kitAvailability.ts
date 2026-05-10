export type KitAvailabilityProduct = {
  id: number;
  status?: string | null;
  totalUnits?: number | null;
  availableFrom?: string | null;
  availableUntil?: string | null;
};

export type KitMapProduct = {
  id: number;
  city?: string | null;
};

export type KitSelectableMapProduct<TProduct extends KitMapProduct> = Omit<
  TProduct,
  "city" | "ownerName"
> & {
  city?: string;
  ownerName?: string;
  isAvailableForDates: true;
};

const RENTABLE_STATUSES = new Set(["AVAILABLE", "ACTIVE"]);

const toStartOfDay = (value?: Date | string | null): Date | null => {
  if (!value) return null;

  const date = value instanceof Date ? new Date(value) : new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  date.setHours(0, 0, 0, 0);
  return date;
};

export const isRentableStatus = (status?: string | null): boolean =>
  RENTABLE_STATUSES.has(status ?? "");

export const hasAvailableUnits = (totalUnits?: number | null): boolean => {
  if (totalUnits === undefined || totalUnits === null) return true;

  const units = Number(totalUnits);
  return Number.isFinite(units) && units > 0;
};

export const isCatalogProductAvailableForKitRange = (
  product: KitAvailabilityProduct,
  startDate?: Date | null,
  endDate?: Date | null,
): boolean => {
  if (!isRentableStatus(product.status)) return false;
  if (!hasAvailableUnits(product.totalUnits)) return false;

  const requestStart = toStartOfDay(startDate);
  const requestEnd = toStartOfDay(endDate);
  if (!requestStart || !requestEnd) return true;

  if (!product.availableFrom || !product.availableUntil) {
    return true;
  }

  const productFrom = toStartOfDay(product.availableFrom);
  const productUntil = toStartOfDay(product.availableUntil);
  if (!productFrom || !productUntil) return false;

  return requestStart >= productFrom && requestEnd <= productUntil;
};

export const buildAvailableCatalogProductIdSet = (
  products: KitAvailabilityProduct[],
  startDate?: Date | null,
  endDate?: Date | null,
): Set<number> =>
  new Set(
    products
      .filter((product) =>
        isCatalogProductAvailableForKitRange(product, startDate, endDate),
      )
      .map((product) => product.id),
  );

export const isSameCity = (
  productCity?: string | null,
  userCity?: string | null,
): boolean =>
  !!productCity &&
  !!userCity &&
  productCity.trim().toLowerCase() === userCity.trim().toLowerCase();

export const filterMapProductsByCatalogAvailability = <
  TProduct extends KitMapProduct,
>(
  mapProducts: TProduct[],
  catalogProducts: KitAvailabilityProduct[],
  options: {
    startDate?: Date | null;
    endDate?: Date | null;
    showOnlyMyCity?: boolean;
    userCity?: string;
  } = {},
): TProduct[] => {
  const availableCatalogIds = buildAvailableCatalogProductIdSet(
    catalogProducts,
    options.startDate,
    options.endDate,
  );

  return mapProducts.filter((product) => {
    if (!availableCatalogIds.has(product.id)) return false;

    if (options.showOnlyMyCity && options.userCity) {
      return isSameCity(product.city, options.userCity);
    }

    return true;
  });
};

export const buildSelectableKitMapProducts = <
  TProduct extends KitMapProduct & { ownerName?: string | null },
>(
  mapProducts: TProduct[],
  catalogProducts: KitAvailabilityProduct[],
  options: {
    startDate?: Date | null;
    endDate?: Date | null;
    showOnlyMyCity?: boolean;
    userCity?: string;
  } = {},
): KitSelectableMapProduct<TProduct>[] =>
  filterMapProductsByCatalogAvailability(
    mapProducts,
    catalogProducts,
    options,
  ).map((product) => ({
    ...product,
    city: product.city ?? undefined,
    ownerName: product.ownerName ?? undefined,
    isAvailableForDates: true,
  }));
