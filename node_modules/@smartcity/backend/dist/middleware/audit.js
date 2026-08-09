"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditAction = auditAction;
exports.auditRequestContext = auditRequestContext;
const service_1 = require("../modules/audit/service");
/**
 * Records a request-level audit entry once the response has finished writing.
 *
 * The action is captured for any successful 2xx/3xx response. Controllers can
 * enrich the entry by setting `res.locals.auditMeta` / `res.locals.auditEntityId`.
 * Auditing is intentionally best-effort — it must never throw inside the
 * request lifecycle.
 */
function auditAction(action, entity) {
    return (req, res, next) => {
        res.on("finish", () => {
            if (res.statusCode >= 200 && res.statusCode < 400) {
                try {
                    const entityName = typeof entity === "function" ? entity(req) : (entity ?? null);
                    service_1.auditService.record({
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
                }
                catch {
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
function auditRequestContext(req, _res, next) {
    req.auditRequestContext = {
        ip: req.ip ?? req.socket.remoteAddress,
        userAgent: req.headers["user-agent"] ?? undefined,
    };
    next();
}
exports.default = auditAction;
//# sourceMappingURL=audit.js.map