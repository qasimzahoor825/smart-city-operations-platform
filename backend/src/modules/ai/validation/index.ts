import { z } from "zod";

export const categorizeSchema = z.object({
  title: z.string().trim().min(3, "title must be at least 3 characters"),
  description: z.string().trim().min(10, "description must be at least 10 characters"),
});