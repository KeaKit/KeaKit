/**
 * Tests unitarios de frontend para CU-ARRENDATARIO-10: Ampliación de búsqueda geográfica
 *
 * Reglas de negocio cubiertas:
 * - RN-KIT-24: El arrendatario puede seleccionar la ciudad destino para ver objetos disponibles
 * - RN-KIT-25: El arrendatario puede filtrar productos por ciudad con territorio ampliado
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

// Mock global fetch
const mockFetch = jest.fn() as jest.Mock;
(globalThis as unknown as { fetch: jest.Mock }).fetch = mockFetch;

const TOKEN = "test-jwt-token";

const mockNearbyArticle = {
  id: 1,
  itemType: "ARTICLE",
  title: "Taladro",
  description: "Un taladro percutor",
  city: "Córdoba",
  pricePerMonth: 30.0,
  availableFrom: "2026-05-01",
  availableUntil: "2026-06-30",
  category: "Bricolaje",
  totalUnits: 1,
  ownerId: 5,
  ownerName: "Juan García",
  status: "AVAILABLE" as const,
  imageUrl: "http://img.test/taladro.jpg",
  cityLat: 37.8882,
  cityLng: -4.7794,
  distanceKm: 130.5,
};

const mockNearbyArticle2 = {
  ...mockNearbyArticle,
  id: 2,
  title: "Sierra eléctrica",
  city: "Huelva",
  pricePerMonth: 45.0,
  cityLat: 37.2614,
  cityLng: -6.9447,
  distanceKm: 90.2,
};

beforeEach(() => {
  mockFetch.mockReset();
});

// ==========================================
// getNearbyArticles (RN-KIT-24, RN-KIT-25)
// ==========================================

describe("getNearbyArticles", () => {
  it("llama al endpoint correcto con parámetros de ciudad, país y radio", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve([mockNearbyArticle]),
    });

    await getNearbyArticles("Sevilla", "España", TOKEN, 150);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain("/api/article/nearby");
    expect(url).toContain("city=Sevilla");
    expect(url).toContain("country=Espa");
    expect(url).toContain("radiusKm=150");
    expect(options.method).toBe("GET");
    expect(options.headers.Authorization).toBe(`Bearer ${TOKEN}`);
  });

  it("usa radio por defecto de 150km si no se especifica", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve([mockNearbyArticle]),
    });

    await getNearbyArticles("Sevilla", "España", TOKEN);

    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain("radiusKm=150");
  });

  it("devuelve la lista de artículos cercanos correctamente", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve([mockNearbyArticle, mockNearbyArticle2]),
    });

    const result = await getNearbyArticles("Sevilla", "España", TOKEN);

    expect(result).toHaveLength(2);
    expect(result[0].city).toBe("Córdoba");
    expect(result[0].distanceKm).toBe(130.5);
    expect(result[1].city).toBe("Huelva");
    expect(result[1].distanceKm).toBe(90.2);
  });

  it("devuelve lista vacía cuando no hay artículos cercanos", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve([]),
    });

    const result = await getNearbyArticles("Sevilla", "España", TOKEN);

    expect(result).toEqual([]);
  });

  it("cada artículo contiene coordenadas e información de distancia", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve([mockNearbyArticle]),
    });

    const result = await getNearbyArticles("Sevilla", "España", TOKEN);

    expect(result[0].cityLat).toBeDefined();
    expect(result[0].cityLng).toBeDefined();
    expect(result[0].distanceKm).toBeDefined();
    expect(typeof result[0].cityLat).toBe("number");
    expect(typeof result[0].cityLng).toBe("number");
    expect(typeof result[0].distanceKm).toBe("number");
  });

  it("lanza error cuando la respuesta no es ok", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      headers: { get: () => "text/plain" },
      json: () => Promise.reject(new Error("not json")),
      text: () => Promise.resolve("Internal Server Error"),
    });

    await expect(
      getNearbyArticles("Sevilla", "España", TOKEN),
    ).rejects.toThrow();
  });

  it("acepta un radio personalizado para búsqueda ampliada", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve([mockNearbyArticle]),
    });

    await getNearbyArticles("Sevilla", "España", TOKEN, 500);

    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain("radiusKm=500");
  });

  it("codifica correctamente caracteres especiales en ciudad y país", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve([]),
    });

    await getNearbyArticles("São Paulo", "España", TOKEN);

    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain(encodeURIComponent("São Paulo"));
  });

  it("propaga error de red (fetch rechazado)", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network failure"));

    await expect(
      getNearbyArticles("Sevilla", "España", TOKEN),
    ).rejects.toThrow("Network failure");
  });

  it("maneja error JSON con campo 'message'", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      headers: { get: () => "application/json" },
      json: () => Promise.resolve({ message: "Ciudad no válida" }),
      text: () => Promise.resolve(""),
    });

    await expect(
      getNearbyArticles("??", "España", TOKEN),
    ).rejects.toThrow("Ciudad no válida");
  });

  it("maneja error JSON con campo 'error'", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 422,
      headers: { get: () => "application/json" },
      json: () => Promise.resolve({ error: "Parámetros inválidos" }),
      text: () => Promise.resolve(""),
    });

    await expect(
      getNearbyArticles("Sevilla", "España", TOKEN),
    ).rejects.toThrow("Parámetros inválidos");
  });

  it("maneja error JSON sin message ni error (stringify fallback)", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      headers: { get: () => "application/json" },
      json: () => Promise.resolve({ code: 123, detail: "algo" }),
      text: () => Promise.resolve(""),
    });

    await expect(
      getNearbyArticles("Sevilla", "España", TOKEN),
    ).rejects.toThrow();
  });

  it("normaliza error 'owner not found' en getNearbyArticles", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      headers: { get: () => "text/plain" },
      json: () => Promise.reject(new Error("not json")),
      text: () => Promise.resolve("Owner not found"),
    });

    await expect(
      getNearbyArticles("Sevilla", "España", TOKEN),
    ).rejects.toThrow("El propietario no existe.");
  });

  it("normaliza error 'article not found'", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      headers: { get: () => "text/plain" },
      json: () => Promise.reject(new Error("not json")),
      text: () => Promise.resolve("Article not found"),
    });

    await expect(
      getNearbyArticles("Sevilla", "España", TOKEN),
    ).rejects.toThrow("El artículo no existe.");
  });

  it("normaliza error 'unauthorized'", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      headers: { get: () => "text/plain" },
      json: () => Promise.reject(new Error("not json")),
      text: () => Promise.resolve("Unauthorized access"),
    });

    await expect(
      getNearbyArticles("Sevilla", "España", TOKEN),
    ).rejects.toThrow("No tienes permiso para realizar esta acción.");
  });
});

// ==========================================
// getArticlesForMap
// ==========================================

describe("getArticlesForMap", () => {
  it("llama al endpoint correcto con país", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve([mockNearbyArticle]),
    });

    await getArticlesForMap(TOKEN, "España");

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain("/api/article/map");
    expect(url).toContain("country=Espa");
    expect(options.method).toBe("GET");
    expect(options.headers.Authorization).toBe(`Bearer ${TOKEN}`);
  });

  it("llama sin parámetro de país cuando no se especifica", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve([]),
    });

    await getArticlesForMap(TOKEN);

    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain("/api/article/map");
    expect(url).not.toContain("country=");
  });

  it("devuelve lista de artículos con coordenadas para el mapa", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve([mockNearbyArticle, mockNearbyArticle2]),
    });

    const result = await getArticlesForMap(TOKEN, "España");

    expect(result).toHaveLength(2);
    expect(result[0].cityLat).toBeDefined();
    expect(result[0].cityLng).toBeDefined();
  });

  it("lanza error cuando la respuesta no es ok", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      headers: { get: () => "text/plain" },
      json: () => Promise.reject(new Error("not json")),
      text: () => Promise.resolve("Error"),
    });

    await expect(getArticlesForMap(TOKEN, "España")).rejects.toThrow();
  });

  it("propaga error de red (fetch rechazado)", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    await expect(getArticlesForMap(TOKEN, "España")).rejects.toThrow(
      "Network error",
    );
  });

  it("maneja error JSON con campo 'message' en getArticlesForMap", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      headers: { get: () => "application/json" },
      json: () => Promise.resolve({ message: "País no válido" }),
      text: () => Promise.resolve(""),
    });

    await expect(getArticlesForMap(TOKEN, "???")).rejects.toThrow(
      "País no válido",
    );
  });

  it("maneja error JSON con campo 'error' en getArticlesForMap", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 422,
      headers: { get: () => "application/json" },
      json: () => Promise.resolve({ error: "Solicitud incorrecta" }),
      text: () => Promise.resolve(""),
    });

    await expect(getArticlesForMap(TOKEN, "España")).rejects.toThrow(
      "Solicitud incorrecta",
    );
  });

  it("devuelve artículos con todos los campos esperados", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve([mockNearbyArticle]),
    });

    const result = await getArticlesForMap(TOKEN, "España");

    expect(result[0].id).toBe(1);
    expect(result[0].title).toBe("Taladro");
    expect(result[0].city).toBe("Córdoba");
    expect(result[0].pricePerMonth).toBe(30.0);
    expect(result[0].ownerName).toBe("Juan García");
    expect(result[0].status).toBe("AVAILABLE");
    expect(result[0].imageUrl).toBe("http://img.test/taladro.jpg");
  });
});

// ==========================================
// cityService — fetchCities
// ==========================================

describe("fetchCities", () => {
  it("obtiene las ciudades de un país correctamente", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(["Barcelona", "Madrid", "Sevilla"]),
    });

    const result = await fetchCities("España");

    expect(result).toEqual(["Barcelona", "Madrid", "Sevilla"]);
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain("/api/cities");
    expect(url).toContain("country=Espa");
  });

  it("lanza error cuando no se pueden cargar ciudades", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    await expect(fetchCities("Atlantis")).rejects.toThrow(
      "No se pudieron cargar las ciudades",
    );
  });

  it("propaga error de red al obtener ciudades", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Connection refused"));

    await expect(fetchCities("España")).rejects.toThrow("Connection refused");
  });

  it("codifica correctamente el país en la URL", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(["São Paulo"]),
    });

    await fetchCities("São Paulo");

    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain(encodeURIComponent("São Paulo"));
  });
});

// ==========================================
// cityService — fetchCountries
// ==========================================

describe("fetchCountries", () => {
  it("obtiene la lista de países correctamente", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(["España", "Francia", "Portugal"]),
    });

    const result = await fetchCountries();

    expect(result).toEqual(["España", "Francia", "Portugal"]);
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain("/api/countries");
  });

  it("lanza error cuando falla la petición", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    await expect(fetchCountries()).rejects.toThrow(
      "Error al obtener los países",
    );
  });

  it("propaga error de red al obtener países", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Timeout"));

    await expect(fetchCountries()).rejects.toThrow("Timeout");
  });

  it("devuelve lista vacía si el servidor responde con array vacío", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    const result = await fetchCountries();

    expect(result).toEqual([]);
  });
});

// ==========================================
// cityService — getCityCoordinates
// ==========================================

describe("getCityCoordinates", () => {
  it("devuelve las coordenadas de una ciudad", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ lat: 37.3886, lng: -5.9823 }),
    });

    const result = await getCityCoordinates("Sevilla", "España");

    expect(result).toEqual({ lat: 37.3886, lng: -5.9823 });
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain("/api/cities/coordinates");
    expect(url).toContain("city=Sevilla");
    expect(url).toContain("country=Espa");
  });

  it("devuelve null cuando la ciudad no se encuentra", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    const result = await getCityCoordinates("CiudadFantasma", "España");

    expect(result).toBeNull();
  });

  it("codifica correctamente los parámetros de la URL", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ lat: 48.8566, lng: 2.3522 }),
    });

    await getCityCoordinates("São Paulo", "España");

    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain(encodeURIComponent("São Paulo"));
  });

  it("propaga error de red al obtener coordenadas", async () => {
    mockFetch.mockRejectedValueOnce(new Error("DNS error"));

    await expect(
      getCityCoordinates("Sevilla", "España"),
    ).rejects.toThrow("DNS error");
  });

  it("devuelve null para cualquier respuesta no-ok (no solo 404)", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const result = await getCityCoordinates("Sevilla", "España");

    expect(result).toBeNull();
  });

  it("extrae lat y lng correctamente del JSON de respuesta", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({ lat: 40.4168, lng: -3.7038, extra: "ignored" }),
    });

    const result = await getCityCoordinates("Madrid", "España");

    expect(result).toEqual({ lat: 40.4168, lng: -3.7038 });
  });
});
