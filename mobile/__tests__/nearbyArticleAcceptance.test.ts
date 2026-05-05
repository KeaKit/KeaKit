/**
 * Tests de aceptación para CU-ARRENDATARIO-10: Ampliación de búsqueda geográfica
 *
 * Estos tests verifican los criterios de aceptación del caso de uso desde la
 * perspectiva del arrendatario, simulando el flujo completo del usuario:
 *
 * Flujo principal:
 *   1. Acceder a la creación de un kit
 *   2. Pulsar el botón "Añadir artículo"
 *   3. Pulsar sobre el icono de globo terráqueo para activar búsqueda ampliada
 *
 * Reglas de negocio cubiertas:
 * - RN-KIT-24: Seleccionar ciudad destino para ver objetos disponibles en esa ubicación
 * - RN-KIT-25: Filtrar productos por categoría, ciudad y texto
 * - RN-ENT-04: Tarifa fija de envío courier €9.99 por kit
 */

// Mock react-native Platform (articleService imports it)
jest.mock("react-native", () => ({ Platform: { OS: "web" } }));

import {
  getNearbyArticles,
  getArticlesForMap,
} from "../src/services/articleService";
import {
  fetchCities,
  fetchCountries,
  getCityCoordinates,
} from "../src/services/cityService";

const mockFetch = jest.fn() as jest.Mock;
(globalThis as unknown as { fetch: jest.Mock }).fetch = mockFetch;

const TOKEN = "test-jwt-token";
const PLATFORM_COURIER_PRICE = 9.99;

// Datos de prueba que simulan un escenario real
const mockArticleCordoba = {
  id: 1,
  itemType: "ARTICLE",
  title: "Taladro percutor Bosch",
  description: "Taladro profesional con maletín",
  city: "Córdoba",
  pricePerMonth: 35.0,
  availableFrom: "2026-05-01",
  availableUntil: "2026-08-31",
  category: "Bricolaje",
  totalUnits: 2,
  ownerId: 10,
  ownerName: "Carlos López",
  status: "AVAILABLE" as const,
  imageUrl: "http://img.test/taladro-bosch.jpg",
  cityLat: 37.8882,
  cityLng: -4.7794,
  distanceKm: 130.5,
};

const mockArticleHuelva = {
  id: 2,
  itemType: "ARTICLE",
  title: "Sierra circular Makita",
  description: "Sierra potente para madera",
  city: "Huelva",
  pricePerMonth: 45.0,
  availableFrom: "2026-05-15",
  availableUntil: "2026-07-15",
  category: "Bricolaje",
  totalUnits: 1,
  ownerId: 15,
  ownerName: "Ana Martín",
  status: "AVAILABLE" as const,
  imageUrl: "http://img.test/sierra-makita.jpg",
  cityLat: 37.2614,
  cityLng: -6.9447,
  distanceKm: 90.2,
};

const mockArticleMadrid = {
  id: 3,
  itemType: "ARTICLE",
  title: "Lijadora orbital",
  description: "Lijadora eléctrica compacta",
  city: "Madrid",
  pricePerMonth: 20.0,
  availableFrom: "2026-06-01",
  availableUntil: "2026-09-30",
  category: "Bricolaje",
  totalUnits: 1,
  ownerId: 20,
  ownerName: "Pedro Ruiz",
  status: "AVAILABLE" as const,
  imageUrl: null,
  cityLat: 40.4168,
  cityLng: -3.7038,
  distanceKm: 390.0,
};

beforeEach(() => {
  mockFetch.mockReset();
});

// ==========================================
// ESCENARIO 1: Búsqueda geográfica ampliada desde Sevilla
// ==========================================

describe("CU-ARRENDATARIO-10: Flujo principal — búsqueda ampliada", () => {
  it("AC-01: El arrendatario busca artículos en ciudades cercanas a Sevilla", async () => {
    // DADO: Un arrendatario creando un kit en Sevilla que activa la búsqueda ampliada
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve([mockArticleCordoba, mockArticleHuelva]),
    });

    // CUANDO: Busca artículos cercanos con radio por defecto (150km)
    const result = await getNearbyArticles("Sevilla", "España", TOKEN);

    // ENTONCES: Recibe artículos de ciudades cercanas con info de distancia
    expect(result).toHaveLength(2);
    expect(result.every((a) => a.distanceKm > 0)).toBe(true);
    expect(result.every((a) => a.status === "AVAILABLE")).toBe(true);
  });

  it("AC-02: Los artículos cercanos muestran la distancia al destino", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve([mockArticleCordoba]),
    });

    const result = await getNearbyArticles("Sevilla", "España", TOKEN);

    // El arrendatario debe poder ver la distancia para evaluar costes extra
    expect(result[0].distanceKm).toBe(130.5);
    expect(result[0].city).toBe("Córdoba");
    expect(result[0].title).toBe("Taladro percutor Bosch");
  });

  it("AC-03: El arrendatario puede ampliar el radio de búsqueda", async () => {
    // Con radio de 500km, también se ven artículos de Madrid
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve([
          mockArticleCordoba,
          mockArticleHuelva,
          mockArticleMadrid,
        ]),
    });

    const result = await getNearbyArticles("Sevilla", "España", TOKEN, 500);

    expect(result).toHaveLength(3);
    expect(result.find((a) => a.city === "Madrid")).toBeDefined();

    // Verificar que el endpoint recibe el radio ampliado
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain("radiusKm=500");
  });

  it("AC-04: No se muestran artículos de la ciudad de destino", async () => {
    // Nearby solo devuelve artículos de OTRAS ciudades
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve([mockArticleCordoba]),
    });

    const result = await getNearbyArticles("Sevilla", "España", TOKEN);

    // Ningún artículo debe ser de Sevilla (ciudad destino)
    expect(result.every((a) => a.city !== "Sevilla")).toBe(true);
  });

  it("AC-05: Si no hay artículos cercanos, se devuelve lista vacía", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve([]),
    });

    const result = await getNearbyArticles("Sevilla", "España", TOKEN, 10);

    expect(result).toEqual([]);
  });
});

// ==========================================
// ESCENARIO 2: Selección de ciudad destino (RN-KIT-24)
// ==========================================

describe("CU-ARRENDATARIO-10: Selección de ciudad destino (RN-KIT-24)", () => {
  it("AC-06: El arrendatario puede obtener la lista de países disponibles", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(["España", "Francia", "Portugal"]),
    });

    const countries = await fetchCountries();

    expect(countries).toContain("España");
    expect(countries.length).toBeGreaterThan(0);
  });

  it("AC-07: El arrendatario puede obtener las ciudades de un país", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve([
          "Barcelona",
          "Córdoba",
          "Madrid",
          "Sevilla",
          "Valencia",
        ]),
    });

    const cities = await fetchCities("España");

    expect(cities).toContain("Sevilla");
    expect(cities).toContain("Madrid");
  });

  it("AC-08: El arrendatario puede obtener coordenadas de la ciudad destino", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ lat: 37.3886, lng: -5.9823 }),
    });

    const coords = await getCityCoordinates("Sevilla", "España");

    expect(coords).not.toBeNull();
    expect(coords?.lat).toBeCloseTo(37.3886, 2);
    expect(coords?.lng).toBeCloseTo(-5.9823, 2);
  });

  it("AC-09: Se gestiona correctamente una ciudad inexistente", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    const coords = await getCityCoordinates("CiudadFantasma", "España");

    expect(coords).toBeNull();
  });
});

// ==========================================
// ESCENARIO 3: Visualización en mapa
// ==========================================

describe("CU-ARRENDATARIO-10: Visualización de artículos en mapa", () => {
  it("AC-10: Se pueden obtener artículos con coordenadas para el mapa", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve([mockArticleCordoba, mockArticleMadrid]),
    });

    const result = await getArticlesForMap(TOKEN, "España");

    expect(result).toHaveLength(2);
    result.forEach((article) => {
      expect(article.cityLat).toBeDefined();
      expect(article.cityLng).toBeDefined();
      expect(typeof article.cityLat).toBe("number");
      expect(typeof article.cityLng).toBe("number");
    });
  });

  it("AC-11: Los artículos incluyen información suficiente para popups del mapa", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve([mockArticleCordoba]),
    });

    const result = await getArticlesForMap(TOKEN, "España");
    const article = result[0];

    // Datos necesarios para el popup del mapa
    expect(article.title).toBeDefined();
    expect(article.city).toBeDefined();
    expect(article.pricePerMonth).toBeDefined();
    expect(article.ownerName).toBeDefined();
    expect(article.distanceKm).toBeDefined();
  });
});

// ==========================================
// ESCENARIO 4: Costes extra por envío (RN-ENT-04)
// ==========================================

describe("CU-ARRENDATARIO-10: Aviso de costes extra por envío (RN-ENT-04)", () => {
  it("AC-12: El coste de courier es fijo en €9.99 por kit", () => {
    expect(PLATFORM_COURIER_PRICE).toBe(9.99);
  });

  it("AC-13: El arrendatario tiene acceso al precio y distancia para decidir", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve([mockArticleCordoba, mockArticleHuelva]),
    });

    const articles = await getNearbyArticles("Sevilla", "España", TOKEN);

    // Cada artículo tiene la información para que el usuario evalúe costes
    articles.forEach((article) => {
      expect(article.pricePerMonth).toBeGreaterThan(0);
      expect(article.distanceKm).toBeGreaterThan(0);
      expect(article.city).toBeDefined();
    });

    // El artículo más cercano tiene menor distancia
    const sorted = [...articles].sort((a, b) => a.distanceKm - b.distanceKm);
    expect(sorted[0].city).toBe("Huelva"); // 90.2 km
    expect(sorted[1].city).toBe("Córdoba"); // 130.5 km
  });

  it("AC-14: Se puede calcular el coste total incluyendo envío de artículos de otra ciudad", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve([mockArticleCordoba]),
    });

    const articles = await getNearbyArticles("Sevilla", "España", TOKEN);
    const selectedArticle = articles[0];

    // Simulación del cálculo de coste total con envío
    const subtotal = selectedArticle.pricePerMonth;
    const guarantee = subtotal * 0.2; // RN-PRE-04: 20% de fianza
    const courier = PLATFORM_COURIER_PRICE; // RN-ENT-04: €9.99
    const total = subtotal + guarantee + courier;

    expect(subtotal).toBe(35.0);
    expect(guarantee).toBe(7.0);
    expect(courier).toBe(9.99);
    expect(total).toBeCloseTo(51.99, 2);
  });
});

// ==========================================
// ESCENARIO 5: Manejo de errores
// ==========================================

describe("CU-ARRENDATARIO-10: Manejo de errores", () => {
  it("AC-15: Error de red al buscar artículos cercanos se propaga correctamente", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    await expect(
      getNearbyArticles("Sevilla", "España", TOKEN),
    ).rejects.toThrow("Network error");
  });

  it("AC-16: Error del servidor al obtener mapa se propaga correctamente", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      headers: { get: () => "text/plain" },
      json: () => Promise.reject(new Error("not json")),
      text: () => Promise.resolve("Internal Server Error"),
    });

    await expect(getArticlesForMap(TOKEN, "España")).rejects.toThrow();
  });

  it("AC-17: Error al obtener ciudades notifica al usuario", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    await expect(fetchCities("España")).rejects.toThrow(
      "No se pudieron cargar las ciudades",
    );
  });

  it("AC-18: Error al obtener países notifica al usuario", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    await expect(fetchCountries()).rejects.toThrow(
      "Error al obtener los países",
    );
  });
});

// ==========================================
// Cobertura adicional de flujos
// ==========================================

describe("CU-ARRENDATARIO-10: Flujos adicionales", () => {
  it("AC-19: El mapa funciona sin especificar un país", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve([mockArticleCordoba, mockArticleMadrid]),
    });

    const result = await getArticlesForMap(TOKEN);

    expect(result).toHaveLength(2);
    const [url] = mockFetch.mock.calls[0];
    expect(url).not.toContain("country=");
  });

  it("AC-20: Los artículos del mapa incluyen imageUrl (puede ser null)", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve([mockArticleCordoba, mockArticleMadrid]),
    });

    const result = await getArticlesForMap(TOKEN, "España");

    // mockArticleCordoba tiene imageUrl, mockArticleMadrid tiene null
    expect(result[0].imageUrl).toBe("http://img.test/taladro-bosch.jpg");
    expect(result[1].imageUrl).toBeNull();
  });

  it("AC-21: Error JSON del servidor al buscar artículos cercanos se parsea correctamente", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      headers: { get: () => "application/json" },
      json: () => Promise.resolve({ message: "Radio no válido" }),
      text: () => Promise.resolve(""),
    });

    await expect(
      getNearbyArticles("Sevilla", "España", TOKEN),
    ).rejects.toThrow("Radio no válido");
  });

  it("AC-22: Se puede buscar artículos cercanos con radio mínimo", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve([]),
    });

    const result = await getNearbyArticles("Sevilla", "España", TOKEN, 1);

    expect(result).toEqual([]);
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain("radiusKm=1");
  });

  it("AC-23: Cada artículo cercano tiene un itemType definido", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve([mockArticleCordoba, mockArticleHuelva]),
    });

    const result = await getNearbyArticles("Sevilla", "España", TOKEN);

    result.forEach((article) => {
      expect(article.itemType).toBe("ARTICLE");
    });
  });

  it("AC-24: Las coordenadas de una ciudad se obtienen con los parámetros correctos", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ lat: 40.4168, lng: -3.7038 }),
    });

    const coords = await getCityCoordinates("Madrid", "España");

    expect(coords).toEqual({ lat: 40.4168, lng: -3.7038 });
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain("city=Madrid");
    expect(url).toContain("country=Espa");
  });

  it("AC-25: Error de red en coordenadas se propaga correctamente", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Timeout"));

    await expect(
      getCityCoordinates("Sevilla", "España"),
    ).rejects.toThrow("Timeout");
  });
});
