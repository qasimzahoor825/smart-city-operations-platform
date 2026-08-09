import { slaService } from "../service";
import { slaRepository } from "../repository";

describe("slaService", () => {
  beforeEach(() => {
    slaRepository.rules.seed([
      {
        id: "sla_low",
        name: "Low priority",
        priority: "LOW",
        category: null,
        departmentId: null,
        hours: 72,
        active: true,
      },
      {
        id: "sla_critical",
        name: "Critical priority",
        priority: "CRITICAL",
        category: null,
        departmentId: null,
        hours: 4,
        active: true,
      },
      {
        id: "sla_pw_road",
        name: "Public Works road repairs",
        priority: "HIGH",
        category: "ROAD",
        departmentId: "dept-public-works",
        hours: 18,
        active: true,
      },
      {
        id: "sla_disabled",
        name: "Disabled rule",
        priority: "HIGH",
        category: null,
        departmentId: null,
        hours: 2,
        active: false,
      },
    ]);
  });

  it("resolves hours for a priority-only match", async () => {
    const hours = await slaService.resolveHours({ priority: "LOW", category: "ROAD", departmentId: null });
    expect(hours).toBe(72);
  });

  it("prefers department+category rules over priority-only defaults", async () => {
    const hours = await slaService.resolveHours({
      priority: "HIGH",
      category: "ROAD",
      departmentId: "dept-public-works",
    });
    expect(hours).toBe(18);
  });

  it("ignores inactive rules", async () => {
    const hours = await slaService.resolveHours({ priority: "HIGH", category: null, departmentId: null });
    expect(hours).toBe(24); // built-in default, not the disabled 2h rule
  });

  it("falls back to built-in defaults when no rule matches", async () => {
    const hours = await slaService.resolveHours({ priority: "MEDIUM", category: "WATER", departmentId: "ghost" });
    expect(hours).toBe(48);
  });

  it("lists rules sorted by priority", async () => {
    const rules = await slaService.list();
    expect(rules[0].priority).toBe("CRITICAL");
    expect(rules).toHaveLength(4);
  });

  it("upserts a new rule", async () => {
    const created = await slaService.upsert({
      id: "sla_test",
      name: "Test rule",
      priority: "LOW",
      category: "PARK",
      departmentId: "dept-municipal",
      hours: 100,
      active: true,
    });
    expect(created.id).toBe("sla_test");
    const found = slaRepository.rules.findById("sla_test");
    expect(found?.hours).toBe(100);
  });

  it("updates an existing rule on upsert", async () => {
    const updated = await slaService.upsert({
      id: "sla_critical",
      name: "Critical priority (tuned)",
      priority: "CRITICAL",
      category: null,
      departmentId: null,
      hours: 2,
      active: true,
    });
    expect(updated.hours).toBe(2);
    expect(slaRepository.rules.findById("sla_critical")?.hours).toBe(2);
  });
});