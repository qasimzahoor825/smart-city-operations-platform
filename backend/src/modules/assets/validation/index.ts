import { z } from "zod";
import { AssetCategory, AssetStatus } from "@prisma/client";

export const createAssetSchema = z.object({
  name: z.string().min(2, "name is required"),
  category: z.nativeEnum(AssetCategory).optional(),
  status: z.nativeEnum(AssetStatus).optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  address: z.string().optional(),
  imageUrl: z.string().optional(),
  department: z.string().min(1, "department is required"),
  maintainedBy: z.string().optional(),
});

export const updateAssetStatusSchema = z.object({
  status: z.nativeEnum(AssetStatus),
  note: z.string().optional(),
});

export const createInspectionSchema = z.object({
  status: z.string().min(1, "status is required"),
  findings: z.string().min(1, "findings is required"),
});