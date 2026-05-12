import { buildSelectableKitMapProducts } from "../../src/utils/kitAvailability";

describe("integracion frontend lista/mapa para disponibilidad de kits", () => {
  const startDate = new Date("2026-05-10T00:00:00.000Z");
  const endDate = new Date("2026-05-12T00:00:00.000Z");

  it("no pasa al mapa articulos que el catalogo filtrado no permite seleccionar", () => {
    const catalogProducts = [
      {
        id: 1,
        status: "AVAILABLE",
        totalUnits: 1,
        availableFrom: "2026-05-01",
        availableUntil: "2026-05-31",
      },
      {
        id: 2,
        status: "RENTED",
        totalUnits: 0,
        availableFrom: "2026-05-01",
        availableUntil: "2026-05-31",
      },
      {
        id: 3,
        status: "AVAILABLE",
        totalUnits: 1,
        availableFrom: "2026-05-01",
        availableUntil: "2026-05-11",
      },
    ];

    const mapProducts = [
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
        id: 3,
        title: "Sierra fuera de rango",
        city: "Sevilla",
        ownerName: "Marta",
        pricePerMonth: 20,
        cityLat: 37.3891,
        cityLng: -5.9845,
      },
    ];

    const articlesForMap = buildSelectableKitMapProducts(
      mapProducts,
      catalogProducts,
      { startDate, endDate },
    );

    expect(articlesForMap.map((article) => article.id)).toEqual([1]);
    expect(articlesForMap[0]).toEqual(
      expect.objectContaining({
        id: 1,
        title: "Taladro disponible",
        city: "Sevilla",
        ownerName: "Ana",
        isAvailableForDates: true,
      }),
    );
  });

  it("excluye articulos que existen solo en el endpoint de mapa pero no en el catalogo filtrado", () => {
    const articlesForMap = buildSelectableKitMapProducts(
      [
        {
          id: 999,
          title: "Articulo stale del mapa",
          city: "Sevilla",
          ownerName: "Ana",
          pricePerMonth: 15,
        },
      ],
      [],
      { startDate, endDate },
    );

    expect(articlesForMap).toEqual([]);
  });
});
