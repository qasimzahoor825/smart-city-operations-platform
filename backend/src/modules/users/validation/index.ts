import { z } from "zod";

export const userRoles = ["CITIZEN", "OFFICER", "DEPARTMENT_HEAD", "SUPER_ADMIN"] as const;

export const createUserSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
  phoneNumber: z.string().nullable().optional(),
  role: z.enum(userRoles).default("CITIZEN"),
  departmentId: z.string().nullable().optional(),
  isEmailVerified: z.boolean().optional(),
  active: z.boolean().optional(),
});

export const updateUserSchema = z.object({
  fullName: z.string().min(2, "Full name is required").optional(),
  email: z.string().email("Invalid email address").optional(),
  phoneNumber: z.string().nullable().optional(),
  role: z.enum(userRoles).optional(),
  departmentId: z.string().nullable().optional(),
  avatar: z.string().nullable().optional(),
  isEmailVerified: z.boolean().optional(),
});

export const userIdParamSchema = z.object({
  id: z.string().min(1, "User id is required"),
});

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(200).optional(),
  role: z.enum(userRoles).optional(),
  search: z.string().optional(),
  departmentId: z.string().optional(),
});