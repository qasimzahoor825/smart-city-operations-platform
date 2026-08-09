"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const service_1 = require("../service");
const utils_1 = require("../../../core/utils");
const service_2 = require("../../audit/service");
const sessionContext = (req) => ({
    userAgent: req.headers["user-agent"] ?? undefined,
    ip: req.ip ?? req.socket.remoteAddress,
});
const auditAction = (action) => (req) => {
    const ctx = sessionContext(req);
    const userId = req.user?.id ?? req.body?.userId ?? null;
    service_2.auditService.record({
        actorId: userId,
        action,
        entity: "auth",
        entityId: userId,
        meta: { email: req.body?.email ?? req.user?.email ?? null },
        ip: ctx.ip,
        userAgent: ctx.userAgent,
    });
};
exports.authController = {
    register: (0, utils_1.asyncHandler)(async (req, res) => {
        const session = await service_1.authService.register(req.body, sessionContext(req));
        auditAction("user.registered")(req);
        res.status(201).json((0, utils_1.createApiResponse)(true, "Account created", session));
    }),
    login: (0, utils_1.asyncHandler)(async (req, res) => {
        const session = await service_1.authService.login(req.body, sessionContext(req));
        auditAction("auth.login")(req);
        res.json((0, utils_1.createApiResponse)(true, "Authentication successful", session));
    }),
    refresh: (0, utils_1.asyncHandler)(async (req, res) => {
        const session = await service_1.authService.refresh(req.body.refreshToken, sessionContext(req));
        res.json((0, utils_1.createApiResponse)(true, "Tokens refreshed", session));
    }),
    logout: (0, utils_1.asyncHandler)(async (req, res) => {
        await service_1.authService.logout(req.body?.sessionId, req.body?.refreshToken);
        auditAction("auth.logout")(req);
        res.json((0, utils_1.createApiResponse)(true, "Logged out"));
    }),
    me: (0, utils_1.asyncHandler)(async (req, res) => {
        const user = await service_1.authService.getMe(req.user.id);
        res.json((0, utils_1.createApiResponse)(true, "Profile fetched", user));
    }),
    updateProfile: (0, utils_1.asyncHandler)(async (req, res) => {
        const user = await service_1.authService.updateProfile(req.user.id, req.body ?? {});
        res.json((0, utils_1.createApiResponse)(true, "Profile updated", user));
    }),
    sessions: (0, utils_1.asyncHandler)(async (req, res) => {
        const sessions = await service_1.authService.listSessions(req.user.id);
        res.json((0, utils_1.createApiResponse)(true, "Sessions fetched", sessions));
    }),
    revokeSession: (0, utils_1.asyncHandler)(async (req, res) => {
        await service_1.authService.revokeSession(req.user.id, req.params.id);
        service_2.auditService.record({
            actorId: req.user?.id ?? null,
            actorEmail: req.user?.email ?? null,
            role: req.user?.role ?? null,
            action: "auth.session_revoked",
            entity: "session",
            entityId: req.params.id,
            ip: req.ip ?? req.socket.remoteAddress,
            userAgent: req.headers["user-agent"] ?? null,
        });
        res.json((0, utils_1.createApiResponse)(true, "Session revoked"));
    }),
    changePassword: (0, utils_1.asyncHandler)(async (req, res) => {
        const { currentPassword, newPassword } = req.body ?? {};
        if (!currentPassword || !newPassword) {
            res.status(422).json((0, utils_1.createApiResponse)(false, "currentPassword and newPassword are required"));
            return Promise.resolve();
        }
        await service_1.authService.changePassword(req.user.id, currentPassword, newPassword);
        service_2.auditService.record({
            actorId: req.user?.id ?? null,
            actorEmail: req.user?.email ?? null,
            role: req.user?.role ?? null,
            action: "auth.password_changed",
            entity: "user",
            entityId: req.user?.id ?? null,
            ip: req.ip ?? req.socket.remoteAddress,
            userAgent: req.headers["user-agent"] ?? null,
        });
        res.json((0, utils_1.createApiResponse)(true, "Password changed. Please sign in again."));
    }),
    forgotPassword: (0, utils_1.asyncHandler)(async (req, res) => {
        const email = (req.body?.email ?? "").trim();
        if (!email) {
            res.status(422).json((0, utils_1.createApiResponse)(false, "email is required"));
            return Promise.resolve();
        }
        const result = await service_1.authService.forgotPassword(email);
        service_2.auditService.record({
            actorId: null,
            action: "auth.password_reset_requested",
            entity: "user",
            meta: { email },
            ip: req.ip ?? req.socket.remoteAddress,
            userAgent: req.headers["user-agent"] ?? null,
        });
        res.json((0, utils_1.createApiResponse)(true, result.message, result));
    }),
    resetPassword: (0, utils_1.asyncHandler)(async (req, res) => {
        await service_1.authService.resetPassword(req.body?.token, req.body?.password);
        service_2.auditService.record({
            actorId: null,
            action: "auth.password_reset",
            entity: "user",
            ip: req.ip ?? req.socket.remoteAddress,
            userAgent: req.headers["user-agent"] ?? null,
        });
        res.json((0, utils_1.createApiResponse)(true, "Password has been reset. Please log in again."));
    }),
    verifyEmail: (0, utils_1.asyncHandler)(async (_req, res) => {
        res.json((0, utils_1.createApiResponse)(true, "Email verified"));
    }),
};
exports.default = exports.authController;
//# sourceMappingURL=index.js.map