"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiLimiter = exports.authLimiter = void 0;
exports.validate = validate;
exports.requireBody = requireBody;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const errors_1 = require("../core/errors");
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60_000,
    limit: 30,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { success: false, message: "Too many requests. Try again later." },
});
exports.apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60_000,
    limit: 150,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { success: false, message: "Too many requests. Please slow down." },
});
/** Joi/zod-style validation helper used by route validators. */
function validate(checks) {
    return (_req, _res, next) => {
        try {
            checks.forEach((check) => check());
            next();
        }
        catch (err) {
            next(err);
        }
    };
}
function requireBody(...fields) {
    return (req, _res, next) => {
        const missing = fields.filter((f) => req.body?.[f] === undefined || req.body[f] === null || req.body[f] === "");
        if (missing.length > 0) {
            throw new errors_1.AppError(`Missing required field(s): ${missing.join(", ")}`, 422);
        }
        next();
    };
}
exports.default = { apiLimiter: exports.apiLimiter, authLimiter: exports.authLimiter, requireBody, validate: requireBody };
//# sourceMappingURL=rate-limit.js.map