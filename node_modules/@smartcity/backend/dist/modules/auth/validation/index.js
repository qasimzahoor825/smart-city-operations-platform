"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfileSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.changePasswordSchema = exports.refreshSchema = exports.registerSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email address"),
    password: zod_1.z.string().min(8, "Password must be at least 8 characters"),
});
exports.registerSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2, "Full name is required"),
    email: zod_1.z.string().email("Invalid email address"),
    password: zod_1.z.string().min(8, "Password must be at least 8 characters"),
    phoneNumber: zod_1.z.string().optional(),
    role: zod_1.z.enum(["CITIZEN", "OFFICER", "DEPARTMENT_HEAD", "SUPER_ADMIN"]).optional(),
    departmentId: zod_1.z.string().optional(),
});
exports.refreshSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, "refreshToken is required"),
});
exports.changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(1, "currentPassword is required"),
    newPassword: zod_1.z.string().min(8, "newPassword must be at least 8 characters"),
});
exports.forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email address"),
});
exports.resetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string().min(1, "token is required"),
    password: zod_1.z.string().min(8, "password must be at least 8 characters"),
});
exports.updateProfileSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2).optional(),
    phoneNumber: zod_1.z.string().optional(),
    email: zod_1.z.string().email().optional(),
    avatar: zod_1.z.string().optional(),
});
//# sourceMappingURL=index.js.map