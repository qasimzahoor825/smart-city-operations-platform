import { assetService } from "../service";
import { assetRepository } from "../repository";
import { AssetCategory, AssetStatus } from "@prisma/client";
import { UserRole } from "@smartcity/common";
import type { Actor } from "../dto";

const officer: Actor = {
  id: "usr_seed_officer1",
  email: "officer@publicworks.gov",
  role: UserRole.OFFICER,
  departmentId: "dept-public-works",
};

const citizen: Actor = {
  id: "usr_seed_citizen1",
  email: "citizen@smartcity.gov",
  role: UserRole.CITIZEN,
};

describe("assetService", () => {
  beforeEach(() => {
    assetRepository.reset();
  });

  it("creates an asset with defaults", async () => {
    const asset = await assetService.create(officer, {
      name: "Hydrant A12",
      department: "dept-water",
      category: AssetCategory.WATER,
    });
    expect(asset.category).toBe(AssetCategory.WATER);
    expect(asset.status).toBe(AssetStatus.OPERATIONAL);
    expect(asset.lastInspectionAt).toBeNull();
  });

  it("lists, filters and paginates assets", async () => {
    const result = await assetService.list({ category: AssetCategory.ROAD, page: 1, limit: 10 });
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items.every((a) => a.category === AssetCategory.ROAD)).toBe(true);
  });

  it("supports full-text search", async () => {
    const result = await assetService.list({ search: "Transformer" });
    expect(result.items.length).toBe(1);
    expect(result.items[0].name).toContain("Transformer");
  });

  it("updates asset status and records a note", async () => {
    const asset = await assetService.getById("ast_seed_001");
    const updated = await assetService.updateStatus(
      asset.id,
      officer,
      { status: AssetStatus.UNDER_MAINTENANCE, note: "Deck resurfacing" },
    );
    expect(updated.status).toBe(AssetStatus.UNDER_MAINTENANCE);
    expect(updated.lastStatusNote).toBe("Deck resurfacing");
  });

  it("rejects citizens managing assets", async () => {
    await expect(
      assetService.updateStatus("ast_seed_001", citizen, { status: AssetStatus.OUT_OF_SERVICE }),
    ).rejects.toThrow("Only staff");
  });

  it("records an inspection and schedules the next one", async () => {
    const inspection = await assetService.createInspection(
      "ast_seed_001",
      officer,
      { status: "PASSED", findings: "No defects found" },
    );
    const updated = await assetService.getById("ast_seed_001");
    expect(inspection.assetId).toBe("ast_seed_001");
    expect(inspection.inspectedBy).toBe(officer.email);
    expect(updated.lastInspectionAt).toBeTruthy();
    expect(updated.nextInspectionAt).toBeTruthy();
  });

  it("returns the latest inspection per asset", async () => {
    await assetService.createInspection("ast_seed_001", officer, {
      status: "PASSED",
      findings: "Routine inspection",
    });
    const latest = await assetService.latestInspection("ast_seed_001");
    expect(latest).toBeTruthy();
    expect(latest?.assetId).toBe("ast_seed_001");
    expect(latest?.findings).toBe("Routine inspection");
  });

  it("returns null when no inspections exist", async () => {
    expect(await assetService.latestInspection("ast_seed_003")).toBeNull();
  });

  it("deletes an asset and its inspections", async () => {
    await assetService.createInspection("ast_seed_001", officer, {
      status: "PASSED",
      findings: "To be cleaned up",
    });
    await assetService.remove("ast_seed_001", officer);
    await expect(assetService.getById("ast_seed_001")).rejects.toThrow("not found");
    expect((await assetService.listInspections("ast_seed_001")).length).toBe(0);
  });

  it("aggregates asset statistics", async () => {
    const stats = await assetService.stats();
    expect(stats.total).toBeGreaterThan(0);
    expect(Object.keys(stats.byStatus).length).toBe(8);
    expect(Object.keys(stats.byCategory).length).toBe(9);
  });
});