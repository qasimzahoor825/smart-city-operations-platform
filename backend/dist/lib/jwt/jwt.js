"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signAccessToken = signAccessToken;
exports.signRefreshToken = signRefreshToken;
exports.verifyAccessToken = verifyAccessToken;
exports.verifyRefreshToken = verifyRefreshToken;
exports.ttlSeconds = ttlSeconds;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../../config");
function signAccessToken(claims) {
    return jsonwebtoken_1.default.sign(claims, config_1.config.jwt.secret, {
        expiresIn: config_1.config.jwt.accessTtl,
    });
}
function signRefreshToken(sub) {
    return jsonwebtoken_1.default.sign({ sub }, config_1.config.jwt.refreshSecret, {
        expiresIn: `${config_1.config.jwt.refreshTtlDays}d`,
    });
}
function verifyAccessToken(token) {
    const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwt.secret);
    return {
        sub: String(decoded.sub),
        email: String(decoded.email ?? ""),
        role: String(decoded.role ?? ""),
        departmentId: decoded.departmentId ?? null,
    };
}
function verifyRefreshToken(token) {
    const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwt.refreshSecret);
    return { sub: String(decoded.sub) };
}
function ttlSeconds(ttl) {
    const m = /^(\d+)(m|h|d|s)$/.exec(ttl);
    if (!m)
        return 900;
    const n = Number(m[1]);
    switch (m[2]) {
        case "s":
            return n;
        case "m":
            return n * 60;
        case "h":
            return n * 3600;
        case "d":
            return n * 86_400;
        default:
            return 900;
    }
}
//# sourceMappingURL=jwt.js.map