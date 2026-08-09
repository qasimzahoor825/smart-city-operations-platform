import { citizenService } from "../service";
import { citizenRepository } from "../repository";

describe("citizenService", () => {
  beforeEach(() => {
    citizenRepository.citizens.seed([
      {
        id: "usr_cit_a",
        fullName: "Dana Foster",
        email: "dana@example.com",
        ward: "Downtown",
        isEmailVerified: true,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "usr_cit_b",
        fullName: "Marcus Reed",
        email: "marcus@example.com",
        ward: "Riverside",
        isEmailVerified: true,
        isActive: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);
    citizenRepository.complaints.seed([
      {
        id: "c1",
        citizenId: "usr_cit_a",
        title: "Pothole",
        category: "ROAD",
        status: "RESOLVED",
        createdAt: new Date().toISOString(),
      },
      {
        id: "c2",
        citizenId: "usr_cit_a",
        title: "Lamp",
        category: "STREET_LIGHT",
        status: "IN_PROGRESS",
        createdAt: new Date().toISOString(),
      },
      {
        id: "c3",
        citizenId: "usr_cit_b",
        title: "Water leak",
        category: "WATER",
        status: "SUBMITTED",
        createdAt: new Date().toISOString(),
      },
    ]);
  });

  it("lists citizens and filters by ward", async () => {
    const { items } = await citizenService.list({ ward: "Downtown" });
    expect(items).toHaveLength(1);
    expect(items[0].fullName).toBe("Dana Foster");
  });

  it("gets a citizen by id", async () => {
    const citizen = await citizenService.getById("usr_cit_b");
    expect(citizen.email).toBe("marcus@example.com");
  });

  it("throws for an unknown citizen", async () => {
    await expect(citizenService.getById("missing")).rejects.toThrow("Citizen not found");
  });

  it("updates a citizen profile", async () => {
    const updated = await citizenService.updateProfile("usr_cit_a", { ward: "Old Town" });
    expect(updated.ward).toBe("Old Town");
  });

  it("computes per-citizen statistics", async () => {
    const stats = await citizenService.getStats("usr_cit_a");
    expect(stats.totalComplaints).toBe(2);
    expect(stats.openComplaints).toBe(0);
    expect(stats.inProgressComplaints).toBe(1);
    expect(stats.resolvedComplaints).toBe(1);
  });

  it("computes a platform overview", async () => {
    const overview = await citizenService.overview();
    expect(overview.totalCitizens).toBe(2);
    expect(overview.activeCitizens).toBe(1);
    expect(overview.totalComplaints).toBe(3);
  });
});