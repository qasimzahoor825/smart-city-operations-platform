"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = exports.UnauthorizedError = exports.NotFoundError = exports.ForbiddenError = exports.ConflictError = exports.AppError = void 0;
exports.notFoundHandler = notFoundHandler;
exports.errorHandler = errorHandler;
var common_1 = require("@smartcity/common");
Object.defineProperty(exports, "AppError", { enumerable: true, get: function () { return common_1.AppError; } });
Object.defineProperty(exports, "ConflictError", { enumerable: true, get: function () { return common_1.ConflictError; } });
Object.defineProperty(exports, "ForbiddenError", { enumerable: true, get: function () { return common_1.ForbiddenError; } });
Object.defineProperty(exports, "NotFoundError", { enumerable: true, get: function () { return common_1.NotFoundError; } });
Object.defineProperty(exports, "UnauthorizedError", { enumerable: true, get: function () { return common_1.UnauthorizedError; } });
Object.defineProperty(exports, "ValidationError", { enumerable: true, get: function () { return common_1.ValidationError; } });
const common_2 = require("@smartcity/common");
function notFoundHandler(_req, res) {
    res.status(404).json({ success: false, message: "Resource not found", timestamp: new Date().toISOString() });
}
function errorHandler(err, _req, res, _next) {
    if (err instanceof common_2.AppError) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errors: err.errors,
            timestamp: new Date().toISOString(),
        });
        return;
    }
    console.error("[Monolith] unhandled error:", err);
    res.status(500).json({ success: false, message: "Internal server error", timestamp: new Date().toISOString() });
}
//# sourceMappingURL=index.js.map