import { departmentService } from "../service";
import { departmentRepository } from "../repository";
import { authRepository, seedUsers } from "../../auth/repository";
import { UserRole } from "@smartcity/common";

describe("departmentService", () => {
  beforeEach(() => {
    const nowIso = new Date().toISOString();
    authRepository.users.seed(seedUsers);
    departmentRepository.departments.seed([
{
        id: "dept_parks",
        name: "Parks",
        code: "PK",
        description: "City parks",
        managerId: null,
        members: [
          {
            userId: "usr_seed_officer1",
            fullName: "Bilal Ahmed",
            email: "officer@publicworks.gov",
            role: UserRole.OFFICER,
            joinedAt: nowIso,
          },
        ],
        createdAt: nowIso,
        updatedAt: nowIso,
      },
    ]);
    departmentRepository.complaints.seed([
      {
        id: "dc1",
        departmentId: "dept_parks",
        citizenId: "usr_seed_citizen1",
        title: "Broken bench",
        category: "PARK",
        status: "RESOLVED",
        createdAt: nowIso,
      },
      {
        id: "dc2",
        departmentId: "dept_parks",
        citizenId: "usr_seed_citizen1",
        title: "Overgrown grass",
        category: "PARK",
        status: "IN_PROGRESS",
        createdAt: nowIso,
      },
    ]);
  });

  it("lists departments", async () => {
    const { items, pagination } = await departmentService.list();
    expect(items).toHaveLength(1);
    expect(items[0].code).toBe("PK");
    expect(pagination.total).toBe(1);
  });

  it("gets a department by id", async () => {
    const department = await departmentService.getById("dept_parks");
    expect(department.name).toBe("Parks");
    expect(department.members).toHaveLength(1);
  });

  it("creates a department but rejects a duplicate code", async () => {
    const created = await departmentService.create({ name: "Waste", code: "waste" });
    expect(created.code).toBe("WASTE");
    await expect(departmentService.create({ name: "Other Parks", code: "PK" })).rejects.toThrow(
      "already in use",
    );
  });

  it("computes department statistics", async () => {
    const stats = await departmentService.getStats("dept_parks");
    expect(stats.officerCount).toBe(1);
    expect(stats.totalComplaints).toBe(2);
    expect(stats.resolvedComplaints).toBe(1);
    expect(stats.citizenCount).toBe(1);
  });

  it("assigns officers to a department", async () => {
    const assigned = await departmentService.assignOfficers("dept_parks", {
      officerIds: ["usr_seed_officer2"],
    });
    expect(assigned.members.some((m) => m.userId === "usr_seed_officer2")).toBe(true);
  });
});