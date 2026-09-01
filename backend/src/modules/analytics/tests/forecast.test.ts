import { analyticsService } from "../service";

describe("analyticsService forecast", () => {
  it("returns a validated forecast envelope for a 7-day horizon", async () => {
    const result = await analyticsService.forecast(7);
    expect(result.days).toBe(7);
    expect(result.windowDays).toBeGreaterThan(0);
    expect(result.method).toBe("linear-regression");
    expect(["increasing", "decreasing", "stable"]).toContain(result.trend);
    expect(result.forecast).toHaveLength(7);
    expect(result.historical.length).toBe(result.windowDays);
    for (const point of result.forecast) {
      expect(point.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(point.predicted).toBeGreaterThanOrEqual(0);
      expect(point.lower).toBeLessThanOrEqual(point.predicted);
      expect(point.upper).toBeGreaterThanOrEqual(point.predicted);
    }
    expect(typeof result.meta.rSquared).toBe("number");
    expect(result.generatedAt).toBeTruthy();
  });

  it("keeps all forecast dates strictly increasing", async () => {
    const result = await analyticsService.forecast(14);
    const dates = result.forecast.map((p) => p.date);
    const sorted = [...dates].sort();
    expect(dates).toEqual(sorted);
    expect(new Set(dates).size).toBe(dates.length);
  });
});
