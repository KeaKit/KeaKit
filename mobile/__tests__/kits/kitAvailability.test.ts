import {
  buildSelectableKitMapProducts,
  filterMapProductsByCatalogAvailability,
  isCatalogProductAvailableForKitRange,
} from "../../src/utils/kitAvailability";

const startDate = new Date("2026-05-10T00:00:00.000Z");
const endDate = new Date("2026-05-12T00:00:00.000Z");

describe("isCatalogProductAvailableForKitRange", () => {
  it("marca como disponible un producto con estado rentable, unidades y rango compatible", () => {
    const result = isCatalogProductAvailableForKitRange(
      {
        id: 1,
        status: "AVAILABLE",
        totalUnits: 2,
        availableFrom: "2026-05-01",
        availableUntil: "2026-05-31",
      },
      startDate,
      endDate,
    );

    expect(result).toBe(true);
  });

  it("marca como no disponible un producto sin unidades efectivas", () => {
    const result = isCatalogProductAvailableForKitRange(
      {
        id: 2,
        status: "AVAILABLE",
        totalUnits: 0,
        availableFrom: "2026-05-01",
        availableUntil: "2026-05-31",
      },
      startDate,
      endDate,
    );

    expect(result).toBe(false);
  });

  it("marca como no disponible un servicio activo sin unidades efectivas", () => {
    const result = isCatalogProductAvailableForKitRange(
      {
        id: 20,
        status: "ACTIVE",
        totalUnits: 0,
        availableFrom: "2026-05-01",
        availableUntil: "2026-05-31",
      },
      startDate,
      endDate,
    );

    expect(result).toBe(false);
  });

  it("permite un producto rentable sin fechas propias cuando el catalogo ya lo considera disponible", () => {
    const result = isCatalogProductAvailableForKitRange(
      {
        id: 21,
        status: "AVAILABLE",
        totalUnits: 1,
      },
      startDate,
      endDate,
    );

    expect(result).toBe(true);
  });

  it("marca como no disponible un producto alquilado aunque tenga fechas compatibles", () => {
    const result = isCatalogProductAvailableForKitRange(
      {
        id: 3,
        status: "RENTED",
        totalUnits: 1,
        availableFrom: "2026-05-01",
        availableUntil: "2026-05-31",
      },
      startDate,
      endDate,
    );

    expect(result).toBe(false);
  });

  it("marca como no disponible un producto cuyo rango no cubre la reserva solicitada", () => {
    const result = isCatalogProductAvailableForKitRange(
      {
        id: 4,
        status: "AVAILABLE",
        totalUnits: 1,
        availableFrom: "2026-05-01",
        availableUntil: "2026-05-11",
      },
      startDate,
      endDate,
    );

    expect(result).toBe(false);
  });
});

describe("filterMapProductsByCatalogAvailability", () => {
  const mapProducts = [
    { id: 1, city: "Sevilla", title: "Taladro" },
    { id: 2, city: "Sevilla", title: "Sierra" },
    { id: 3, city: "Sevilla", title: "Cámara" },
    { id: 4, city: "Madrid", title: "Bicicleta" },
    { id: 999, city: "Sevilla", title: "Solo en mapa" },
  ];

  const catalogProducts = [
    {
      id: 1,
      status: "AVAILABLE",
      totalUnits: 2,
      availableFrom: "2026-05-01",
      availableUntil: "2026-05-31",
    },
    {
      id: 2,
      status: "AVAILABLE",
      totalUnits: 0,
      availableFrom: "2026-05-01",
      availableUntil: "2026-05-31",
    },
    {
      id: 3,
      status: "RENTED",
      totalUnits: 1,
      availableFrom: "2026-05-01",
      availableUntil: "2026-05-31",
    },
    {
      id: 4,
      status: "AVAILABLE",
      totalUnits: 1,
      availableFrom: "2026-05-01",
      availableUntil: "2026-05-31",
    },
  ];

  it("solo deja en el mapa productos presentes y disponibles en el catalogo filtrado", () => {
    const result = filterMapProductsByCatalogAvailability(
      mapProducts,
      catalogProducts,
      { startDate, endDate },
    );

    expect(result.map((product) => product.id)).toEqual([1, 4]);
  });

  it("mantiene el filtro de ciudad sobre los productos disponibles", () => {
    const result = filterMapProductsByCatalogAvailability(
      mapProducts,
      catalogProducts,
      {
        startDate,
        endDate,
        showOnlyMyCity: true,
        userCity: "sevilla",
      },
    );

    expect(result.map((product) => product.id)).toEqual([1]);
  });
});

describe("buildSelectableKitMapProducts", () => {
  it("prepara solo los marcadores seleccionables que debe recibir ArticleMapView", () => {
    const result = buildSelectableKitMapProducts(
      [
        {
          id: 1,
          city: "Sevilla",
          title: "Taladro",
          ownerName: "Ana",
          pricePerMonth: 25,
        },
        {
          id: 2,
          city: "Sevilla",
          title: "Sierra",
          ownerName: null,
          pricePerMonth: 30,
        },
      ],
      [
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
      ],
      { startDate, endDate },
    );

    expect(result).toEqual([
      expect.objectContaining({
        id: 1,
        city: "Sevilla",
        ownerName: "Ana",
        isAvailableForDates: true,
      }),
    ]);
  });
});
