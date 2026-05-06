import {
  getAvailabilityAlertSuccessMessage,
  shouldRequestAvailabilityNotification,
} from "../../src/utils/availabilityAlerts";

describe("availability alert flow by item type", () => {
  it("requests availability notification for ARTICLE", () => {
    expect(shouldRequestAvailabilityNotification("ARTICLE")).toBe(true);
  });

  it("does not request availability notification for SERVICE", () => {
    expect(shouldRequestAvailabilityNotification("SERVICE")).toBe(false);
  });

  it("returns same success message for ARTICLE", () => {
    expect(getAvailabilityAlertSuccessMessage("ARTICLE")).toBe(
      "El propietario ha sido notificado de tu interés.",
    );
  });

  it("returns same success message for SERVICE", () => {
    expect(getAvailabilityAlertSuccessMessage("SERVICE")).toBe(
      "El propietario ha sido notificado de tu interés.",
    );
  });
});

// ── Tests para fechas fuera de rango ─────────────────────────────────────────

describe("CREATE_DEMAND_ALERT URL con fechas fuera de rango", () => {
  const BASE_URL = "http://localhost:8080";

  const buildUrl = (
    articleId: number,
    requesterId: number,
    startDate?: string,
    endDate?: string,
  ) => {
    let url = `${BASE_URL}/api/notifications/demand-alert?articleId=${articleId}&requesterId=${requesterId}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    return url;
  };

  it("builds URL without dates when none provided", () => {
    const url = buildUrl(5, 20);
    expect(url).toBe(
      `${BASE_URL}/api/notifications/demand-alert?articleId=5&requesterId=20`,
    );
    expect(url).not.toContain("startDate");
    expect(url).not.toContain("endDate");
  });

  it("builds URL including dates when provided (in-range scenario)", () => {
    const url = buildUrl(5, 20, "2026-06-01", "2026-06-10");
    expect(url).toContain("startDate=2026-06-01");
    expect(url).toContain("endDate=2026-06-10");
  });

  it("builds URL including dates when they are out of item availability range", () => {
    // Fechas en 2030 para un artículo disponible solo hasta 2026 → el backend decidirá
    const url = buildUrl(5, 20, "2030-03-01", "2030-03-15");
    expect(url).toContain("startDate=2030-03-01");
    expect(url).toContain("endDate=2030-03-15");
  });

  it("only appends startDate param when endDate is omitted", () => {
    const url = buildUrl(5, 20, "2030-03-01", undefined);
    expect(url).toContain("startDate=2030-03-01");
    expect(url).not.toContain("endDate");
  });
});
