import { filterItemsForKit } from "../../src/services/kitService";

const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
globalThis.fetch = mockFetch;

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

const getFetchCall = (index: number): [RequestInfo | URL, RequestInit] => {
  const call = mockFetch.mock.calls[index];
  expect(call).toBeDefined();

  const [url, options] = call;
  expect(options).toBeDefined();

  return [url, options as RequestInit];
};

const parseJsonBody = (body: BodyInit | null | undefined): unknown => {
  expect(typeof body).toBe("string");
  return JSON.parse(body as string);
};

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
    const [url, options] = getFetchCall(0);
    expect(String(url)).toContain("/api/items/filter-for-kit");
    expect(options.method).toBe("POST");
    expect((options.headers as { Authorization?: string }).Authorization).toBe(
      `Bearer ${TOKEN}`,
    );
    expect(parseJsonBody(options.body)).toEqual(
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
