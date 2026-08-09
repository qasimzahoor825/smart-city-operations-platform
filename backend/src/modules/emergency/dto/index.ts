import { EmergencyStatus, EmergencyType, TicketPriority } from "@prisma/client";
import { UserRole } from "@smartcity/common";

export interface CreateEmergencyDto {
  type: EmergencyType;
  title: string;
  description: string;
  severity?: TicketPriority;
  latitude?: number | null;
  longitude?: number | null;
  address?: string;
}

export interface DispatchEmergencyDto {
  status: EmergencyStatus;
  note?: string;
  unit?: string;
}

export interface EmergencyQuery {
  page?: number;
  limit?: number;
  status?: EmergencyStatus;
  type?: EmergencyType;
  severity?: TicketPriority;
  search?: string;
}

export interface EmergencyStats {
  total: number;
  active: number;
  resolved: number;
  byStatus: Record<EmergencyStatus, number>;
  byType: Record<EmergencyType, number>;
}

/** Authenticated caller captured from the JWT, passed into service methods. */
export interface Actor {
  id: string;
  email: string;
  role: UserRole;
  departmentId?: string | null;
}