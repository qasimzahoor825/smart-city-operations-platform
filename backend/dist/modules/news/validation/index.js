"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateNewsSchema = exports.createNewsSchema = void 0;
const zod_1 = require("zod");
exports.createNewsSchema = zod_1.z.object({
    title: zod_1.z.string().min(3, "title must be at least 3 characters"),
    summary: zod_1.z.string().min(5, "summary must be at least 5 characters"),
    content: zod_1.z.string().min(10, "content must be at least 10 characters"),
    category: zod_1.z.string().min(2, "category is required"),
    published: zod_1.z.boolean().optional(),
    publishedAt: zod_1.z.string().optional(),
});
exports.updateNewsSchema = zod_1.z.object({
    title: zod_1.z.string().min(3).optional(),
    summary: zod_1.z.string().min(5).optional(),
    content: zod_1.z.string().min(10).optional(),
    category: zod_1.z.string().min(2).optional(),
    published: zod_1.z.boolean().optional(),
});
//# sourceMappingURL=index.js.map