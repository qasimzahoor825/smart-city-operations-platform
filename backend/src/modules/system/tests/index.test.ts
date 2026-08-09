import { systemService } from "../service";
import { systemRepository } from "../repository";

describe("systemService", () => {
  beforeEach(() => {
    systemRepository.reset();
  });

  it("reports health with UP status and db ping", async () => {
    const health = await systemService.health();
    expect(health.status).toBe("UP");
    expect(health.dbPing).toBe(true);
    expect(health.uptimeSeconds).toBeGreaterThanOrEqual(0);
    expect(health.service).toContain("SmartCity OS");
  });

  it("returns the seeded platform settings", async () => {
    const settings = await systemService.getSettings();
    expect(settings.platformName).toBe("SmartCity OS");
    expect(settings.maintenanceMode).toBe(false);
    expect(settings.allowRegistrations).toBe(true);
  });

  it("updates boolean settings", async () => {
    const updated = await systemService.updateSettings({
      maintenanceMode: true,
      allowPublicComplaints: false,
      notificationsEnabled: false,
    });
    expect(updated.maintenanceMode).toBe(true);
    expect(updated.allowPublicComplaints).toBe(false);
    expect(updated.notificationsEnabled).toBe(false);
    expect(updated.updatedAt).toBeTruthy();
  });

  it("updates the platform name", async () => {
    const updated = await systemService.updateSettings({ platformName: "SmartCity OS v2" });
    expect(updated.platformName).toBe("SmartCity OS v2");
  });

  it("returns in-memory metrics", async () => {
    const metrics = await systemService.getMetrics();
    expect(metrics.totalRequests).toBeGreaterThan(0);
    expect(metrics.apiCalls).toBeGreaterThan(0);
    expect(metrics.activeUsers).toBeGreaterThan(0);
  });

  it("increments counters when requests are recorded", async () => {
    const before = await systemService.getMetrics();
    systemRepository.recordRequest();
    const after = await systemService.getMetrics();
    expect(after.totalRequests).toBe(before.totalRequests + 1);
    expect(after.apiCalls).toBe(before.apiCalls + 1);
  });
});