"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signAccessToken = signAccessToken;
exports.signRefreshToken = signRefreshToken;
exports.verifyAccessToken = verifyAccessToken;
exports.verifyRefreshToken = verifyRefreshToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../../config");
const errors_1 = require("../../core/errors");
function signAccessToken(payload) {
    return jsonwebtoken_1.default.sign(payload, config_1.config.jwt.secret, { expiresIn: config_1.config.jwt.accessTtl });
}
function signRefreshToken(subject) {
    return jsonwebtoken_1.default.sign({ sub: subject }, config_1.config.jwt.refreshSecret, {
        expiresIn: `${config_1.config.jwt.refreshTtlDays}d`,
    });
}
function verifyAccessToken(token) {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwt.secret);
        if (typeof decoded === "string")
            throw new Error("invalid token");
        return decoded;
    }
    catch {
        throw new errors_1.UnauthorizedError("Invalid or expired access token");
    }
}
function verifyRefreshToken(token) {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwt.refreshSecret);
        if (typeof decoded === "string")
            throw new Error("invalid token");
        return { sub: String(decoded.sub) };
    }
    catch {
        throw new errors_1.UnauthorizedError("Invalid or expired refresh token");
    }
}
exports.default = { signAccessToken, signRefreshToken: signRefreshToken, verifyAccessToken, verifyRefreshToken };
//# sourceMappingURL=index.js.map