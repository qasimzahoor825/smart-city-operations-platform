import type { Request, Response } from "express";
import { authService } from "../service";
import { asyncHandler, createApiResponse } from "../../../core/utils";
import { AppError } from "@smartcity/common";
import { auditService } from "../../audit/service";

const sessionContext = (req: Request) => ({
  userAgent: req.headers["user-agent"] ?? undefined,
  ip: req.ip ?? req.socket.remoteAddress,
});

const auditAction = (action: string) => (req: Request) => {
  const ctx = sessionContext(req);
  const userId = req.user?.id ?? req.body?.userId ?? null;
  auditService.record({
    actorId: userId,
    action,
    entity: "auth",
    entityId: userId,
    meta: { email: req.body?.email ?? req.user?.email ?? null },
    ip: ctx.ip,
    userAgent: ctx.userAgent,
  });
};

export const authController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const session = await authService.register(req.body, sessionContext(req));
    auditAction("user.registered")(req);
    res.status(201).json(createApiResponse(true, "Account created", session));
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const session = await authService.login(req.body, sessionContext(req));
    auditAction("auth.login")(req);
    res.json(createApiResponse(true, "Authentication successful", session));
  }),

  refresh: asyncHandler(async (req: Request, res: Response) => {
    const session = await authService.refresh(req.body.refreshToken, sessionContext(req));
    res.json(createApiResponse(true, "Tokens refreshed", session));
  }),

  logout: asyncHandler(async (req: Request, res: Response) => {
    await authService.logout(req.body?.sessionId, req.body?.refreshToken);
    auditAction("auth.logout")(req);
    res.json(createApiResponse(true, "Logged out"));
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.getMe(req.user!.id);
    res.json(createApiResponse(true, "Profile fetched", user));
  }),

  updateProfile: asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.updateProfile(req.user!.id, req.body ?? {});
    res.json(createApiResponse(true, "Profile updated", user));
  }),

  sessions: asyncHandler(async (req: Request, res: Response) => {
    const sessions = await authService.listSessions(req.user!.id);
    res.json(createApiResponse(true, "Sessions fetched", sessions));
  }),

  revokeSession: asyncHandler(async (req: Request, res: Response) => {
    await authService.revokeSession(req.user!.id, req.params.id);
    auditService.record({
      actorId: req.user?.id ?? null,
      actorEmail: req.user?.email ?? null,
      role: req.user?.role ?? null,
      action: "auth.session_revoked",
      entity: "session",
      entityId: req.params.id,
      ip: req.ip ?? req.socket.remoteAddress,
      userAgent: req.headers["user-agent"] ?? null,
    });
    res.json(createApiResponse(true, "Session revoked"));
  }),

  changePassword: asyncHandler(async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body ?? {};
    if (!currentPassword || !newPassword) {
      res.status(422).json(createApiResponse(false, "currentPassword and newPassword are required"));
      return Promise.resolve();
    }
    await authService.changePassword(req.user!.id, currentPassword, newPassword);
    auditService.record({
      actorId: req.user?.id ?? null,
      actorEmail: req.user?.email ?? null,
      role: req.user?.role ?? null,
      action: "auth.password_changed",
      entity: "user",
      entityId: req.user?.id ?? null,
      ip: req.ip ?? req.socket.remoteAddress,
      userAgent: req.headers["user-agent"] ?? null,
    });
    res.json(createApiResponse(true, "Password changed. Please sign in again."));
  }),

  forgotPassword: asyncHandler(async (req: Request, res: Response) => {
    const email = (req.body?.email ?? "").trim();
    if (!email) {
      res.status(422).json(createApiResponse(false, "email is required"));
      return Promise.resolve();
    }
    const result = await authService.forgotPassword(email);
    auditService.record({
      actorId: null,
      action: "auth.password_reset_requested",
      entity: "user",
      meta: { email },
      ip: req.ip ?? req.socket.remoteAddress,
      userAgent: req.headers["user-agent"] ?? null,
    });
    res.json(createApiResponse(true, result.message, result));
  }),

  resetPassword: asyncHandler(async (req: Request, res: Response) => {
    await authService.resetPassword(req.body?.token, req.body?.password);
    auditService.record({
      actorId: null,
      action: "auth.password_reset",
      entity: "user",
      ip: req.ip ?? req.socket.remoteAddress,
      userAgent: req.headers["user-agent"] ?? null,
    });
    res.json(createApiResponse(true, "Password has been reset. Please log in again."));
  }),

  verifyEmail: asyncHandler(async (_req: Request, res: Response) => {
    res.json(createApiResponse(true, "Email verified"));
  }),
};

export default authController;