"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateImageSchema = exports.chatSchema = exports.categorizeSchema = void 0;
const zod_1 = require("zod");
exports.categorizeSchema = zod_1.z.object({
    title: zod_1.z.string().trim().min(3, "title must be at least 3 characters"),
    description: zod_1.z.string().trim().min(10, "description must be at least 10 characters"),
});
exports.chatSchema = zod_1.z.object({
    message: zod_1.z.string().trim().min(2, "message must be at least 2 characters").max(1000, "message is too long"),
    history: zod_1.z
        .array(zod_1.z.object({
        role: zod_1.z.enum(["user", "assistant"]),
        content: zod_1.z.string().max(1000),
    }))
        .max(20)
        .optional(),
});
exports.validateImageSchema = zod_1.z.object({
    imageDataUrl: zod_1.z
        .string()
        .min(20, "image data is invalid")
        .max(5_000_000, "image is too large")
        .refine((v) => v.startsWith("data:image/"), "must be a valid image data URL"),
    category: zod_1.z.string().trim().min(2, "category is required").max(40),
});
//# sourceMappingURL=index.js.map