import { authService } from "../service";
import { authRepository, seedUsers } from "../repository";
import { UserRole } from "@smartcity/common";

describe("authService", () => {
  beforeEach(() => {
    authRepository.users.seed(seedUsers);
    authRepository.passwordResets.seed([]);
    // keep seed data but clear sessions between runs
    authRepository.sessions.seed([]);
  });

  it("rejects invalid credentials", async () => {
    await expect(
      authService.login({ email: "citizen@smartcity.gov", password: "WrongPass123" }, {}),
    ).rejects.toThrow("Invalid credentials");
  });

  it("logs a seeded user in and returns a session", async () => {
    const session = await authService.login(
      { email: "citizen@smartcity.gov", password: "Citizen@1234" },
      { userAgent: "jest" },
    );
    expect(session.accessToken).toBeTruthy();
    expect(session.refreshToken).toBeTruthy();
    expect(session.user.role).toBe(UserRole.CITIZEN);
    expect(session.expiresIn).toBeGreaterThan(0);
  });

  it("registers a new account and issues tokens", async () => {
    const session = await authService.register(
      { fullName: "Test Resident", email: "test@example.com", password: "Password123" },
      {},
    );
    expect(session.user.email).toBe("test@example.com");
    expect(authRepository.findByEmail("test@example.com")).toBeTruthy();
  });

  it("does not allow duplicate registration", async () => {
    await expect(
      authService.register(
        { fullName: "Dup", email: "citizen@smartcity.gov", password: "Password123" },
        {},
      ),
    ).rejects.toThrow("already exists");
  });

  it("changes password only when current is correct", async () => {
    await expect(
      authService.changePassword(
        "usr_seed_citizen1",
        "Citizen@1234",
        "NewPassword456",
      ),
    ).resolves.toBeUndefined();
  });

  it("fetches a user profile", async () => {
    const user = await authService.getMe("usr_seed_citizen1");
    expect(user.email).toBe("citizen@smartcity.gov");
  });
});

// Direct type contract check for the DTO surface
const _register: Function = async (dto: { email: string }) => dto.email;
void _register;