import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { UnauthorizedError, ForbiddenError } from "../core/errors";
import { UserRole } from "@smartcity/common";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export interface AuthenticatedUser {
  sub: string;
  id: string;
  email: string;
  role: string;
  departmentId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
}

function tokenFromRequest(req: Request): string | undefined {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice(7);
  return undefined;
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = tokenFromRequest(req);
  if (!token) throw new UnauthorizedError("Authentication required");

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as jwt.JwtPayload & {
      sub?: string;
      email?: string;
      role?: string;
      departmentId?: string | null;
    };
    if (!decoded.sub || !decoded.role) throw new Error("missing claims");
    req.user = {
      sub: decoded.sub,
      id: decoded.sub,
      email: decoded.email ?? "",
      role: decoded.role,
      departmentId: decoded.departmentId ?? null,
      ip: req.ip ?? req.socket.remoteAddress,
      userAgent: req.headers["user-agent"] ?? null,
    };
    next();
  } catch {
    throw new UnauthorizedError("Invalid or expired token");
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = tokenFromRequest(req);
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as jwt.JwtPayload & {
      sub?: string;
      email?: string;
      role?: string;
      departmentId?: string | null;
    };
    if (decoded.sub) {
      req.user = {
        sub: decoded.sub,
        id: decoded.sub,
        email: decoded.email ?? "",
        role: decoded.role ?? "CITIZEN",
        departmentId: decoded.departmentId ?? null,
        ip: req.ip ?? req.socket.remoteAddress,
        userAgent: req.headers["user-agent"] ?? null,
      };
    }
  } catch {
    // ignore invalid tokens on optional routes
  }
  next();
}

export function requireRole(...roles: UserRole[]): (req: Request, _res: Response, next: NextFunction) => void {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw new ForbiddenError("Not authenticated");
    if (!roles.includes(req.user.role as UserRole)) {
      throw new ForbiddenError("Insufficient permissions for this action");
    }
    next();
  };
}

export function requireSameUserOrRole(...roles: UserRole[]): (req: Request, _res: Response, next: NextFunction) => void {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw new ForbiddenError("Not authenticated");
    const isOwner = req.user.id === req.params.id || req.user.id === req.params.userId;
    const hasRole = roles.includes(req.user.role as UserRole);
    if (isOwner || hasRole) return next();
    throw new ForbiddenError("You can only manage your own account");
  };
}