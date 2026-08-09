"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.departmentIdParamSchema = exports.assignOfficersSchema = exports.updateDepartmentSchema = exports.createDepartmentSchema = void 0;
const zod_1 = require("zod");
exports.createDepartmentSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "Department name is required"),
    code: zod_1.z.string().min(2, "Department code is required"),
    description: zod_1.z.string().optional(),
});
exports.updateDepartmentSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).optional(),
    code: zod_1.z.string().min(2).optional(),
    description: zod_1.z.string().nullable().optional(),
    managerId: zod_1.z.string().nullable().optional(),
});
exports.assignOfficersSchema = zod_1.z.object({
    officerIds: zod_1.z.array(zod_1.z.string().min(1)).min(1, "At least one officer is required"),
});
exports.departmentIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, "Department id is required"),
});
//# sourceMappingURL=index.js.map