import { AssetCategory, AssetStatus } from "@prisma/client";
import { UserRole } from "@smartcity/common";

export interface CreateAssetDto {
  name: string;
  category?: AssetCategory;
  status?: AssetStatus;
  latitude?: number | null;
  longitude?: number | null;
  address?: string;
  imageUrl?: string;
  department: string;
  maintainedBy?: string;
}

export interface UpdateAssetStatusDto {
  status: AssetStatus;
  note?: string;
}

export interface CreateInspectionDto {
  status: string;
  findings: string;
}

export interface AssetQuery {
  page?: number;
  limit?: number;
  category?: AssetCategory;
  status?: AssetStatus;
  search?: string;
}

export interface AssetStats {
  total: number;
  byStatus: Record<AssetStatus, number>;
  byCategory: Record<AssetCategory, number>;
}

/** Authenticated caller captured from the JWT, passed into service methods. */
export interface Actor {
  id: string;
  email: string;
  role: UserRole;
  departmentId?: string | null;
}