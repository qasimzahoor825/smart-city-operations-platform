import { z } from "zod";

export const slaPrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);

export const createSlaRuleSchema = z.object({
  name: z.string().min(2, "Rule name is required"),
  priority: slaPrioritySchema,
  category: z.string().nullable().optional(),
  departmentId: z.string().nullable().optional(),
  hours: z.number().positive("SLA hours must be positive"),
  active: z.boolean().optional().default(true),
});

export const updateSlaRuleSchema = z.object({
  name: z.string().min(2, "Rule name is required").optional(),
  priority: slaPrioritySchema.optional(),
  category: z.string().nullable().optional(),
  departmentId: z.string().nullable().optional(),
  hours: z.number().positive("SLA hours must be positive").optional(),
  active: z.boolean().optional(),
});

export const slaIdParamSchema = z.object({
  id: z.string().min(1, "SLA rule id is required"),
});