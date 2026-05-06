import {
  formatNotificationDateTime,
  getActivityNotificationTitle,
} from "../../src/utils/activityNotifications";

describe("getActivityNotificationTitle", () => {
  // ── DEMAND_ALERT: diferenciación artículo / servicio ─────────────────────

  it('returns "Interés en tu servicio" when relatedArticleId is null', () => {
    expect(getActivityNotificationTitle("DEMAND_ALERT", null)).toBe(
      "Interés en tu servicio",
    );
  });

  it('returns "Interés en tu servicio" when relatedArticleId is undefined', () => {
    expect(getActivityNotificationTitle("DEMAND_ALERT", undefined)).toBe(
      "Interés en tu servicio",
    );
  });

  it('returns "Interés en tu servicio" when called with only DEMAND_ALERT (no second arg)', () => {
    expect(getActivityNotificationTitle("DEMAND_ALERT")).toBe(
      "Interés en tu servicio",
    );
  });

  it('returns "Interés en tu artículo" when relatedArticleId is a number', () => {
    expect(getActivityNotificationTitle("DEMAND_ALERT", 5)).toBe(
      "Interés en tu artículo",
    );
  });

  it('returns "Interés en tu artículo" when relatedArticleId is 0', () => {
    // 0 is a falsy value but is still a valid ID, not null/undefined
    expect(getActivityNotificationTitle("DEMAND_ALERT", 0)).toBe(
      "Interés en tu artículo",
    );
  });

  // ── Otros tipos ───────────────────────────────────────────────────────────

  it('returns "Objeto alquilado" for ITEM_RENTED', () => {
    expect(getActivityNotificationTitle("ITEM_RENTED")).toBe("Objeto alquilado");
  });

  it('returns "Fin de alquiler" for RETURN_REMINDER', () => {
    expect(getActivityNotificationTitle("RETURN_REMINDER")).toBe("Fin de alquiler");
  });

  it('returns "Artículo disponible" for ARTICLE_AVAILABLE', () => {
    expect(getActivityNotificationTitle("ARTICLE_AVAILABLE")).toBe(
      "Artículo disponible",
    );
  });

  it('returns "Notificación" for unknown type', () => {
    expect(
      getActivityNotificationTitle("UNKNOWN_TYPE" as any),
    ).toBe("Notificación");
  });
});

describe("formatNotificationDateTime", () => {
  it("formats a valid ISO date string into es-ES locale", () => {
    const result = formatNotificationDateTime("2026-05-06T10:30:00");
    // Just verify it returns a non-empty string (locale output varies by environment)
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("returns the original value when the date is invalid", () => {
    expect(formatNotificationDateTime("not-a-date")).toBe("not-a-date");
  });

  it("returns the original value when given an empty string", () => {
    expect(formatNotificationDateTime("")).toBe("");
  });
});
