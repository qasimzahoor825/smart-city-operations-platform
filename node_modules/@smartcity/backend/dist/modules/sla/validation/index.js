"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.slaIdParamSchema = exports.updateSlaRuleSchema = exports.createSlaRuleSchema = exports.slaPrioritySchema = void 0;
const zod_1 = require("zod");
exports.slaPrioritySchema = zod_1.z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);
exports.createSlaRuleSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "Rule name is required"),
    priority: exports.slaPrioritySchema,
    category: zod_1.z.string().nullable().optional(),
    departmentId: zod_1.z.string().nullable().optional(),
    hours: zod_1.z.number().positive("SLA hours must be positive"),
    active: zod_1.z.boolean().optional().default(true),
});
exports.updateSlaRuleSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "Rule name is required").optional(),
    priority: exports.slaPrioritySchema.optional(),
    category: zod_1.z.string().nullable().optional(),
    departmentId: zod_1.z.string().nullable().optional(),
    hours: zod_1.z.number().positive("SLA hours must be positive").optional(),
    active: zod_1.z.boolean().optional(),
});
exports.slaIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, "SLA rule id is required"),
});
//# sourceMappingURL=index.js.map