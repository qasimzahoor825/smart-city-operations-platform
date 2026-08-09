import { z } from "zod";

export const createNewsSchema = z.object({
  title: z.string().min(3, "title must be at least 3 characters"),
  summary: z.string().min(5, "summary must be at least 5 characters"),
  content: z.string().min(10, "content must be at least 10 characters"),
  category: z.string().min(2, "category is required"),
  published: z.boolean().optional(),
  publishedAt: z.string().optional(),
});

export const updateNewsSchema = z.object({
  title: z.string().min(3).optional(),
  summary: z.string().min(5).optional(),
  content: z.string().min(10).optional(),
  category: z.string().min(2).optional(),
  published: z.boolean().optional(),
});