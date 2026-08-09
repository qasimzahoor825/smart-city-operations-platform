"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uid = exports.toRichText = exports.parsePagination = exports.paginate = exports.generateRef = exports.createListResponse = exports.createApiResponse = void 0;
exports.asyncHandler = asyncHandler;
exports.toSlug = toSlug;
exports.clampDate = clampDate;
var common_1 = require("@smartcity/common");
Object.defineProperty(exports, "createApiResponse", { enumerable: true, get: function () { return common_1.createApiResponse; } });
Object.defineProperty(exports, "createListResponse", { enumerable: true, get: function () { return common_1.createListResponse; } });
Object.defineProperty(exports, "generateRef", { enumerable: true, get: function () { return common_1.generateRef; } });
Object.defineProperty(exports, "paginate", { enumerable: true, get: function () { return common_1.paginate; } });
Object.defineProperty(exports, "parsePagination", { enumerable: true, get: function () { return common_1.parsePagination; } });
Object.defineProperty(exports, "toRichText", { enumerable: true, get: function () { return common_1.toRichText; } });
Object.defineProperty(exports, "uid", { enumerable: true, get: function () { return common_1.uid; } });
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res)).catch(next);
    };
}
function toSlug(value) {
    return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
function clampDate(iso) {
    if (!iso)
        return null;
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
}
//# sourceMappingURL=index.js.map