import { userService } from "../service";
import { userRepository } from "../repository";
import { UserRole } from "@smartcity/common";

describe("userService", () => {
  beforeEach(() => {
    userRepository.users.seed([
      {
        id: "usr_t1",
        fullName: "Alice Admin",
        email: "alice@test.gov",
        passwordHash: "hash",
        role: UserRole.OFFICER,
        departmentId: "dept-test",
        isEmailVerified: true,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "usr_t2",
        fullName: "Bob Resident",
        email: "bob@test.gov",
        passwordHash: "hash",
        role: UserRole.CITIZEN,
        isEmailVerified: false,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);
  });

  it("lists users and paginates", async () => {
    const { items, pagination } = await userService.list({ page: 1, limit: 1 });
    expect(items).toHaveLength(1);
    expect(pagination.total).toBe(2);
  });

  it("filters users by role", async () => {
    const { items } = await userService.list({ role: UserRole.CITIZEN });
    expect(items).toHaveLength(1);
    expect(items[0].email).toBe("bob@test.gov");
  });

  it("gets a user by id", async () => {
    const user = await userService.getById("usr_t1");
    expect(user.role).toBe(UserRole.OFFICER);
  });

  it("throws for an unknown user", async () => {
    await expect(userService.getById("missing")).rejects.toThrow("User not found");
  });

  it("updates a user and rejects a duplicate email", async () => {
    const updated = await userService.update("usr_t1", { role: UserRole.DEPARTMENT_HEAD });
    expect(updated.role).toBe(UserRole.DEPARTMENT_HEAD);
    await expect(userService.update("usr_t1", { email: "bob@test.gov" })).rejects.toThrow(
      "already associated",
    );
  });

  it("deactivates and deletes a user", async () => {
    const deactivated = await userService.setActive("usr_t2", false);
    expect(deactivated.isActive).toBe(false);
    await userService.remove("usr_t2");
    await expect(userService.getById("usr_t2")).rejects.toThrow("User not found");
  });
});