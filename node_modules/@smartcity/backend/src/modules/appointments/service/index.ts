import { AppointmentStatus } from "@prisma/client";
import {
  AppError,
  ForbiddenError,
  NotFoundError,
  UserRole,
  ValidationError,
  paginate,
  type Pagination,
} from "@smartcity/common";
import {
  appointmentRepository,
  type StoredAppointment,
} from "../repository";
import { authRepository } from "../../auth/repository";
import type {
  Actor,
  AppointmentQuery,
  AppointmentStats,
  AppointmentStatusDto,
  CreateAppointmentDto,
} from "../dto";

const APPOINTMENT_STATUSES: AppointmentStatus[] = [
  AppointmentStatus.PENDING,
  AppointmentStatus.CONFIRMED,
  AppointmentStatus.COMPLETED,
  AppointmentStatus.CANCELLED,
];

const STAFF_ROLES: UserRole[] = [UserRole.OFFICER, UserRole.DEPARTMENT_HEAD, UserRole.SUPER_ADMIN];

const DEPARTMENT_NAMES: Record<string, string> = {
  "dept-public-works": "Public Works",
  "dept-water-sanitation": "Water & Sanitation",
  "dept-health-transport": "Public Health & Transport",
};

const ALLOWED_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  [AppointmentStatus.PENDING]: [AppointmentStatus.CONFIRMED, AppointmentStatus.CANCELLED],
  [AppointmentStatus.CONFIRMED]: [AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED],
  [AppointmentStatus.COMPLETED]: [],
  [AppointmentStatus.CANCELLED]: [],
};

function isStatus(value: unknown): value is AppointmentStatus {
  return typeof value === "string" && (APPOINTMENT_STATUSES as string[]).includes(value);
}

function emptyStatusCount(): Record<AppointmentStatus, number> {
  return {
    [AppointmentStatus.PENDING]: 0,
    [AppointmentStatus.CONFIRMED]: 0,
    [AppointmentStatus.COMPLETED]: 0,
    [AppointmentStatus.CANCELLED]: 0,
  };
}

function assertCanManage(appointment: StoredAppointment, actor: Actor): void {
  if ((STAFF_ROLES as UserRole[]).includes(actor.role)) return;
  if (actor.role === UserRole.CITIZEN && appointment.citizenId === actor.id) return;
  throw new ForbiddenError("You can only manage your own appointments");
}

function displayName(actor: Actor): string {
  const user = authRepository.users.findById(actor.id);
  return user?.fullName ?? actor.email;
}

export const appointmentService = {
  async list(query: AppointmentQuery = {}): Promise<{ items: StoredAppointment[]; pagination: Pagination }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    if (query.status !== undefined && !isStatus(query.status)) {
      throw new AppError(`Invalid status. Allowed: ${APPOINTMENT_STATUSES.join(", ")}`, 422);
    }
    const q = (query.search ?? "").trim().toLowerCase();
    const items = appointmentRepository.appointments.query({
      searchFields: ["title", "description", "citizenName", "departmentName"],
      search: q || undefined,
      filter: (a) =>
        (query.citizenId === undefined || a.citizenId === query.citizenId) &&
        (query.departmentId === undefined || a.departmentId === query.departmentId) &&
        (query.status === undefined || a.status === query.status),
      sort: (a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime(),
    });
    const { items: paged, pagination } = paginate(items, page, limit);
    return { items: paged, pagination };
  },

  async getById(id: string): Promise<StoredAppointment> {
    const appointment = appointmentRepository.appointments.findById(id);
    if (!appointment) throw new NotFoundError("Appointment not found");
    return appointment;
  },

  async create(actor: Actor, dto: CreateAppointmentDto): Promise<StoredAppointment> {
    if (!dto.title || !dto.title.trim()) throw new ValidationError({ title: "title is required" });
    if (!dto.scheduledAt) throw new ValidationError({ scheduledAt: "scheduledAt is required" });

    const scheduled = new Date(dto.scheduledAt);
    if (Number.isNaN(scheduled.getTime())) {
      throw new ValidationError(
        { scheduledAt: "scheduledAt must be a valid ISO datetime" },
        "scheduledAt must be a valid ISO datetime",
      );
    }

    const now = new Date().toISOString();
    const departmentId = dto.departmentId ?? "dept-public-works";
    return appointmentRepository.appointments.create({
      title: dto.title.trim(),
      description: dto.description?.trim() || null,
      scheduledAt: scheduled.toISOString(),
      status: AppointmentStatus.PENDING,
      citizenId: actor.id,
      citizenName: displayName(actor),
      departmentId,
      departmentName: departmentId ? DEPARTMENT_NAMES[departmentId] ?? "Department" : null,
      durationMinutes: dto.durationMinutes ?? 30,
      createdAt: now,
      updatedAt: now,
    } as unknown as StoredAppointment);
  },

  async updateStatus(id: string, actor: Actor, dto: AppointmentStatusDto): Promise<StoredAppointment> {
    const appointment = await this.getById(id);
    if (!isStatus(dto.status)) {
      throw new AppError(`Invalid status. Allowed: ${APPOINTMENT_STATUSES.join(", ")}`, 422);
    }

    assertCanManage(appointment, actor);
    if (actor.role === UserRole.CITIZEN && dto.status !== AppointmentStatus.CANCELLED) {
      throw new ForbiddenError("Citizens can only cancel their own appointments");
    }

    const allowed = ALLOWED_TRANSITIONS[appointment.status];
    if (!(allowed as AppointmentStatus[]).includes(dto.status) && dto.status !== appointment.status) {
      throw new AppError(
        `Invalid status transition from ${appointment.status} to ${dto.status}. Allowed: ${allowed.join(", ")}`,
        422,
      );
    }

    const updated = appointmentRepository.appointments.update(id, {
      status: dto.status,
      updatedAt: new Date().toISOString(),
    } as Partial<StoredAppointment>);
    if (!updated) throw new NotFoundError("Appointment not found");
    return updated;
  },

  async remove(id: string, actor: Actor): Promise<void> {
    const appointment = await this.getById(id);
    assertCanManage(appointment, actor);
    appointmentRepository.appointments.delete(id);
  },

  async stats(): Promise<AppointmentStats> {
    const appointments = appointmentRepository.appointments.all();
    const byStatus = emptyStatusCount();
    for (const a of appointments) byStatus[a.status] += 1;
    return {
      total: appointments.length,
      pending: byStatus[AppointmentStatus.PENDING],
      confirmed: byStatus[AppointmentStatus.CONFIRMED],
      completed: byStatus[AppointmentStatus.COMPLETED],
      cancelled: byStatus[AppointmentStatus.CANCELLED],
      byStatus,
    };
  },
};

export default appointmentService;