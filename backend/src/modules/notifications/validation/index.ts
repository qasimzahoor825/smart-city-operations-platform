import { z } from "zod";
import { NotificationType } from "@prisma/client";

export const sendNotificationSchema = z.object({
  userId: z.string().min(1, "userId is required"),
  title: z.string().min(1, "title is required"),
  message: z.string().min(1, "message is required"),
  type: z.nativeEnum(NotificationType).optional(),
  channel: z.string().optional(),
  payload: z.record(z.unknown()).optional(),
});

export const updatePreferencesSchema = z.object({
  email: z.boolean().optional(),
  push: z.boolean().optional(),
  sms: z.boolean().optional(),
  categories: z.array(z.string()).min(1, "At least one category is required").optional(),
});

export const notificationParamsSchema = z.object({
  id: z.string().min(1, "id is required"),
});