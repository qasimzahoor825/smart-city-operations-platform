import { z } from "zod";

export const ingestSchema = z.object({
  sensorId: z.string().trim().min(1, "sensorId is required"),
  metricValue: z.number().finite("metricValue must be a finite number"),
});
