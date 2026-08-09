import type { NextFunction, Request, Response } from "express";
import { auditService } from "../modules/audit/service";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Locals {
      auditMeta?: Record<string, unknown> | null;
      auditEntityId?: string;
    }
  }
}

/**
 * Records a request-level audit entry once the response has finished writing.
 *
 * The action is captured for any successful 2xx/3xx response. Controllers can
 * enrich the entry by setting `res.locals.auditMeta` / `res.locals.auditEntityId`.
 * Auditing is intentionally best-effort — it must never throw inside the
 * request lifecycle.
 */
export function auditAction(
  action: string,
  entity?: string | ((req: Request) => string | null),
): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction): void => {
    res.on("finish", () => {
      if (res.statusCode >= 200 && res.statusCode < 400) {
        try {
          const entityName = typeof entity === "function" ? entity(req) : (entity ?? null);
          auditService.record({
            actorId: req.user?.id ?? null,
            actorEmail: req.user?.email ?? null,
            role: req.user?.role ?? null,
            action,
            entity: entityName,
            entityId: req.params?.id ?? res.locals.auditEntityId ?? null,
            meta: res.locals.auditMeta ?? null,
            ip: req.ip ?? req.socket.remoteAddress,
            userAgent: req.headers["user-agent"] ?? null,
          });
        } catch {
          // audit failures must never break the request lifecycle
        }
      }
    });
    next();
  };
}

/**
 * Awaits the current in-flight response and embeds request context (IP /
 * user-agent) for pre-auth flows such as registration or login.
 */
export function auditRequestContext(req: Request, _res: Response, next: NextFunction): void {
  (req as Request & { auditRequestContext?: { ip?: string; userAgent?: string } }).auditRequestContext = {
    ip: req.ip ?? req.socket.remoteAddress,
    userAgent: req.headers["user-agent"] ?? undefined,
  };
  next();
}

export default auditAction;