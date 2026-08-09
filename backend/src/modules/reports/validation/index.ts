import { z } from "zod";

export const exportReportQuerySchema = z.object({
  format: z.enum(["json", "csv"]),
});