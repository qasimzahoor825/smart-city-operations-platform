import crypto from "crypto";
import { config } from "./config";
import { store, StoredUser, StoredSession, StoredReset } from "./data/store";
import { hashPassword, verifyPassword } from "./utils/password";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "./utils/jwt";
import {
  AppError,
  ConflictError,
  ForbiddenError,
  UnauthorizedError,
  UserRole,
} from "@smartcity/common";
import { AuthSession, AuthUser, LoginUserDto, RegisterUserDto } from "@smartcity/shared";

interface SessionContext {
  userAgent?: string;
  ip?: string;
}

function toAuthUser(u: StoredUser): AuthUser {
  return {
    id: u.id,
    fullName: u.fullName,
    email: u.email,
    role: u.role,
    phoneNumber: u.phoneNumber,
    departmentId: u.departmentId,
    isEmailVerified: u.isEmailVerified,
  };
}

function publicSession(s: StoredSession) {
  return {
    id: s.id,
    userAgent: s.userAgent,
    ip: s.ip,
    rememberMe: s.rememberMe,
    expiresAt: s.expiresAt,
    createdAt: s.createdAt,
    revoked: s.revoked,
  };
}

export const authService = {
  async register(dto: RegisterUserDto, ctx: SessionContext = {}): Promise<AuthSession> {
    const fullName = dto.fullName?.trim();
    const email = dto.email?.trim().toLowerCase();
    if (!fullName || !email || !dto.password) {
      throw new AppError("fullName, email and password are required", 422);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new AppError("A valid email address is required", 422);
    }
    if (dto.password.length < 8) {
      throw new AppError("Password must be at least 8 characters", 422);
    }
    if (store.findByEmail(email)) {
      throw new ConflictError("An account with this email already exists");
    }

    const passwordHash = await hashPassword(dto.password);
    const now = new Date().toISOString();
    const newUser: StoredUser = {
      id: crypto.randomUUID(),
      fullName,
      email,
      passwordHash,
      phoneNumber: dto.phoneNumber || null,
      role: UserRole.CITIZEN,
      isActive: true,
      isEmailVerified: false,
      departmentId: null,
      avatar: null,
      lastLoginAt: null,
      createdAt: now,
      updatedAt: now,
    };
    store.users.push(newUser);
    return this.issueSession(newUser, false, ctx);
  },

  async login(dto: LoginUserDto, ctx: SessionContext = {}): Promise<AuthSession> {
    const email = dto.email?.trim().toLowerCase();
    if (!email || !dto.password) throw new AppError("email and password are required", 422);
    const user = store.findByEmail(email);
    if (!user || !(await verifyPassword(dto.password, user.passwordHash))) {
      throw new UnauthorizedError("Invalid email or password");
    }
    if (!user.isActive) throw new ForbiddenError("This account has been deactivated");

    user.lastLoginAt = new Date().toISOString();
    return this.issueSession(user, dto.rememberMe === true, ctx);
  },

  async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const verified = verifyRefreshToken(refreshToken);
    if (!verified.valid || !verified.payload) throw new UnauthorizedError("Invalid refresh token");
    const sessionId = String((verified.payload as unknown as { jti?: string }).jti ?? "");
    const session = store.sessions.find((s) => s.id === sessionId);
    if (!session || session.revoked) throw new UnauthorizedError("Session has been revoked");
    if (new Date(session.expiresAt).getTime() < Date.now()) {
      throw new UnauthorizedError("Refresh token has expired");
    }
    const user = store.findById(session.userId);
    if (!user || !user.isActive) throw new UnauthorizedError("User not found");

    return {
      accessToken: signAccessToken(user),
      refreshToken: signRefreshToken(user.id, session.id),
    };
  },

  async logout(sessionId: string | undefined, refreshToken: string | undefined): Promise<void> {
    const session = sessionId
      ? store.sessions.find((s) => s.id === sessionId)
      : refreshToken
        ? store.sessions.find((s) => s.token === refreshToken)
        : undefined;
    if (session) session.revoked = true;
  },

  async forgotPassword(email: string): Promise<{ message: string; resetToken?: string }> {
    const user = store.findByEmail(email);
    if (!user) return { message: "If the account exists, a reset link has been sent." };
    const token = crypto.randomBytes(32).toString("hex");
    store.resets.push({
      token,
      userId: user.id,
      expiresAt: new Date(Date.now() + config.verificationTokenTtl * 60_000).toISOString(),
      used: false,
    } as StoredReset);
    return { message: "If the account exists, a reset link has been sent.", resetToken: token };
  },

  async resetPassword(token: string, password: string): Promise<void> {
    if (password.length < 8) throw new AppError("Password must be at least 8 characters", 422);
    const reset = store.resets.find((r) => r.token === token && !r.used);
    if (!reset) throw new UnauthorizedError("Invalid or expired reset token");
    if (new Date(reset.expiresAt).getTime() < Date.now()) {
      throw new UnauthorizedError("Reset token has expired");
    }
    const user = store.findById(reset.userId);
    if (!user) throw new UnauthorizedError("Account not found");
    user.passwordHash = await hashPassword(password);
    user.updatedAt = new Date().toISOString();
    reset.used = true;
    store.sessions.forEach((s) => {
      if (s.userId === user.id) s.revoked = true;
    });
  },

  async verifyEmail(token: string): Promise<boolean> {
    const email = Buffer.from(token, "base64url").toString("utf8");
    const user = store.findByEmail(email);
    if (!user) throw new UnauthorizedError("Invalid verification token");
    user.isEmailVerified = true;
    user.updatedAt = new Date().toISOString();
    return true;
  },

  async getMe(userId: string): Promise<AuthUser> {
    const user = store.findById(userId);
    if (!user) throw new UnauthorizedError("User not found");
    return toAuthUser(user);
  },

  async updateProfile(
    userId: string,
    patches: { fullName?: string; phoneNumber?: string; email?: string; avatar?: string },
  ): Promise<AuthUser> {
    const user = store.findById(userId);
    if (!user) throw new UnauthorizedError("User not found");
    if (patches.fullName !== undefined) {
      const name = patches.fullName.trim();
      if (!name) throw new AppError("fullName cannot be empty", 422);
      user.fullName = name;
    }
    if (patches.email !== undefined) {
      const email = patches.email.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new AppError("A valid email address is required", 422);
      }
      const existing = store.findByEmail(email);
      if (existing && existing.id !== userId) {
        throw new ConflictError("An account with this email already exists");
      }
      user.email = email;
    }
    if (patches.phoneNumber !== undefined) user.phoneNumber = patches.phoneNumber || null;
    if (patches.avatar !== undefined) user.avatar = patches.avatar || null;
    user.updatedAt = new Date().toISOString();
    return toAuthUser(user);
  },

  async listSessions(userId: string): Promise<ReturnType<typeof publicSession>[]> {
    return store.sessions.filter((s) => s.userId === userId).map(publicSession);
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    if (newPassword.length < 8) throw new AppError("Password must be at least 8 characters", 422);
    const user = store.findById(userId);
    if (!user) throw new UnauthorizedError("User not found");
    if (!(await verifyPassword(currentPassword, user.passwordHash))) {
      throw new UnauthorizedError("Current password is incorrect");
    }
    user.passwordHash = await hashPassword(newPassword);
    user.updatedAt = new Date().toISOString();
    store.sessions.forEach((s) => {
      if (s.userId === user.id) s.revoked = true;
    });
  },

  async revokeSession(userId: string, sessionId: string): Promise<void> {
    const session = store.sessions.find((s) => s.id === sessionId);
    if (session && session.userId === userId) session.revoked = true;
  },

  issueSession(user: StoredUser, rememberMe: boolean, ctx: SessionContext = {}): AuthSession {
    const sessionId = crypto.randomUUID();
    const refreshToken = signRefreshToken(user.id, sessionId);
    const accessToken = signAccessToken(user);
    store.sessions.push({
      id: sessionId,
      userId: user.id,
      token: refreshToken,
      userAgent: ctx.userAgent,
      ip: ctx.ip,
      rememberMe,
      expiresAt: new Date(
        Date.now() + (rememberMe ? 30 * 24 * 3600_000 : 7 * 24 * 3600_000),
      ).toISOString(),
      revoked: false,
      createdAt: new Date().toISOString(),
    });
    const active = store.sessions.filter((s) => s.userId === user.id && !s.revoked);
    while (active.length > config.maxSessionsPerUser) {
      const oldest = active.shift()!;
      oldest.revoked = true;
    }
    return {
      user: toAuthUser(user),
      accessToken,
      refreshToken,
      expiresIn: 15 * 60,
    };
  },
};