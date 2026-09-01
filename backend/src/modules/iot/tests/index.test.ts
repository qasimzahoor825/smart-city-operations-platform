import { iotService } from "../service";
import { sensors } from "../store";
import { ValidationError } from "../../../core/errors";

describe("iotService", () => {
  it("registers the seeded city sensors", () => {
    expect(sensors.length).toBeGreaterThan(0);
    expect(sensors.some((s) => s.type === "AIR_QUALITY")).toBe(true);
    expect(sensors.some((s) => s.type === "FLOOD_GAUGE")).toBe(true);
    expect(sensors.every((s) => s.id && s.name && s.unit)).toBe(true);
  });

  it("returns exactly one live reading per sensor", () => {
    const live = iotService.live();
    expect(live).toHaveLength(sensors.length);
    const ids = new Set(live.map((r) => r.sensorId));
    expect(ids.size).toBe(sensors.length);
  });

  it("detects anomalies and balances severity buckets", () => {
    const overview = iotService.anomalyOverview();
    expect(overview.total).toBeGreaterThan(0);
    expect(overview.critical + overview.warning).toBe(overview.total);
    expect(overview.activeSensors).toBeGreaterThan(0);
    expect(overview.latest[0].zScore).toBeGreaterThanOrEqual(3);
  });

  it("sorts anomalies newest-first", () => {
    const anomalies = iotService.anomalies(20);
    const dates = anomalies.map((a) => a.detectedAt);
    const sorted = [...dates].sort((a, b) => b.localeCompare(a));
    expect(dates).toEqual(sorted);
  });

  it("returns an anomaly for a live spike on an existing sensor", () => {
    const { anomaly, reading } = iotService.ingest({ sensorId: "sensor-air-02", metricValue: 999 });
    expect(reading.sensorId).toBe("sensor-air-02");
    expect(anomaly).not.toBeNull();
    expect(anomaly?.severity).toBe("CRITICAL");
    expect(anomaly?.zScore).toBeGreaterThan(3);
  });

  it("does not flag in-range readings as anomalous", () => {
    const { anomaly } = iotService.ingest({ sensorId: "sensor-water-01", metricValue: 12.5 });
    expect(anomaly).toBeNull();
  });

  it("rejects ingest for an unknown sensor", () => {
    expect(() => iotService.ingest({ sensorId: "sensor-does-not-exist", metricValue: 1 })).toThrow(ValidationError);
  });
});
