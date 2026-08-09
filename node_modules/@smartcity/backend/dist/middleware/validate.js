"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = validateBody;
exports.validateParams = validateParams;
exports.validateQuery = validateQuery;
exports.isEnumValue = isEnumValue;
exports.assertEnum = assertEnum;
const common_1 = require("@smartcity/common");
/** Validates req.body against a Zod schema; attaches `.parsedBody` for routes. */
function validateBody(schema) {
    return (req, _res, next) => {
        const result = schema.safeParse(req.body ?? {});
        if (!result.success) {
            const errors = result.error.flatten().fieldErrors;
            throw new common_1.AppError("Validation failed", 422, errors);
        }
        req.parsedBody = result.data;
        next();
    };
}
function validateParams(schema) {
    return (req, _res, next) => {
        const result = schema.safeParse(req.params ?? {});
        if (!result.success) {
            throw new common_1.AppError("Invalid path parameters", 422, result.error.flatten().fieldErrors);
        }
        next();
    };
}
function validateQuery(schema) {
    return (req, _res, next) => {
        const result = schema.safeParse(req.query ?? {});
        if (!result.success) {
            throw new common_1.AppError("Invalid query parameters", 422, result.error.flatten().fieldErrors);
        }
        req.parsedQuery = result.data;
        next();
    };
}
function isEnumValue(value, enums) {
    const values = Array.isArray(enums) ? enums : Object.values(enums);
    return typeof value === "string" && values.includes(value);
}
function assertEnum(value, enums, field = "value") {
    if (!isEnumValue(value, enums)) {
        const allowed = (Array.isArray(enums) ? enums : Object.values(enums)).join(", ");
        throw new common_1.AppError(`Invalid ${field}. Allowed: ${allowed}`, 422);
    }
    return value;
}
//# sourceMappingURL=validate.js.map