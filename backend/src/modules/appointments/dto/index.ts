import { AppointmentStatus } from "@prisma/client";
import { UserRole } from "@smartcity/common";

export interface CreateAppointmentDto {
  title: string;
  description?: string;
  scheduledAt: string;
  departmentId?: string;
  durationMinutes?: number;
}

export interface AppointmentStatusDto {
  status: AppointmentStatus;
  note?: string;
}

export interface AppointmentQuery {
  page?: number;
  limit?: number;
  citizenId?: string;
  departmentId?: string;
  status?: AppointmentStatus;
  search?: string;
}

export interface AppointmentStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  byStatus: Record<AppointmentStatus, number>;
}

/** Authenticated caller captured from the JWT, passed into service methods. */
export interface Actor {
  id: string;
  email: string;
  role: UserRole;
  departmentId?: string | null;
}
