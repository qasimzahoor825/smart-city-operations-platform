"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.optionalAuth = optionalAuth;
exports.requireRole = requireRole;
exports.requireSameUserOrRole = requireSameUserOrRole;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const errors_1 = require("../core/errors");
function tokenFromRequest(req) {
    const header = req.headers.authorization;
    if (header?.startsWith("Bearer "))
        return header.slice(7);
    return undefined;
}
function requireAuth(req, _res, next) {
    const token = tokenFromRequest(req);
    if (!token)
        throw new errors_1.UnauthorizedError("Authentication required");
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwt.secret);
        if (!decoded.sub || !decoded.role)
            throw new Error("missing claims");
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
    }
    catch {
        throw new errors_1.UnauthorizedError("Invalid or expired token");
    }
}
function optionalAuth(req, _res, next) {
    const token = tokenFromRequest(req);
    if (!token)
        return next();
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwt.secret);
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
    }
    catch {
        // ignore invalid tokens on optional routes
    }
    next();
}
function requireRole(...roles) {
    return (req, _res, next) => {
        if (!req.user)
            throw new errors_1.ForbiddenError("Not authenticated");
        if (!roles.includes(req.user.role)) {
            throw new errors_1.ForbiddenError("Insufficient permissions for this action");
        }
        next();
    };
}
function requireSameUserOrRole(...roles) {
    return (req, _res, next) => {
        if (!req.user)
            throw new errors_1.ForbiddenError("Not authenticated");
        const isOwner = req.user.id === req.params.id || req.user.id === req.params.userId;
        const hasRole = roles.includes(req.user.role);
        if (isOwner || hasRole)
            return next();
        throw new errors_1.ForbiddenError("You can only manage your own account");
    };
}
//# sourceMappingURL=auth.js.map