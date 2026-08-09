"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUsersQuerySchema = exports.userIdParamSchema = exports.updateUserSchema = exports.createUserSchema = exports.userRoles = void 0;
const zod_1 = require("zod");
exports.userRoles = ["CITIZEN", "OFFICER", "DEPARTMENT_HEAD", "SUPER_ADMIN"];
exports.createUserSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2, "Full name is required"),
    email: zod_1.z.string().email("Invalid email address"),
    password: zod_1.z.string().min(8, "Password must be at least 8 characters").optional(),
    phoneNumber: zod_1.z.string().nullable().optional(),
    role: zod_1.z.enum(exports.userRoles).default("CITIZEN"),
    departmentId: zod_1.z.string().nullable().optional(),
    isEmailVerified: zod_1.z.boolean().optional(),
    active: zod_1.z.boolean().optional(),
});
exports.updateUserSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2, "Full name is required").optional(),
    email: zod_1.z.string().email("Invalid email address").optional(),
    phoneNumber: zod_1.z.string().nullable().optional(),
    role: zod_1.z.enum(exports.userRoles).optional(),
    departmentId: zod_1.z.string().nullable().optional(),
    avatar: zod_1.z.string().nullable().optional(),
    isEmailVerified: zod_1.z.boolean().optional(),
});
exports.userIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, "User id is required"),
});
exports.listUsersQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().optional(),
    limit: zod_1.z.coerce.number().int().positive().max(100).optional(),
    role: zod_1.z.enum(exports.userRoles).optional(),
    search: zod_1.z.string().optional(),
    departmentId: zod_1.z.string().optional(),
});
//# sourceMappingURL=index.js.map