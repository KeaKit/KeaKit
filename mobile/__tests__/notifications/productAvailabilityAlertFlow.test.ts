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

  it("returns article success message for ARTICLE", () => {
    expect(getAvailabilityAlertSuccessMessage("ARTICLE")).toBe(
      "Te avisaremos cuando el artículo vuelva a estar disponible, y el propietario ha sido notificado de tu interés.",
    );
  });

  it("returns service success message for SERVICE", () => {
    expect(getAvailabilityAlertSuccessMessage("SERVICE")).toBe(
      "El propietario ha sido notificado de tu interés.",
    );
  });
});
