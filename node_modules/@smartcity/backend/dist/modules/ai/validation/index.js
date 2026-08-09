"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categorizeSchema = void 0;
const zod_1 = require("zod");
exports.categorizeSchema = zod_1.z.object({
    title: zod_1.z.string().trim().min(3, "title must be at least 3 characters"),
    description: zod_1.z.string().trim().min(10, "description must be at least 10 characters"),
});
//# sourceMappingURL=index.js.map