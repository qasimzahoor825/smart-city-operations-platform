import { z } from "zod";
import { AppointmentStatus } from "@prisma/client";

export const createAppointmentSchema = z.object({
  title: z.string().min(3, "title must be at least 3 characters"),
  description: z.string().optional(),
  scheduledAt: z.string().min(1, "scheduledAt must be an ISO datetime string"),
  departmentId: z.string().optional(),
  durationMinutes: z.number().int().positive().max(480).optional(),
});

export const appointmentStatusSchema = z.object({
  status: z.nativeEnum(AppointmentStatus),
  note: z.string().optional(),
});