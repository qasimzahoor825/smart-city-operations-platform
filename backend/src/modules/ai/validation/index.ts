import { z } from "zod";

export const categorizeSchema = z.object({
  title: z.string().trim().min(3, "title must be at least 3 characters"),
  description: z.string().trim().min(10, "description must be at least 10 characters"),
});

export const chatSchema = z.object({
  message: z.string().trim().min(2, "message must be at least 2 characters").max(1000, "message is too long"),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(1000),
      }),
    )
    .max(20)
    .optional(),
});

export const validateImageSchema = z.object({
  imageDataUrl: z
    .string()
    .min(20, "image data is invalid")
    .max(5_000_000, "image is too large")
    .refine((v) => v.startsWith("data:image/"), "must be a valid image data URL"),
  category: z.string().trim().min(2, "category is required").max(40),
});