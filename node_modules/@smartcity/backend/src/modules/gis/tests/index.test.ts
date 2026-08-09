import { gisService } from "../service";
import { gisRepository } from "../repository";
import { UserRole } from "@smartcity/common";
import type { Actor } from "../dto";

const officer: Actor = {
  id: "usr_seed_officer1",
  email: "officer@publicworks.gov",
  role: UserRole.OFFICER,
  departmentId: "dept-public-works",
};

describe("gisService", () => {
  beforeEach(() => {
    gisRepository.reset();
  });

  it("lists city layers (traffic, water, zoning)", async () => {
    const layers = await gisService.listLayers();
    expect(layers).toHaveLength(3);
    expect(layers.some((l) => l.id === "layer-traffic")).toBe(true);
    expect(layers.some((l) => l.id === "layer-water")).toBe(true);
    expect(layers.some((l) => l.id === "layer-zoning")).toBe(true);
    expect(layers.every((l) => "color" in l && "visible" in l)).toBe(true);
  });

  it("seeds markers for every map type", async () => {
    const { items } = await gisService.listMarkers();
    for (const type of ["complaint", "asset", "hospital", "police", "emergency"] as const) {
      expect(items.some((m) => m.type === type)).toBe(true);
    }
  });

  it("filters markers by type", async () => {
    const { items } = await gisService.listMarkers({ type: "hospital" });
    expect(items.every((m) => m.type === "hospital")).toBe(true);
  });

  it("filters markers by status", async () => {
    const { items } = await gisService.listMarkers({ status: "OPEN" });
    expect(items.every((m) => m.status === "OPEN")).toBe(true);
  });

  it("filters markers by bounding box [minLon,minLat,maxLon,maxLat]", async () => {
    const bbox: [number, number, number, number] = [74.33, 31.51, 74.36, 31.56];
    const { items } = await gisService.listMarkers({ bbox });
    expect(items.length).toBeGreaterThan(0);
    expect(
      items.every((m) => m.longitude >= bbox[0] && m.longitude <= bbox[2] && m.latitude >= bbox[1] && m.latitude <= bbox[3]),
    ).toBe(true);
  });

  it("creates a marker", async () => {
    const marker = await gisService.createMarker(officer, {
      type: "asset",
      title: "New Pump Station",
      latitude: 31.58,
      longitude: 74.37,
      status: "OPERATIONAL",
    });
    expect(marker.title).toBe("New Pump Station");
    expect(marker.sourceId).toBe(officer.id);
    expect(await gisService.getMarkerById(marker.id)).toBeTruthy();
  });

  it("rejects an invalid marker type", async () => {
    await expect(
      gisService.createMarker(officer, {
        type: "invalid" as never,
        title: "Bad marker",
        latitude: 31.0,
        longitude: 74.0,
      }),
    ).rejects.toThrow("Invalid marker type");
  });

  it("aggregates marker counts by type", async () => {
    const stats = await gisService.markerStats();
    expect(stats.total).toBeGreaterThan(0);
    expect(Object.keys(stats.byType).length).toBe(5);
    expect(stats.byType.hospital).toBeGreaterThan(0);
  });

  it("searches markers by keyword", async () => {
    const results = await gisService.search("hospital");
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((m) => m.type === "hospital")).toBe(true);
    expect(await gisService.search("")).toEqual([]);
  });
});