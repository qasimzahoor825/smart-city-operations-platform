import { z } from "zod";

export const payBillSchema = z.object({
  billId: z.string().min(1, "billId is required"),
  method: z.string().min(1, "method is required").optional(),
});