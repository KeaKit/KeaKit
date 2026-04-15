







type CatalogProduct = {
  id: number;
  title: string;
  pricePerMonth: number;
  status: "AVAILABLE" | "RENTED" | "INACTIVE" | string;
  category?: string;
  city?: string;
  ownerId: number;
  totalUnits: number;
};

type AdvancedFilters = {
  status: string;
  minPrice: string;
  maxPrice: string;
};

function computeAdvancedFilteredProducts(
  catalog: CatalogProduct[],
  filters: AdvancedFilters,
): CatalogProduct[] {
  const minPrice = filters.minPrice.trim() === "" ? undefined : Number(filters.minPrice);
  const maxPrice = filters.maxPrice.trim() === "" ? undefined : Number(filters.maxPrice);

  return catalog.filter((product) => {
    if (filters.status && filters.status !== "ALL" && product.status !== filters.status) {
      return false;
    }

    if (minPrice !== undefined && product.pricePerMonth < minPrice) {
      return false;
    }

    if (maxPrice !== undefined && product.pricePerMonth > maxPrice) {
      return false;
    }

    return true;
  });
}

function clearAdvancedFilters(): AdvancedFilters {
  return {
    status: "ALL",
    minPrice: "",
    maxPrice: "",
  };
}

describe("computeAdvancedFilteredProducts", () => {
  const catalog: CatalogProduct[] = [
    { id: 1, title: "Taladro", pricePerMonth: 25, status: "AVAILABLE", category: "Herramientas", city: "Sevilla", ownerId: 10, totalUnits: 3 },
    { id: 2, title: "Sierra", pricePerMonth: 30, status: "AVAILABLE", category: "Herramientas", city: "Madrid", ownerId: 10, totalUnits: 2 },
    { id: 3, title: "Bicicleta", pricePerMonth: 50, status: "RENTED", category: "Transporte", city: "Sevilla", ownerId: 11, totalUnits: 1 },
    { id: 4, title: "Cámara", pricePerMonth: 40, status: "INACTIVE", category: "Electrónica", city: "Sevilla", ownerId: 12, totalUnits: 1 },
  ];

  it("filtra por estado", () => {
    const result = computeAdvancedFilteredProducts(catalog, {
      status: "AVAILABLE",
      minPrice: "",
      maxPrice: "",
    });

    expect(result.map((product) => product.id)).toEqual([1, 2]);
  });

  it("filtra por precio mínimo", () => {
    const result = computeAdvancedFilteredProducts(catalog, {
      status: "ALL",
      minPrice: "40",
      maxPrice: "",
    });

    expect(result.map((product) => product.id)).toEqual([3, 4]);
  });

  it("filtra por precio máximo", () => {
    const result = computeAdvancedFilteredProducts(catalog, {
      status: "ALL",
      minPrice: "",
      maxPrice: "30",
    });

    expect(result.map((product) => product.id)).toEqual([1, 2]);
  });

  it("combina estado, precio mínimo y precio máximo", () => {
    const result = computeAdvancedFilteredProducts(catalog, {
      status: "AVAILABLE",
      minPrice: "26",
      maxPrice: "35",
    });

    expect(result.map((product) => product.id)).toEqual([2]);
  });

  it("devuelve todos los productos si no hay filtros activos", () => {
    const result = computeAdvancedFilteredProducts(catalog, clearAdvancedFilters());

    expect(result.map((product) => product.id)).toEqual([1, 2, 3, 4]);
  });
});

describe("clearAdvancedFilters", () => {
  it("restablece los filtros avanzados a sus valores por defecto", () => {
    expect(clearAdvancedFilters()).toEqual({
      status: "ALL",
      minPrice: "",
      maxPrice: "",
    });
  });
});
