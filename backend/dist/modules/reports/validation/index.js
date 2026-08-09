"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportReportQuerySchema = void 0;
const zod_1 = require("zod");
exports.exportReportQuerySchema = zod_1.z.object({
    format: zod_1.z.enum(["json", "csv"]),
});
//# sourceMappingURL=index.js.map