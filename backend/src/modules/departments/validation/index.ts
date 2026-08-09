import { z } from "zod";

export const createDepartmentSchema = z.object({
  name: z.string().min(2, "Department name is required"),
  code: z.string().min(2, "Department code is required"),
  description: z.string().optional(),
});

export const updateDepartmentSchema = z.object({
  name: z.string().min(2).optional(),
  code: z.string().min(2).optional(),
  description: z.string().nullable().optional(),
  managerId: z.string().nullable().optional(),
});

export const assignOfficersSchema = z.object({
  officerIds: z.array(z.string().min(1)).min(1, "At least one officer is required"),
});

export const departmentIdParamSchema = z.object({
  id: z.string().min(1, "Department id is required"),
});