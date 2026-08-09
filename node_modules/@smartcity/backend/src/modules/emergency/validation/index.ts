import { z } from "zod";
import { EmergencyStatus, EmergencyType, TicketPriority } from "@prisma/client";

export const createEmergencySchema = z.object({
  type: z.nativeEnum(EmergencyType),
  title: z.string().min(3, "title must be at least 3 characters"),
  description: z.string().min(5, "description must be at least 5 characters"),
  severity: z.nativeEnum(TicketPriority).optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  address: z.string().optional(),
});

export const dispatchEmergencySchema = z.object({
  status: z.nativeEnum(EmergencyStatus),
  note: z.string().optional(),
  unit: z.string().optional(),
});