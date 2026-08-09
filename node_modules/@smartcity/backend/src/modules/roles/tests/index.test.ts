import { roleService } from "../service";
import { roleRepository } from "../repository";
import { UserRole } from "@smartcity/common";

describe("roleService", () => {
  beforeEach(() => {
    roleRepository.roles.seed([
      {
        role: UserRole.CITIZEN,
        name: "Citizen",
        description: "test",
        permissions: ["complaints:create"],
        claims: [{ resource: "complaints", action: "create", scope: "self" }],
      },
      {
        role: UserRole.SUPER_ADMIN,
        name: "Super Admin",
        description: "test",
        permissions: ["*"],
        claims: [{ resource: "*", action: "manage", scope: "global" }],
      },
    ]);
  });

  it("lists all roles", () => {
    const roles = roleService.list();
    expect(roles).toHaveLength(2);
  });

  it("describes a role by its enum value", () => {
    const citizen = roleService.get(UserRole.CITIZEN);
    expect(citizen.permissions).toContain("complaints:create");
    expect(citizen.claims[0].scope).toBe("self");
  });

  it("throws for an unknown role", () => {
    expect(() => roleService.get("GHOST_ROLE")).toThrow("not found");
  });
});