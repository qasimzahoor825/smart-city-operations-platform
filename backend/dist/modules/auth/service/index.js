"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const common_1 = require("@smartcity/common");
const crypto_1 = __importDefault(require("crypto"));
const common_2 = require("@smartcity/common");
const repository_1 = require("../repository");
const jwt_1 = require("../../../lib/jwt/jwt");
const mailer_1 = require("../../../lib/mailer");
const sms_1 = require("../../../lib/sms");
const config_1 = require("../../../config");
const OTP_TTL_MS = 10 * 60_000;
function generateOtp(seed) {
    if (seed) {
        let hash = 0;
        for (let i = 0; i < seed.length; i++) {
            hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
        }
        return String(hash % 900000 + 100000);
    }
    return String(crypto_1.default.randomInt(100000, 1000000));
}
const hashOtp = (otp) => crypto_1.default.createHash("sha256").update(otp).digest("hex");
/** Returns a fresh, unused OTP record for the user (creating + emailing it). */
async function sendVerificationOtp(user) {
    const now = new Date();
    repository_1.authRepository.emailVerifications
        .all()
        .filter((v) => v.userId === user.id && !v.usedAt && new Date(v.expiresAt).getTime() > now.getTime())
        .forEach((v) => repository_1.authRepository.emailVerifications.update(v.id, { usedAt: now.toISOString() }));
    const otp = generateOtp(config_1.config.env === "test" ? user.email : undefined);
    repository_1.authRepository.emailVerifications.create({
        userId: user.id,
        email: user.email,
        otpHash: hashOtp(otp),
        expiresAt: new Date(now.getTime() + OTP_TTL_MS).toISOString(),
        usedAt: null,
        createdAt: now.toISOString(),
    });
    await mailer_1.mailer.sendOtp(user.email, otp, user.fullName);
    if (user.phoneNumber) {
        await (0, sms_1.sendSmsOtp)(user.phoneNumber, otp);
    }
}
exports.authService = {
    async register(dto, _meta) {
        const email = dto.email.trim().toLowerCase();
        if (repository_1.authRepository.findByEmail(email)) {
            throw new common_2.ConflictError("An account with this email already exists");
        }
        const passwordHash = await bcryptjs_1.default.hash(dto.password, 12);
        const role = dto.role ?? common_1.UserRole.CITIZEN;
        const now = new Date().toISOString();
        const user = repository_1.authRepository.users.create({
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
        });
        await sendVerificationOtp(user);
        return { user: repository_1.authRepository.toPublic(user), requiresOtp: true };
    },
    async login(dto, meta) {
        const email = dto.email.trim().toLowerCase();
        const user = repository_1.authRepository.findByEmail(email);
        if (!user)
            throw new common_2.UnauthorizedError("Invalid credentials");
        if (!user.isActive)
            throw new common_2.ForbiddenError("This account has been deactivated");
        const valid = await bcryptjs_1.default.compare(dto.password, user.passwordHash);
        if (!valid)
            throw new common_2.UnauthorizedError("Invalid credentials");
        if (!user.isEmailVerified) {
            await sendVerificationOtp(user);
            throw new common_2.ForbiddenError(`Your email is not verified. A 6-digit code has been sent to ${user.email} — enter it on the verification screen to sign in.`);
        }
        const publicUser = repository_1.authRepository.toPublic(user);
        return this.issueSession(publicUser, meta);
    },
    async resendVerificationOtp(emailRaw) {
        const email = emailRaw.trim().toLowerCase();
        const user = repository_1.authRepository.findByEmail(email);
        if (!user) {
            return { message: "If an account exists, a new verification code has been sent." };
        }
        if (user.isEmailVerified) {
            return { message: "Your email is already verified. You can sign in now." };
        }
        await sendVerificationOtp(user);
        return { message: "A new verification code has been sent to your email." };
    },
    async verifyEmailOtp(emailRaw, otp, meta) {
        const email = emailRaw.trim().toLowerCase();
        const user = repository_1.authRepository.findByEmail(email);
        if (!user)
            throw new common_2.UnauthorizedError("Invalid verification code");
        if (user.isEmailVerified) {
            return this.issueSession(repository_1.authRepository.toPublic(user), meta);
        }
        const otpHash = hashOtp(otp.trim());
        const record = repository_1.authRepository.emailVerifications
            .all()
            .filter((v) => v.userId === user.id)
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
            .find((v) => v.otpHash === otpHash && !v.usedAt && new Date(v.expiresAt).getTime() > Date.now());
        if (!record)
            throw new common_2.UnauthorizedError("Invalid or expired verification code");
        const now = new Date().toISOString();
        repository_1.authRepository.emailVerifications.update(record.id, { usedAt: now });
        const updatedUser = repository_1.authRepository.users.update(user.id, {
            isEmailVerified: true,
            updatedAt: now,
        });
        return this.issueSession(repository_1.authRepository.toPublic(updatedUser), meta);
    },
    async refresh(refreshToken, meta) {
        const session = repository_1.authRepository.sessions.all().find((s) => s.refreshToken === refreshToken);
        if (!session)
            throw new common_2.UnauthorizedError("Invalid refresh token");
        if (new Date(session.expiresAt).getTime() < Date.now()) {
            repository_1.authRepository.sessions.delete(session.id);
            throw new common_2.UnauthorizedError("Refresh token expired");
        }
        const user = repository_1.authRepository.users.findById(session.userId);
        if (!user || !user.isActive)
            throw new common_2.UnauthorizedError("Account unavailable");
        repository_1.authRepository.sessions.delete(session.id);
        return this.issueSession(repository_1.authRepository.toPublic(user), meta);
    },
    async issueSession(user, meta) {
        const expiredSessions = repository_1.authRepository.sessions
            .all()
            .filter((s) => s.userId === user.id && new Date(s.expiresAt).getTime() < Date.now());
        expiredSessions.forEach((s) => repository_1.authRepository.sessions.delete(s.id));
        const refreshToken = (0, jwt_1.signRefreshToken)(user.id);
        const refreshTtlMs = 14 * 86_400_000;
        repository_1.authRepository.sessions.create({
            userId: user.id,
            refreshToken,
            userAgent: meta.userAgent,
            ip: meta.ip,
            expiresAt: new Date(Date.now() + refreshTtlMs).toISOString(),
            createdAt: new Date().toISOString(),
        });
        return {
            user,
            accessToken: (0, jwt_1.signAccessToken)({
                sub: user.id,
                email: user.email,
                role: user.role,
                departmentId: user.departmentId ?? null,
            }),
            refreshToken,
            expiresIn: (0, jwt_1.ttlSeconds)("15m"),
        };
    },
    async logout(sessionId, refreshToken) {
        if (sessionId) {
            repository_1.authRepository.sessions.delete(sessionId);
            return;
        }
        if (refreshToken) {
            const session = repository_1.authRepository.sessions.all().find((s) => s.refreshToken === refreshToken);
            if (session)
                repository_1.authRepository.sessions.delete(session.id);
        }
    },
    async getMe(userId) {
        const user = repository_1.authRepository.users.findById(userId);
        if (!user)
            throw new common_2.AppError("User not found", 404);
        return repository_1.authRepository.toPublic(user);
    },
    async updateProfile(userId, dto) {
        const patch = {};
        if (dto.fullName !== undefined)
            patch.fullName = dto.fullName;
        if (dto.phoneNumber !== undefined)
            patch.phoneNumber = dto.phoneNumber;
        if (dto.email !== undefined) {
            const email = dto.email.trim().toLowerCase();
            const existing = repository_1.authRepository.findByEmail(email);
            if (existing && existing.id !== userId)
                throw new common_2.ConflictError("Email already in use");
            patch.email = email;
        }
        patch.updatedAt = new Date().toISOString();
        const updated = repository_1.authRepository.users.update(userId, patch);
        if (!updated)
            throw new common_2.AppError("User not found", 404);
        return repository_1.authRepository.toPublic(updated);
    },
    async forgotPassword(email) {
        const user = repository_1.authRepository.findByEmail(email);
        if (!user) {
            // Return 200 to avoid account enumeration in production.
            return { message: "If an account exists, a reset email has been sent." };
        }
        const token = crypto_1.default.randomBytes(32).toString("hex");
        const tokenHash = crypto_1.default.createHash("sha256").update(token).digest("hex");
        const now = new Date().toISOString();
        repository_1.authRepository.passwordResets
            .all()
            .filter((r) => r.userId === user.id && !r.usedAt)
            .forEach((r) => repository_1.authRepository.passwordResets.update(r.id, { usedAt: now }));
        repository_1.authRepository.passwordResets.create({
            userId: user.id,
            tokenHash,
            expiresAt: new Date(Date.now() + 60 * 60_000).toISOString(),
            usedAt: null,
            createdAt: now,
        });
        return {
            message: "If an account exists, a reset email has been sent.",
            token: config_1.config.env === "development" ? token : undefined,
        };
    },
    async resetPassword(token, password) {
        const tokenHash = crypto_1.default.createHash("sha256").update(token).digest("hex");
        const record = repository_1.authRepository.passwordResets
            .all()
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
            .find((r) => r.tokenHash === tokenHash);
        if (!record)
            throw new common_2.UnauthorizedError("Reset token is invalid");
        if (record.usedAt)
            throw new common_2.UnauthorizedError("Reset token has already been used");
        if (new Date(record.expiresAt).getTime() < Date.now()) {
            throw new common_2.UnauthorizedError("Reset token has expired");
        }
        const user = repository_1.authRepository.users.findById(record.userId);
        if (!user)
            throw new common_2.AppError("User not found", 404);
        const passwordHash = await bcryptjs_1.default.hash(password, 12);
        repository_1.authRepository.users.update(user.id, {
            passwordHash,
            updatedAt: new Date().toISOString(),
        });
        repository_1.authRepository.passwordResets.update(record.id, { usedAt: new Date().toISOString() });
        repository_1.authRepository.sessions
            .all()
            .filter((s) => s.userId === user.id)
            .forEach((s) => repository_1.authRepository.sessions.delete(s.id));
    },
    async changePassword(userId, currentPassword, newPassword) {
        const user = repository_1.authRepository.users.findById(userId);
        if (!user)
            throw new common_2.AppError("User not found", 404);
        const valid = await bcryptjs_1.default.compare(currentPassword, user.passwordHash);
        if (!valid)
            throw new common_2.UnauthorizedError("Current password is incorrect");
        const passwordHash = await bcryptjs_1.default.hash(newPassword, 12);
        repository_1.authRepository.users.update(userId, { passwordHash, updatedAt: new Date().toISOString() });
        repository_1.authRepository.sessions
            .all()
            .filter((s) => s.userId === userId)
            .forEach((s) => repository_1.authRepository.sessions.delete(s.id));
    },
    async listSessions(userId) {
        return repository_1.authRepository.sessions.all().filter((s) => s.userId === userId);
    },
    async revokeSession(userId, sessionId) {
        const session = repository_1.authRepository.sessions.findById(sessionId);
        if (!session)
            throw new common_2.AppError("Session not found", 404);
        if (session.userId !== userId)
            throw new common_2.ForbiddenError("Cannot revoke another user's session");
        repository_1.authRepository.sessions.delete(sessionId);
    },
};
exports.default = exports.authService;
//# sourceMappingURL=index.js.map