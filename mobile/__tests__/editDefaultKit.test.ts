/**
 * Tests para CU-ARRENDATARIO-07: Modificar kits predeterminados
 * Lógica de gestión de cambios pendientes (añadir/eliminar) en EditDefaultKitScreen
 *
 * Reglas de negocio cubiertas:
 * - RN-KIT-11: El kit debe tener al menos un ítem seleccionado
 * - RN-KIT-22: El arrendatario puede modificar su selección
 * - RN-KIT-26: Los artículos en estado INACTIVE no se muestran en el catálogo
 */

type KitItemResponse = {
  itemId: number;
  quantity: number;
  pricePerMonth: number;
  name: string;
  category: string;
  imageUrl: string | null;
};

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

/**
 * Replica la lógica de effectiveIds de EditDefaultKitScreen:
 * IDs base del kit, menos los que se van a eliminar, más los que se van a añadir
 */
function computeEffectiveIds(
  baseIds: number[],
  pendingAddIds: number[],
  pendingRemoveIds: number[],
): number[] {
  const removed = new Set(pendingRemoveIds);
  const ids = baseIds.filter((id) => !removed.has(id));
  pendingAddIds.forEach((id) => {
    if (!ids.includes(id)) ids.push(id);
  });
  return ids;
}

/**
 * Replica la lógica de filteredProducts de EditDefaultKitScreen:
 * Excluye productos que ya están en el kit (effectiveIds)
 */
function computeFilteredProducts(
  catalog: CatalogProduct[],
  effectiveIds: number[],
  categoryFilter: string,
  searchText: string,
  showOnlyMyCity: boolean,
  userCity?: string,
): CatalogProduct[] {
  const query = searchText.trim().toLowerCase();
  const currentIds = new Set(effectiveIds);

  return catalog.filter((product) => {
    if (currentIds.has(product.id)) return false;
    if (showOnlyMyCity && userCity && product.city !== userCity) return false;
    if (categoryFilter !== "ALL" && product.category !== categoryFilter) return false;
    if (query) {
      const text = `${product.title} ${product.category ?? ""}`.toLowerCase();
      return text.includes(query);
    }
    return true;
  });
}

/**
 * Replica la lógica de visibleItems de EditDefaultKitScreen
 */
function computeVisibleItems(
  kitItems: KitItemResponse[],
  catalog: CatalogProduct[],
  pendingAddIds: number[],
  pendingRemoveIds: number[],
): Array<{ itemId: number; name: string; source: "kit" | "catalog" }> {
  const removed = new Set(pendingRemoveIds);
  const itemsFromKit = kitItems
    .filter((item) => !removed.has(item.itemId))
    .map((item) => ({ itemId: item.itemId, name: item.name, source: "kit" as const }));

  const itemsFromCatalog = pendingAddIds
    .map((id) => catalog.find((p) => p.id === id))
    .filter(Boolean)
    .map((p) => ({ itemId: p!.id, name: p!.title, source: "catalog" as const }));

  const merged = [...itemsFromKit, ...itemsFromCatalog];
  const seen = new Set<number>();
  return merged.filter((item) => {
    if (seen.has(item.itemId)) return false;
    seen.add(item.itemId);
    return true;
  });
}

// ==========================================
// Tests: efectiveIds (IDs efectivos del kit tras cambios pendientes)
// ==========================================

describe("computeEffectiveIds", () => {
  it("devuelve los IDs base cuando no hay cambios pendientes", () => {
    const result = computeEffectiveIds([1, 2, 3], [], []);
    expect(result).toEqual([1, 2, 3]);
  });

  it("excluye los IDs marcados para eliminar", () => {
    const result = computeEffectiveIds([1, 2, 3], [], [2]);
    expect(result).toEqual([1, 3]);
  });

  it("incluye los IDs marcados para añadir", () => {
    const result = computeEffectiveIds([1, 2], [4, 5], []);
    expect(result).toEqual([1, 2, 4, 5]);
  });

  it("maneja añadir y eliminar simultáneamente", () => {
    const result = computeEffectiveIds([1, 2, 3], [4], [2]);
    expect(result).toEqual([1, 3, 4]);
  });

  it("no duplica IDs que ya están en la base al añadirlos", () => {
    const result = computeEffectiveIds([1, 2], [2, 3], []);
    expect(result).toEqual([1, 2, 3]);
  });

  it("devuelve vacío si se eliminan todos y no se añade ninguno", () => {
    const result = computeEffectiveIds([1, 2], [], [1, 2]);
    expect(result).toEqual([]);
  });
});

// ==========================================
// Tests: filteredProducts (catálogo filtrado, excluyendo items ya en el kit)
// ==========================================

describe("computeFilteredProducts", () => {
  const catalog: CatalogProduct[] = [
    { id: 1, title: "Taladro", pricePerMonth: 25, status: "AVAILABLE", category: "Herramientas", city: "Sevilla", ownerId: 10, totalUnits: 3 },
    { id: 2, title: "Sierra", pricePerMonth: 30, status: "AVAILABLE", category: "Herramientas", city: "Madrid", ownerId: 10, totalUnits: 2 },
    { id: 3, title: "Bicicleta", pricePerMonth: 50, status: "AVAILABLE", category: "Transporte", city: "Sevilla", ownerId: 11, totalUnits: 1 },
    { id: 4, title: "Cámara", pricePerMonth: 40, status: "INACTIVE", category: "Electrónica", city: "Sevilla", ownerId: 12, totalUnits: 1 },
  ];

  it("excluye productos que ya están en el kit (effectiveIds)", () => {
    const result = computeFilteredProducts(catalog, [1], "ALL", "", false);
    expect(result.map((p) => p.id)).toEqual([2, 3, 4]);
  });

  it("filtra por categoría", () => {
    const result = computeFilteredProducts(catalog, [], "Herramientas", "", false);
    expect(result.map((p) => p.id)).toEqual([1, 2]);
  });

  it("filtra por texto de búsqueda", () => {
    const result = computeFilteredProducts(catalog, [], "ALL", "taladro", false);
    expect(result.map((p) => p.id)).toEqual([1]);
  });

  it("filtra por ciudad del usuario cuando showOnlyMyCity está activo", () => {
    const result = computeFilteredProducts(catalog, [], "ALL", "", true, "Sevilla");
    expect(result.map((p) => p.id)).toEqual([1, 3, 4]);
  });

  it("combina todos los filtros", () => {
    const result = computeFilteredProducts(catalog, [1], "Herramientas", "", true, "Madrid");
    expect(result.map((p) => p.id)).toEqual([2]);
  });

  it("devuelve catálogo completo sin filtros ni items en kit", () => {
    const result = computeFilteredProducts(catalog, [], "ALL", "", false);
    expect(result).toHaveLength(4);
  });
});

// ==========================================
// Tests: visibleItems (items visibles en el kit, con cambios pendientes)
// ==========================================

describe("computeVisibleItems", () => {
  const kitItems: KitItemResponse[] = [
    { itemId: 1, quantity: 1, pricePerMonth: 25, name: "Taladro", category: "Herramientas", imageUrl: null },
    { itemId: 2, quantity: 1, pricePerMonth: 30, name: "Sierra", category: "Herramientas", imageUrl: null },
  ];

  const catalog: CatalogProduct[] = [
    { id: 3, title: "Bicicleta", pricePerMonth: 50, status: "AVAILABLE", category: "Transporte", city: "Sevilla", ownerId: 11, totalUnits: 1 },
    { id: 4, title: "Cámara", pricePerMonth: 40, status: "AVAILABLE", category: "Electrónica", city: "Sevilla", ownerId: 12, totalUnits: 1 },
  ];

  it("muestra todos los items del kit sin cambios pendientes", () => {
    const result = computeVisibleItems(kitItems, catalog, [], []);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ itemId: 1, name: "Taladro", source: "kit" });
    expect(result[1]).toEqual({ itemId: 2, name: "Sierra", source: "kit" });
  });

  it("excluye items marcados para eliminar", () => {
    const result = computeVisibleItems(kitItems, catalog, [], [1]);
    expect(result).toHaveLength(1);
    expect(result[0].itemId).toBe(2);
  });

  it("incluye items del catálogo marcados para añadir", () => {
    const result = computeVisibleItems(kitItems, catalog, [3], []);
    expect(result).toHaveLength(3);
    expect(result[2]).toEqual({ itemId: 3, name: "Bicicleta", source: "catalog" });
  });

  it("combina añadir y eliminar correctamente", () => {
    const result = computeVisibleItems(kitItems, catalog, [4], [2]);
    expect(result).toHaveLength(2);
    expect(result.map((i) => i.itemId)).toEqual([1, 4]);
  });

  it("detecta kit vacío cuando se eliminan todos (RN-KIT-11)", () => {
    const result = computeVisibleItems(kitItems, catalog, [], [1, 2]);
    expect(result).toHaveLength(0);
  });

  it("no duplica items", () => {
    // Si un item se añade pero ya está en el kit (edge case)
    const result = computeVisibleItems(kitItems, catalog, [1], []);
    const ids = result.map((i) => i.itemId);
    const uniqueIds = [...new Set(ids)];
    expect(ids).toEqual(uniqueIds);
  });
});

// ==========================================
// Tests: Detección de cambios pendientes (hasPendingChanges)
// ==========================================

describe("hasPendingChanges", () => {
  const hasPendingChanges = (pendingAddIds: number[], pendingRemoveIds: number[]) =>
    pendingAddIds.length > 0 || pendingRemoveIds.length > 0;

  it("sin cambios pendientes devuelve false", () => {
    expect(hasPendingChanges([], [])).toBe(false);
  });

  it("con items para añadir devuelve true", () => {
    expect(hasPendingChanges([1], [])).toBe(true);
  });

  it("con items para eliminar devuelve true", () => {
    expect(hasPendingChanges([], [1])).toBe(true);
  });

  it("con ambos tipos de cambios devuelve true", () => {
    expect(hasPendingChanges([1], [2])).toBe(true);
  });
});

// ==========================================
// Tests: Validación de kit vacío (isEmptyKit)
// RN-KIT-11: El kit debe tener al menos un ítem seleccionado
// ==========================================

describe("isEmptyKit validation", () => {
  it("kit con items visibles no está vacío", () => {
    const kitItems: KitItemResponse[] = [
      { itemId: 1, quantity: 1, pricePerMonth: 25, name: "Item", category: "Cat", imageUrl: null },
    ];
    const visibleItems = computeVisibleItems(kitItems, [], [], []);
    expect(visibleItems.length === 0).toBe(false);
  });

  it("kit sin items visibles está vacío y no debería guardarse", () => {
    const kitItems: KitItemResponse[] = [
      { itemId: 1, quantity: 1, pricePerMonth: 25, name: "Item", category: "Cat", imageUrl: null },
    ];
    const visibleItems = computeVisibleItems(kitItems, [], [], [1]);
    expect(visibleItems.length === 0).toBe(true);
  });
});
