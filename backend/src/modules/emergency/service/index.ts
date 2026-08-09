import { EmergencyStatus, EmergencyType, TicketPriority } from "@prisma/client";
import {
  AppError,
  ForbiddenError,
  NotFoundError,
  UserRole,
  ValidationError,
  generateRef,
  paginate,
  type Pagination,
} from "@smartcity/common";
import { authRepository } from "../../auth/repository";
import { notificationService } from "../../notifications/service";
import { emitToStaff, emitToUser } from "../../../core/socket";
import {
  emergencyRepository,
  type StoredEmergency,
} from "../repository";
import type {
  Actor,
  CreateEmergencyDto,
  DispatchEmergencyDto,
  EmergencyQuery,
  EmergencyStats,
} from "../dto";

const EMERGENCY_STATUSES: EmergencyStatus[] = [
  EmergencyStatus.REPORTED,
  EmergencyStatus.ACKNOWLEDGED,
  EmergencyStatus.DISPATCHED,
  EmergencyStatus.ON_SCENE,
  EmergencyStatus.RESOLVED,
  EmergencyStatus.CLOSED,
];

const EMERGENCY_TYPES: EmergencyType[] = [
  EmergencyType.FIRE,
  EmergencyType.MEDICAL,
  EmergencyType.FLOOD,
  EmergencyType.ACCIDENT,
  EmergencyType.PUBLIC_ALERT,
];

const SEVERITIES: TicketPriority[] = [
  TicketPriority.LOW,
  TicketPriority.MEDIUM,
  TicketPriority.HIGH,
  TicketPriority.CRITICAL,
];

const STAFF_ROLES: UserRole[] = [UserRole.OFFICER, UserRole.DEPARTMENT_HEAD, UserRole.SUPER_ADMIN];
const ACTIVE_STATUSES: EmergencyStatus[] = [
  EmergencyStatus.REPORTED,
  EmergencyStatus.ACKNOWLEDGED,
  EmergencyStatus.DISPATCHED,
  EmergencyStatus.ON_SCENE,
];

function isStatus(value: unknown): value is EmergencyStatus {
  return typeof value === "string" && (EMERGENCY_STATUSES as string[]).includes(value);
}

function isType(value: unknown): value is EmergencyType {
  return typeof value === "string" && (EMERGENCY_TYPES as string[]).includes(value);
}

function isSeverity(value: unknown): value is TicketPriority {
  return typeof value === "string" && (SEVERITIES as string[]).includes(value);
}

function emptyStatusCount(): Record<EmergencyStatus, number> {
  return {
    [EmergencyStatus.REPORTED]: 0,
    [EmergencyStatus.ACKNOWLEDGED]: 0,
    [EmergencyStatus.DISPATCHED]: 0,
    [EmergencyStatus.ON_SCENE]: 0,
    [EmergencyStatus.RESOLVED]: 0,
    [EmergencyStatus.CLOSED]: 0,
  };
}

function emptyTypeCount(): Record<EmergencyType, number> {
  return {
    [EmergencyType.FIRE]: 0,
    [EmergencyType.MEDICAL]: 0,
    [EmergencyType.FLOOD]: 0,
    [EmergencyType.ACCIDENT]: 0,
    [EmergencyType.PUBLIC_ALERT]: 0,
  };
}

function displayName(actor: Actor): string {
  const user = authRepository.users.findById(actor.id);
  return user?.fullName ?? actor.email;
}

export const emergencyService = {
  async list(query: EmergencyQuery = {}): Promise<{ items: StoredEmergency[]; pagination: Pagination }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    if (query.status !== undefined && !isStatus(query.status)) {
      throw new AppError(`Invalid status. Allowed: ${EMERGENCY_STATUSES.join(", ")}`, 422);
    }
    if (query.type !== undefined && !isType(query.type)) {
      throw new AppError(`Invalid type. Allowed: ${EMERGENCY_TYPES.join(", ")}`, 422);
    }
    if (query.severity !== undefined && !isSeverity(query.severity)) {
      throw new AppError(`Invalid severity. Allowed: ${SEVERITIES.join(", ")}`, 422);
    }
    const q = (query.search ?? "").trim().toLowerCase();
    const items = emergencyRepository.emergencies.query({
      searchFields: ["title", "description", "address", "ref"],
      search: q || undefined,
      filter: (e) =>
        (query.status === undefined || e.status === query.status) &&
        (query.type === undefined || e.type === query.type) &&
        (query.severity === undefined || e.severity === query.severity),
      sort: (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    });
    const { items: paged, pagination } = paginate(items, page, limit);
    return { items: paged, pagination };
  },

  async getById(id: string): Promise<StoredEmergency> {
    const emergency = emergencyRepository.emergencies.findById(id);
    if (!emergency) throw new NotFoundError("Emergency not found");
    return emergency;
  },

  async create(actor: Actor, dto: CreateEmergencyDto): Promise<StoredEmergency> {
    if (!dto.title || !dto.title.trim()) throw new ValidationError({ title: "title is required" });
    if (!dto.description || !dto.description.trim()) {
      throw new ValidationError({ description: "description is required" });
    }
    if (!isType(dto.type)) throw new AppError(`Invalid type. Allowed: ${EMERGENCY_TYPES.join(", ")}`, 422);
    const severity = dto.severity ?? TicketPriority.HIGH;
    if (!isSeverity(severity)) {
      throw new AppError(`Invalid severity. Allowed: ${SEVERITIES.join(", ")}`, 422);
    }

    const now = new Date().toISOString();
    const reportedAt = new Date().toISOString();
    const location =
      dto.latitude !== undefined && dto.latitude !== null && dto.longitude !== undefined && dto.longitude !== null
        ? [Number(dto.longitude), Number(dto.latitude)]
        : null;
    const emergency = emergencyRepository.emergencies.create({
      ref: generateRef("EMG"),
      type: dto.type,
      title: dto.title.trim(),
      description: dto.description.trim(),
      severity,
      status: EmergencyStatus.REPORTED,
      latitude: dto.latitude ?? null,
      longitude: dto.longitude ?? null,
      location,
      address: dto.address?.trim() || null,
      reportedById: actor.id,
      reportedByName: displayName(actor),
      dispatchedUnit: null,
      timeline: [`Reported by ${displayName(actor)} at ${reportedAt}`],
      createdAt: now,
      updatedAt: now,
    } as unknown as StoredEmergency);

    void notificationService.notify(
      emergency.reportedById ?? actor.id,
      "Emergency report received",
      `${emergency.ref}: ${emergency.title}`,
      { payload: { emergencyId: emergency.id, ref: emergency.ref, type: emergency.type } },
    );

    const eventPayload = {
      emergencyId: emergency.id,
      ref: emergency.ref,
      type: emergency.type,
      severity: emergency.severity,
      status: emergency.status,
      latitude: emergency.latitude,
      longitude: emergency.longitude,
      title: emergency.title,
    };
    emitToStaff("emergency.created", eventPayload);
    if (emergency.reportedById) emitToUser(emergency.reportedById, "emergency.created", eventPayload);

    authRepository.users
      .all()
      .filter((u) => (STAFF_ROLES as UserRole[]).includes(u.role))
      .forEach((u) => {
        void notificationService.notify(
          u.id,
          `New ${dto.type.replace("_", " ")} emergency`,
          `${emergency.ref}: ${emergency.title}`,
          { payload: { emergencyId: emergency.id, ref: emergency.ref } },
        );
      });
    return emergency;
  },

  async dispatch(id: string, dto: DispatchEmergencyDto, actor: Actor): Promise<StoredEmergency> {
    const emergency = await this.getById(id);
    if (!isStatus(dto.status)) {
      throw new AppError(`Invalid status. Allowed: ${EMERGENCY_STATUSES.join(", ")}`, 422);
    }
    if (emergency.status === EmergencyStatus.RESOLVED && dto.status !== EmergencyStatus.RESOLVED) {
      throw new AppError("A resolved emergency cannot be re-dispatched", 422);
    }
    if (!(STAFF_ROLES as UserRole[]).includes(actor.role)) {
      throw new ForbiddenError("Only emergency response staff can dispatch units");
    }

    const now = new Date();
    const unitNote = dto.unit ? `Unit ${dto.unit} ` : "";
    const entry = `${unitNote}${dto.note?.trim() || `Status changed to ${dto.status}`} at ${now.toISOString()}`;
    const timeline = [...emergency.timeline, entry];

    const updated = emergencyRepository.emergencies.update(id, {
      status: dto.status,
      dispatchedUnit: dto.unit?.trim() || emergency.dispatchedUnit,
      timeline,
      updatedAt: now.toISOString(),
    } as Partial<StoredEmergency>);
    if (!updated) throw new NotFoundError("Emergency not found");

    emitToStaff("emergency.updated", {
      emergencyId: id,
      ref: emergency.ref,
      status: dto.status,
      unit: dto.unit ?? null,
    });
    if (emergency.reportedById) {
      void notificationService.notify(
        emergency.reportedById,
        "Emergency update",
        `${emergency.ref}: ${dto.note?.trim() || dto.status.replace("_", " ")}`,
        { payload: { emergencyId: id, ref: emergency.ref, status: dto.status } },
      );
    }
    return updated;
  },

  async stats(): Promise<EmergencyStats> {
    const emergencies = emergencyRepository.emergencies.all();
    const byStatus = emptyStatusCount();
    const byType = emptyTypeCount();
    let active = 0;
    let resolved = 0;
    for (const e of emergencies) {
      byStatus[e.status] += 1;
      byType[e.type] += 1;
      if ((ACTIVE_STATUSES as EmergencyStatus[]).includes(e.status)) active += 1;
      if (e.status === EmergencyStatus.RESOLVED) resolved += 1;
    }
    return { total: emergencies.length, active, resolved, byStatus, byType };
  },
};

export default emergencyService;