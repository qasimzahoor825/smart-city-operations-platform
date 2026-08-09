import { z } from "zod";
import { MARKER_TYPES, type MarkerType } from "../dto";

export const createMarkerSchema = z.object({
  type: z.enum(MARKER_TYPES as [MarkerType, ...MarkerType[]]),
  title: z.string().min(2, "title must be at least 2 characters"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  status: z.string().optional(),
  severity: z.string().optional(),
  address: z.string().optional(),
});