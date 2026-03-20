/**
 * Tests para CU-ARRENDATARIO-07: Modificar kits predeterminados
 * HU-ARRENDATARIO-07: Añadir un objeto al kit
 * HU-ARRENDATARIO-09: Eliminar objetos del kit
 *
 * Reglas de negocio cubiertas:
 * - RN-KIT-11: El kit debe tener al menos un ítem seleccionado
 * - RN-KIT-12: Cada selección debe incluir un ID de ítem válido
 * - RN-KIT-22: El arrendatario puede modificar su selección
 */

import { addItemToKit, removeItemFromKit, getKit, getAllKits } from "../src/services/kitService";

// Mock global fetch
const mockFetch = jest.fn() as jest.Mock;
(globalThis as any).fetch = mockFetch;

const TOKEN = "test-jwt-token";
const USER_ID = 1;
const KIT_ID = 10;
const ITEM_ID = 100;

const mockKitResponse = {
  id: KIT_ID,
  name: "Kit Test",
  country: "España",
  city: "Sevilla",
  status: "DRAFT",
  items: [
    { itemId: ITEM_ID, quantity: 1, pricePerMonth: 25.0, name: "Taladro", category: "Herramientas", imageUrl: null },
  ],
  itemIds: [ITEM_ID],
  totalSelectedItems: 1,
  subtotalPrice: 25.0,
  guaranteePrice: 5.0,
  platformFee: 5.0,
  totalPrice: 35.0,
};

beforeEach(() => {
  mockFetch.mockReset();
});

// ==========================================
// addItemToKit
// ==========================================

describe("addItemToKit", () => {
  it("llama al endpoint correcto con método POST", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: () => "application/json" },
      text: () => Promise.resolve(JSON.stringify(mockKitResponse)),
    });

    await addItemToKit(KIT_ID, ITEM_ID, USER_ID, TOKEN);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain(`/api/kits/${KIT_ID}/items/${ITEM_ID}`);
    expect(url).toContain(`userId=${USER_ID}`);
    expect(options.method).toBe("POST");
    expect(options.headers.Authorization).toBe(`Bearer ${TOKEN}`);
  });

  it("devuelve la respuesta del kit con el item añadido", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: () => "application/json" },
      text: () => Promise.resolve(JSON.stringify(mockKitResponse)),
    });

    const result = await addItemToKit(KIT_ID, ITEM_ID, USER_ID, TOKEN);

    expect(result).toEqual(mockKitResponse);
    expect(result.items).toHaveLength(1);
    expect(result.items[0].itemId).toBe(ITEM_ID);
  });

  it("lanza error cuando el item ya existe en el kit", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      headers: { get: () => "text/plain" },
      text: () => Promise.resolve("This item is already in the kit"),
    });

    await expect(addItemToKit(KIT_ID, ITEM_ID, USER_ID, TOKEN))
      .rejects.toThrow("This item is already in the kit");
  });

  it("lanza error cuando el item no existe (RN-KIT-12)", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      headers: { get: () => "text/plain" },
      text: () => Promise.resolve("Item not found"),
    });

    await expect(addItemToKit(KIT_ID, 999, USER_ID, TOKEN))
      .rejects.toThrow("Item not found");
  });

  it("lanza error cuando el kit no existe", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      headers: { get: () => "text/plain" },
      text: () => Promise.resolve("Kit not found"),
    });

    await expect(addItemToKit(999, ITEM_ID, USER_ID, TOKEN))
      .rejects.toThrow("Kit not found");
  });

  it("lanza error cuando el usuario no existe", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      headers: { get: () => "text/plain" },
      text: () => Promise.resolve("User not found"),
    });

    await expect(addItemToKit(KIT_ID, ITEM_ID, 999, TOKEN))
      .rejects.toThrow("User not found");
  });
});

// ==========================================
// removeItemFromKit
// ==========================================

describe("removeItemFromKit", () => {
  it("llama al endpoint correcto con método DELETE", async () => {
    const responseAfterRemove = { ...mockKitResponse, items: [], itemIds: [], totalSelectedItems: 0 };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: () => "application/json" },
      text: () => Promise.resolve(JSON.stringify(responseAfterRemove)),
    });

    await removeItemFromKit(KIT_ID, ITEM_ID, USER_ID, TOKEN);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain(`/api/kits/${KIT_ID}/items/${ITEM_ID}`);
    expect(url).toContain(`userId=${USER_ID}`);
    expect(options.method).toBe("DELETE");
    expect(options.headers.Authorization).toBe(`Bearer ${TOKEN}`);
  });

  it("devuelve el kit actualizado sin el item eliminado", async () => {
    const remainingItem = { itemId: 101, quantity: 1, pricePerMonth: 30.0, name: "Sierra", category: "Herramientas", imageUrl: null };
    const responseAfterRemove = { ...mockKitResponse, items: [remainingItem], itemIds: [101], totalSelectedItems: 1 };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: () => "application/json" },
      text: () => Promise.resolve(JSON.stringify(responseAfterRemove)),
    });

    const result = await removeItemFromKit(KIT_ID, ITEM_ID, USER_ID, TOKEN);

    expect(result.items).toHaveLength(1);
    expect(result.items[0].itemId).toBe(101);
    expect(result.itemIds).not.toContain(ITEM_ID);
  });

  it("lanza error cuando el kit quedaría vacío (RN-KIT-11)", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      headers: { get: () => "text/plain" },
      text: () => Promise.resolve("A kit cannot be empty. It must contain at least one item."),
    });

    await expect(removeItemFromKit(KIT_ID, ITEM_ID, USER_ID, TOKEN))
      .rejects.toThrow("A kit cannot be empty. It must contain at least one item.");
  });

  it("lanza error cuando el item no está en el kit", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      headers: { get: () => "text/plain" },
      text: () => Promise.resolve("Item is not part of this kit"),
    });

    await expect(removeItemFromKit(KIT_ID, 999, USER_ID, TOKEN))
      .rejects.toThrow("Item is not part of this kit");
  });

  it("lanza error cuando el kit no existe", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      headers: { get: () => "text/plain" },
      text: () => Promise.resolve("Kit not found"),
    });

    await expect(removeItemFromKit(999, ITEM_ID, USER_ID, TOKEN))
      .rejects.toThrow("Kit not found");
  });
});

// ==========================================
// getKit (utilizado por EditDefaultKitScreen para cargar el kit)
// ==========================================

describe("getKit", () => {
  it("obtiene los datos del kit correctamente", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: () => "application/json" },
      text: () => Promise.resolve(JSON.stringify(mockKitResponse)),
    });

    const result = await getKit(KIT_ID, TOKEN);

    expect(result.id).toBe(KIT_ID);
    expect(result.name).toBe("Kit Test");
    expect(result.items).toHaveLength(1);
    expect(mockFetch.mock.calls[0][0]).toContain(`/api/kits/${KIT_ID}`);
  });

  it("lanza error cuando el kit no existe", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      headers: { get: () => "text/plain" },
      text: () => Promise.resolve("Kit not found"),
    });

    await expect(getKit(999, TOKEN)).rejects.toThrow("Kit not found");
  });
});

// ==========================================
// getAllKits (utilizado por DefaultKitsScreen para listar kits predeterminados)
// ==========================================

describe("getAllKits", () => {
  it("obtiene la lista de kits disponibles", async () => {
    const kitsList = [mockKitResponse, { ...mockKitResponse, id: 11, name: "Kit 2" }];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: () => "application/json" },
      text: () => Promise.resolve(JSON.stringify(kitsList)),
    });

    const result = await getAllKits(TOKEN);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe(KIT_ID);
    expect(result[1].name).toBe("Kit 2");
    expect(mockFetch.mock.calls[0][0]).toContain("/api/kits");
  });
});
