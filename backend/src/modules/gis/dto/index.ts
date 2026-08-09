import { UserRole } from "@smartcity/common";

export type MarkerType = "complaint" | "asset" | "hospital" | "police" | "emergency";

export const MARKER_TYPES: MarkerType[] = ["complaint", "asset", "hospital", "police", "emergency"];

export interface CityLayer {
  id: string;
  name: string;
  visible: boolean;
  color: string;
  description: string;
}

export interface CreateMarkerDto {
  type: MarkerType;
  title: string;
  latitude: number;
  longitude: number;
  status?: string;
  severity?: string;
  address?: string;
}

export interface MarkerQuery {
  page?: number;
  limit?: number;
  type?: MarkerType;
  status?: string;
  bbox?: [number, number, number, number];
  search?: string;
}

export interface MarkerStats {
  total: number;
  byType: Record<MarkerType, number>;
}

/** Authenticated caller captured from the JWT, passed into service methods. */
export interface Actor {
  id: string;
  email: string;
  role: UserRole;
  departmentId?: string | null;
}