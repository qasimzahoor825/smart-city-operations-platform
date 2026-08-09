import { z } from "zod";

export const updateCitizenProfileSchema = z.object({
  fullName: z.string().min(2, "Full name is required").optional(),
  phoneNumber: z.string().nullable().optional(),
  avatar: z.string().nullable().optional(),
  ward: z.string().nullable().optional(),
  district: z.string().nullable().optional(),
});

export const citizenIdParamSchema = z.object({
  id: z.string().min(1, "Citizen id is required"),
});

export const listCitizensQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().optional(),
  ward: z.string().optional(),
});