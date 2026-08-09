import { Router, Request, Response, NextFunction } from "express";
import { authService } from "../auth.service";
import { requireAuth, requireRole } from "../middleware/auth.middleware";
import { UserRole } from "@smartcity/common";
import { ApiResponse } from "@smartcity/shared";

const router = Router();

type Handler = (req: Request, res: Response) => Promise<unknown>;

const asyncHandler =
  (fn: Handler) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res)).catch(next);
  };

const sessionCtx = (req: Request) => ({
  userAgent: req.headers["user-agent"] ?? undefined,
  ip: req.ip ?? req.socket.remoteAddress,
});

/** Register a new citizen account. */
router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const session = await authService.register(req.body, sessionCtx(req));
    res.status(201).json(
      createAppResponse(true, "Account created", session),
    );
  }),
);

/** Authenticate and issue tokens. */
router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const session = await authService.login(req.body, sessionCtx(req));
    res.json(createAppResponse(true, "Authentication successful", session));
  }),
);

/** Rotate an access token using a refresh token. */
router.post(
  "/refresh",
  asyncHandler(async (req, res) => {
const refreshToken = req.body?.refreshToken;
    if (!refreshToken) {
      res.status(400).json(createAppResponse(false, "refreshToken is required"));
      return;
    }
    const tokens = await authService.refresh(refreshToken);
    res.json(createAppResponse(true, "Tokens refreshed", tokens));
  }),
);

/** Invalidate a session. */
router.post(
  "/logout",
  requireAuth,
  asyncHandler(async (req, res) => {
    const sessionId = req.body?.sessionId;
    const refreshToken = req.body?.refreshToken;
    await authService.logout(sessionId, refreshToken);
    res.json(createAppResponse(true, "Logged out"));
  }),
);

/** Request a password-reset link. */
router.post(
  "/forgot-password",
  asyncHandler(async (req, res) => {
    const email = req.body?.email;
    if (!email) {
      res.status(422).json(createAppResponse(false, "email is required"));
      return;
    }
    const result = await authService.forgotPassword(email);
    res.json(createAppResponse(true, result.message, result));
  }),
);

/** Set a new password using a reset token. */
router.post(
  "/reset-password",
  asyncHandler(async (req, res) => {
    await authService.resetPassword(req.body?.token, req.body?.password);
    res.json(createAppResponse(true, "Password has been reset. Please log in again."));
  }),
);

/** Verify an email address (mock — token is base64url of the email). */
router.post(
  "/verify-email",
  asyncHandler(async (req, res) => {
    await authService.verifyEmail(req.body?.token);
    res.json(createAppResponse(true, "Email verified"));
  }),
);

/** Get the authenticated user's profile. */
router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await authService.getMe(req.user!.sub);
    res.json(createAppResponse(true, "Profile fetched", user));
  }),
);

/** Update the authenticated user's profile. */
router.patch(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { fullName, phoneNumber, email, avatar } = req.body ?? {};
    const user = await authService.updateProfile(req.user!.sub, { fullName, phoneNumber, email, avatar });
    res.json(createAppResponse(true, "Profile updated", user));
  }),
);

/** List the current user's active sessions. */
router.get(
  "/sessions",
  requireAuth,
  asyncHandler(async (req, res) => {
    const sessions = await authService.listSessions(req.user!.sub);
    res.json(createAppResponse(true, "Sessions fetched", sessions));
  }),
);

/** Change the authenticated user's password (verifies the current one). */
router.post(
  "/change-password",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body ?? {};
    if (!currentPassword || !newPassword) {
      res.status(422).json(createAppResponse(false, "currentPassword and newPassword are required"));
      return;
    }
    await authService.changePassword(req.user!.sub, currentPassword, newPassword);
    res.json(createAppResponse(true, "Password changed. Please sign in again."));
  }),
);

/** Revoke a specific session. */
router.delete(
  "/sessions/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    await authService.revokeSession(req.user!.sub, req.params.id);
    res.json(createAppResponse(true, "Session revoked"));
  }),
);

/** Admin-only: confirm every seeded role is reachable via RBAC. */
router.get(
  "/rbac/roles",
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN),
  asyncHandler(async (_req, res) => {
    res.json(createAppResponse(true, "Roles", Object.values(UserRole)));
  }),
);

export function createAppResponse<T>(success: boolean, message: string, data?: T): ApiResponse<T> {
  return {
    success,
    message,
    timestamp: new Date().toISOString(),
    data,
  };
}

export default router;