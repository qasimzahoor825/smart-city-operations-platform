import bcrypt from "bcryptjs";
import { UserRole } from "@smartcity/common";
import crypto from "crypto";
import { AppError, UnauthorizedError, ConflictError, ForbiddenError } from "@smartcity/common";
import { authRepository, type StoredPasswordReset, type StoredSession, type StoredUser } from "../repository";
import type { AuthSession, LoginDto, RegisterDto, UpdateProfileDto, PublicUser } from "../dto";
import { signAccessToken, signRefreshToken, ttlSeconds } from "../../../lib/jwt/jwt";
import { config } from "../../../config";

const ACCESS_TTL_SECONDS = ttlSeconds("15m");

export const authService = {
  async register(dto: RegisterDto, meta: { userAgent?: string; ip?: string }): Promise<AuthSession> {
    const email = dto.email.trim().toLowerCase();
    if (authRepository.findByEmail(email)) {
      throw new ConflictError("An account with this email already exists");
    }
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const role = dto.role ?? UserRole.CITIZEN;
    const now = new Date().toISOString();
    const user = authRepository.users.create({
      fullName: dto.fullName,
      email,
      passwordHash,
      role,
      phoneNumber: dto.phoneNumber ?? null,
      departmentId: dto.departmentId ?? null,
      isEmailVerified: false,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    } as unknown as StoredUser);

    const publicUser = authRepository.toPublic(user);
    return this.issueSession(publicUser, meta);
  },

  async login(dto: LoginDto, meta: { userAgent?: string; ip?: string }): Promise<AuthSession> {
    const email = dto.email.trim().toLowerCase();
    const user = authRepository.findByEmail(email);
    if (!user) throw new UnauthorizedError("Invalid credentials");
    if (!user.isActive) throw new ForbiddenError("This account has been deactivated");

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedError("Invalid credentials");

    const publicUser = authRepository.toPublic(user);
    return this.issueSession(publicUser, meta);
  },

  async refresh(refreshToken: string, meta: { userAgent?: string; ip?: string }): Promise<AuthSession> {
    const session = authRepository.sessions.all().find((s) => s.refreshToken === refreshToken);
    if (!session) throw new UnauthorizedError("Invalid refresh token");
    if (new Date(session.expiresAt).getTime() < Date.now()) {
      authRepository.sessions.delete(session.id);
      throw new UnauthorizedError("Refresh token expired");
    }
    const user = authRepository.users.findById(session.userId) as StoredUser | undefined;
    if (!user || !user.isActive) throw new UnauthorizedError("Account unavailable");
    authRepository.sessions.delete(session.id);
    return this.issueSession(authRepository.toPublic(user), meta);
  },

  async issueSession(user: PublicUser, meta: { userAgent?: string; ip?: string }): Promise<AuthSession> {
    const expiredSessions = authRepository.sessions
      .all()
      .filter((s) => s.userId === user.id && new Date(s.expiresAt).getTime() < Date.now());
    expiredSessions.forEach((s) => authRepository.sessions.delete(s.id));

    const refreshToken = signRefreshToken(user.id);
    const refreshTtlMs = 14 * 86_400_000;
    authRepository.sessions.create({
      userId: user.id,
      refreshToken,
      userAgent: meta.userAgent,
      ip: meta.ip,
      expiresAt: new Date(Date.now() + refreshTtlMs).toISOString(),
      createdAt: new Date().toISOString(),
    } as unknown as StoredSession);

    return {
      user,
      accessToken: signAccessToken({
        sub: user.id,
        email: user.email,
        role: user.role,
        departmentId: user.departmentId ?? null,
      }),
      refreshToken,
      expiresIn: ttlSeconds("15m"),
    };
  },

  async logout(sessionId?: string, refreshToken?: string): Promise<void> {
    if (sessionId) {
      authRepository.sessions.delete(sessionId);
      return;
    }
    if (refreshToken) {
      const session = authRepository.sessions.all().find((s) => s.refreshToken === refreshToken);
      if (session) authRepository.sessions.delete(session.id);
    }
  },

  async getMe(userId: string): Promise<PublicUser> {
    const user = authRepository.users.findById(userId) as StoredUser | undefined;
    if (!user) throw new AppError("User not found", 404);
    return authRepository.toPublic(user);
  },

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<PublicUser> {
    const patch: Partial<StoredUser> = {};
    if (dto.fullName !== undefined) patch.fullName = dto.fullName;
    if (dto.phoneNumber !== undefined) patch.phoneNumber = dto.phoneNumber;
    if (dto.email !== undefined) {
      const email = dto.email.trim().toLowerCase();
      const existing = authRepository.findByEmail(email);
      if (existing && existing.id !== userId) throw new ConflictError("Email already in use");
      patch.email = email;
    }
    patch.updatedAt = new Date().toISOString();
    const updated = authRepository.users.update(userId, patch) as StoredUser | undefined;
    if (!updated) throw new AppError("User not found", 404);
    return authRepository.toPublic(updated);
  },

  async forgotPassword(email: string): Promise<{ message: string; token?: string }> {
    const user = authRepository.findByEmail(email);
    if (!user) {
      // Return 200 to avoid account enumeration in production.
      return { message: "If an account exists, a reset email has been sent." };
    }
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const now = new Date().toISOString();
    authRepository.passwordResets
      .all()
      .filter((r) => r.userId === user.id && !r.usedAt)
      .forEach((r) =>
        authRepository.passwordResets.update(r.id, { usedAt: now } as Partial<StoredPasswordReset>),
      );
    authRepository.passwordResets.create({
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 60 * 60_000).toISOString(),
      usedAt: null,
      createdAt: now,
    } as StoredPasswordReset);
    return {
      message: "If an account exists, a reset email has been sent.",
      token: config.env === "development" ? token : undefined,
    };
  },

  async resetPassword(token: string, password: string): Promise<void> {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const record = authRepository.passwordResets
      .all()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .find((r) => r.tokenHash === tokenHash);
    if (!record) throw new UnauthorizedError("Reset token is invalid");
    if (record.usedAt) throw new UnauthorizedError("Reset token has already been used");
    if (new Date(record.expiresAt).getTime() < Date.now()) {
      throw new UnauthorizedError("Reset token has expired");
    }
    const user = authRepository.users.findById(record.userId) as StoredUser | undefined;
    if (!user) throw new AppError("User not found", 404);
    const passwordHash = await bcrypt.hash(password, 12);
    authRepository.users.update(user.id, {
      passwordHash,
      updatedAt: new Date().toISOString(),
    } as Partial<StoredUser>);
    authRepository.passwordResets.update(record.id, { usedAt: new Date().toISOString() } as StoredPasswordReset);
    authRepository.sessions
      .all()
      .filter((s) => s.userId === user.id)
      .forEach((s) => authRepository.sessions.delete(s.id));
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = authRepository.users.findById(userId) as StoredUser | undefined;
    if (!user) throw new AppError("User not found", 404);
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) throw new UnauthorizedError("Current password is incorrect");
    const passwordHash = await bcrypt.hash(newPassword, 12);
    authRepository.users.update(userId, { passwordHash, updatedAt: new Date().toISOString() } as Partial<StoredUser>);
    authRepository.sessions
      .all()
      .filter((s) => s.userId === userId)
      .forEach((s) => authRepository.sessions.delete(s.id));
  },

  async listSessions(userId: string): Promise<StoredSession[]> {
    return authRepository.sessions.all().filter((s) => s.userId === userId);
  },

  async revokeSession(userId: string, sessionId: string): Promise<void> {
    const session = authRepository.sessions.findById(sessionId) as StoredSession | undefined;
    if (!session) throw new AppError("Session not found", 404);
    if (session.userId !== userId) throw new ForbiddenError("Cannot revoke another user's session");
    authRepository.sessions.delete(sessionId);
  },
};

export default authService;