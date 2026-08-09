import { reportService } from "../service";
import { reportRepository } from "../repository";
import { authRepository, seedUsers } from "../../auth/repository";
import { departmentRepository, seedDepartments } from "../../departments/repository";
import { assetRepository } from "../../assets/repository";
import { complaintRepository } from "../../complaints/repository";

describe("reportService", () => {
  beforeEach(() => {
    authRepository.users.seed(seedUsers);
    departmentRepository.departments.seed(seedDepartments);
    assetRepository.reset();
    complaintRepository.reset();
    reportRepository.reset();
  });

  it("builds an overview with seeded platform counts", async () => {
    const overview = await reportService.overview();
    expect(overview.departments).toBeGreaterThan(0);
    expect(overview.officers).toBeGreaterThan(0);
    expect(overview.assets).toBeGreaterThan(0);
    expect(overview.complaints).toBeGreaterThan(0);
    expect(overview.emergencies).toBeGreaterThan(0);
    expect(overview.appointments).toBeGreaterThan(0);
  });

  it("computes complaint analytics", async () => {
    const analytics = await reportService.analytics();
    expect(analytics.totalComplaints).toBeGreaterThan(0);
    expect(analytics.resolvedComplaints).toBeGreaterThan(0);
    expect(analytics.resolutionRate).toBeGreaterThan(0);
    expect(analytics.resolutionRate).toBeLessThanOrEqual(100);
    expect(analytics.avgResolutionHours).toBeGreaterThanOrEqual(0);
    expect(analytics.slaBreachCount).toBeGreaterThanOrEqual(0);
    expect(analytics.byDepartment.length).toBeGreaterThan(0);
  });

  it("exposes a per-department breakdown", async () => {
    const analytics = await reportService.analytics();
    const breakdown = analytics.byDepartment.find((d) => d.departmentId === "dept-public-works");
    expect(breakdown).toBeTruthy();
    expect((breakdown?.total ?? 0)).toBeGreaterThan(0);
  });

  it("exports JSON data as an object", async () => {
    const report = await reportService.exportReport("json");
    expect(report.format).toBe("json");
    expect(typeof report.data).toBe("object");
    expect(report.data).toHaveProperty("overview");
    expect(report.data).toHaveProperty("analytics");
  });

  it("exports CSV data as a string", async () => {
    const report = await reportService.exportReport("csv");
    expect(report.format).toBe("csv");
    expect(typeof report.data).toBe("string");
    const csv = report.data as string;
    expect(csv).toContain("OVERVIEW");
    expect(csv).toContain("ANALYTICS");
    expect(csv).toContain("BY_DEPARTMENT");
    expect(csv.split("\n").length).toBeGreaterThan(10);
  });
});