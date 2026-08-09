import { z } from "zod";

export const updateSettingsSchema = z.object({
  platformName: z.string().min(1, "platformName is required").optional(),
  maintenanceMode: z.boolean().optional(),
  allowRegistrations: z.boolean().optional(),
  allowPublicComplaints: z.boolean().optional(),
  notificationsEnabled: z.boolean().optional(),
});