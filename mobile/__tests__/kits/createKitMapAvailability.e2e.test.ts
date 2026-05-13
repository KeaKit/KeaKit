jest.mock("react-native", () => ({ Platform: { OS: "web" } }));

import { getArticlesForMap } from "../../src/services/articleService";
import { filterItemsForKit } from "../../src/services/kitService";
import { buildSelectableKitMapProducts } from "../../src/utils/kitAvailability";

const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
globalThis.fetch = mockFetch;

const TOKEN = "tenant-token";
const startDate = new Date("2026-05-10T00:00:00.000Z");
const endDate = new Date("2026-05-12T00:00:00.000Z");

const jsonResponse = (body: unknown, status = 200) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    headers: {
      get: (name: string) =>
        name.toLowerCase() === "content-type" ? "application/json" : null,
    },
    text: () => Promise.resolve(JSON.stringify(body)),
    json: () => Promise.resolve(body),
  }) as Response;

describe("E2E ligero CU-ARRENDATARIO-01 lista/mapa", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("reproduce el flujo y evita que el mapa muestre un item no disponible en el rango", async () => {
    mockFetch
      .mockResolvedValueOnce(
        jsonResponse({
          content: [
            {
              id: 1,
              itemType: "ARTICLE",
              title: "Taladro disponible",
              status: "AVAILABLE",
              totalUnits: 1,
              availableFrom: "2026-05-01",
              availableUntil: "2026-05-31",
              city: "Sevilla",
              pricePerMonth: 15,
            },
            {
              id: 2,
              itemType: "ARTICLE",
              title: "Taladro ya reservado",
              status: "RENTED",
              totalUnits: 0,
              availableFrom: "2026-05-01",
              availableUntil: "2026-05-31",
              city: "Sevilla",
              pricePerMonth: 15,
            },
          ],
          page: 0,
          size: 100,
          totalElements: 2,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse([
          {
            id: 1,
            title: "Taladro disponible",
            city: "Sevilla",
            ownerName: "Ana",
            pricePerMonth: 15,
            cityLat: 37.3891,
            cityLng: -5.9845,
          },
          {
            id: 2,
            title: "Taladro ya reservado",
            city: "Sevilla",
            ownerName: "Luis",
            pricePerMonth: 15,
            cityLat: 37.3891,
            cityLng: -5.9845,
          },
          {
            id: 999,
            title: "Articulo presente solo en mapa",
            city: "Sevilla",
            ownerName: "Marta",
            pricePerMonth: 20,
            cityLat: 37.3891,
            cityLng: -5.9845,
          },
        ]),
      );

    const catalogResponse = await filterItemsForKit(
      {
        country: undefined,
        city: "Sevilla",
        page: 0,
        size: 100,
        startDate: "2026-05-10",
        endDate: "2026-05-12",
      },
      TOKEN,
    );
    const mapResponse = await getArticlesForMap(TOKEN, "España", true);

    const mapArticles = buildSelectableKitMapProducts(
      mapResponse,
      catalogResponse.content,
      {
        startDate,
        endDate,
        showOnlyMyCity: true,
        userCity: "Sevilla",
      },
    );

    expect(mockFetch).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("/api/items/filter-for-kit"),
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining('"city":"Sevilla"'),
      }),
    );
    expect(mockFetch).toHaveBeenNthCalledWith(
      1,
      expect.any(String),
      expect.objectContaining({
        body: expect.stringContaining('"startDate":"2026-05-10"'),
      }),
    );
    expect(mockFetch).toHaveBeenNthCalledWith(
      1,
      expect.any(String),
      expect.objectContaining({
        body: expect.stringContaining('"endDate":"2026-05-12"'),
      }),
    );

    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("/api/article/map"),
      expect.objectContaining({ method: "GET" }),
    );
    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("country=Espa"),
      expect.any(Object),
    );
    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("includeRented=true"),
      expect.any(Object),
    );

    expect(mapArticles.map((article) => article.id)).toEqual([1]);
    expect(mapArticles).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 2 }),
        expect.objectContaining({ id: 999 }),
      ]),
    );
  });
});
