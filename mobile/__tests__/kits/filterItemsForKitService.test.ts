import { filterItemsForKit } from "../../src/services/kitService";

const mockFetch = jest.fn() as jest.Mock;
(globalThis as any).fetch = mockFetch;

const TOKEN = "tenant-token";

const jsonResponse = (body: unknown, status = 200) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    headers: {
      get: (name: string) =>
        name.toLowerCase() === "content-type" ? "application/json" : null,
    },
    text: () => Promise.resolve(JSON.stringify(body)),
  }) as Response;

describe("filterItemsForKit service", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("envia las fechas del kit al endpoint de catalogo filtrado", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        content: [],
        page: 0,
        size: 100,
        totalElements: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
      }),
    );

    await filterItemsForKit(
      {
        city: "Sevilla",
        page: 0,
        size: 100,
        startDate: "2026-05-10",
        endDate: "2026-05-12",
      },
      TOKEN,
    );

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain("/api/items/filter-for-kit");
    expect(options.method).toBe("POST");
    expect(options.headers.Authorization).toBe(`Bearer ${TOKEN}`);
    expect(JSON.parse(options.body)).toEqual(
      expect.objectContaining({
        city: "Sevilla",
        page: 0,
        size: 100,
        startDate: "2026-05-10",
        endDate: "2026-05-12",
      }),
    );
  });

  it("conserva totalUnits 0 cuando backend informa que no hay unidades disponibles", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        content: [
          {
            id: 2,
            itemType: "ARTICLE",
            title: "Taladro ya reservado",
            status: "RENTED",
            totalUnits: 0,
          },
        ],
        page: 0,
        size: 100,
        totalElements: 1,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      }),
    );

    const response = await filterItemsForKit(
      { page: 0, size: 100, startDate: "2026-05-10", endDate: "2026-05-12" },
      TOKEN,
    );

    expect(response.content[0]).toEqual(
      expect.objectContaining({
        id: 2,
        status: "RENTED",
        totalUnits: 0,
      }),
    );
  });
});
