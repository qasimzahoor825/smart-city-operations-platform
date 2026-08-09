import { TicketPriority, TicketStatus } from "@prisma/client";
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
import { emitToDepartment, emitToStaff, emitToUser } from "../../../core/socket";
import { authRepository } from "../../auth/repository";
import { departmentRepository } from "../../departments/repository";
import { notificationService } from "../../notifications/service";
import { slaService } from "../../sla/service";
import { auditService } from "../../audit/service";
import {
  complaintRepository,
  type StoredComplaint,
  type StoredComplaintComment,
  type StoredComplaintTimeline,
  type StoredFeedback,
} from "../repository";
import type {
  Actor,
  AssignComplaintDto,
  CommentDto,
  ComplaintQuery,
  ComplaintStats,
  ComplaintStatusDto,
  CreateComplaintDto,
  FeedbackDto,
  UpdateComplaintDto,
} from "../dto";

const TICKET_STATUSES: TicketStatus[] = [
  TicketStatus.SUBMITTED,
  TicketStatus.RECEIVED,
  TicketStatus.ASSIGNED,
  TicketStatus.UNDER_REVIEW,
  TicketStatus.FIELD_INSPECTION,
  TicketStatus.IN_PROGRESS,
  TicketStatus.RESOLVED,
  TicketStatus.CITIZEN_FEEDBACK,
  TicketStatus.CLOSED,
  TicketStatus.REJECTED,
  TicketStatus.ESCALATED,
  TicketStatus.CANCELLED,
];

const TICKET_PRIORITIES: TicketPriority[] = [
  TicketPriority.LOW,
  TicketPriority.MEDIUM,
  TicketPriority.HIGH,
  TicketPriority.CRITICAL,
];

const OPEN_STATUSES: TicketStatus[] = [
  TicketStatus.SUBMITTED,
  TicketStatus.RECEIVED,
  TicketStatus.ASSIGNED,
  TicketStatus.UNDER_REVIEW,
  TicketStatus.FIELD_INSPECTION,
  TicketStatus.IN_PROGRESS,
  TicketStatus.ESCALATED,
];
const RESOLVED_STATUSES: TicketStatus[] = [TicketStatus.RESOLVED, TicketStatus.CITIZEN_FEEDBACK, TicketStatus.CLOSED];
const TERMINAL_STATUSES: TicketStatus[] = [TicketStatus.CLOSED, TicketStatus.REJECTED, TicketStatus.CANCELLED];
const STAFF_ROLES: UserRole[] = [UserRole.OFFICER, UserRole.DEPARTMENT_HEAD, UserRole.SUPER_ADMIN];

/**
 * Workflow engine: which statuses can be transitioned to from each status.
 * Designed to satisfy the full complaint lifecycle while still allowing
 * real-world short-cuts (staff may resolve early, reject or cancel anytime
 * before a terminal state). Terminal states cannot be re-opened.
 */
const WORKFLOW_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  [TicketStatus.SUBMITTED]: [
    TicketStatus.RECEIVED,
    TicketStatus.ASSIGNED,
    TicketStatus.UNDER_REVIEW,
    TicketStatus.FIELD_INSPECTION,
    TicketStatus.IN_PROGRESS,
    TicketStatus.RESOLVED,
    TicketStatus.REJECTED,
    TicketStatus.ESCALATED,
    TicketStatus.CANCELLED,
  ],
  [TicketStatus.RECEIVED]: [
    TicketStatus.ASSIGNED,
    TicketStatus.UNDER_REVIEW,
    TicketStatus.FIELD_INSPECTION,
    TicketStatus.IN_PROGRESS,
    TicketStatus.RESOLVED,
    TicketStatus.REJECTED,
    TicketStatus.ESCALATED,
    TicketStatus.CANCELLED,
  ],
  [TicketStatus.ASSIGNED]: [
    TicketStatus.UNDER_REVIEW,
    TicketStatus.FIELD_INSPECTION,
    TicketStatus.IN_PROGRESS,
    TicketStatus.RESOLVED,
    TicketStatus.REJECTED,
    TicketStatus.ESCALATED,
    TicketStatus.CANCELLED,
  ],
  [TicketStatus.UNDER_REVIEW]: [
    TicketStatus.FIELD_INSPECTION,
    TicketStatus.IN_PROGRESS,
    TicketStatus.RESOLVED,
    TicketStatus.REJECTED,
    TicketStatus.ESCALATED,
    TicketStatus.CANCELLED,
  ],
  [TicketStatus.FIELD_INSPECTION]: [
    TicketStatus.UNDER_REVIEW,
    TicketStatus.IN_PROGRESS,
    TicketStatus.RESOLVED,
    TicketStatus.REJECTED,
    TicketStatus.ESCALATED,
    TicketStatus.CANCELLED,
  ],
  [TicketStatus.IN_PROGRESS]: [
    TicketStatus.RESOLVED,
    TicketStatus.REJECTED,
    TicketStatus.ESCALATED,
    TicketStatus.CANCELLED,
  ],
  [TicketStatus.RESOLVED]: [TicketStatus.CITIZEN_FEEDBACK, TicketStatus.CLOSED, TicketStatus.REJECTED],
  [TicketStatus.CITIZEN_FEEDBACK]: [TicketStatus.CLOSED, TicketStatus.REJECTED],
  [TicketStatus.ESCALATED]: [
    TicketStatus.UNDER_REVIEW,
    TicketStatus.FIELD_INSPECTION,
    TicketStatus.IN_PROGRESS,
    TicketStatus.RESOLVED,
    TicketStatus.REJECTED,
    TicketStatus.CANCELLED,
  ],
  [TicketStatus.CLOSED]: [],
  [TicketStatus.REJECTED]: [],
  [TicketStatus.CANCELLED]: [],
};

function notifyStaff(title: string, message: string, payload?: Record<string, unknown>): Promise<unknown[]> {
  return Promise.all(
    authRepository.users
      .all()
      .filter((u) => (STAFF_ROLES as UserRole[]).includes(u.role))
      .map((u) => notificationService.notify(u.id, title, message, { payload })),
  );
}

function isStatus(value: unknown): value is TicketStatus {
  return typeof value === "string" && (TICKET_STATUSES as string[]).includes(value);
}

function isPriority(value: unknown): value is TicketPriority {
  return typeof value === "string" && (TICKET_PRIORITIES as string[]).includes(value);
}

function emptyStatusCount(): Record<TicketStatus, number> {
  return {
    [TicketStatus.SUBMITTED]: 0,
    [TicketStatus.RECEIVED]: 0,
    [TicketStatus.ASSIGNED]: 0,
    [TicketStatus.UNDER_REVIEW]: 0,
    [TicketStatus.FIELD_INSPECTION]: 0,
    [TicketStatus.IN_PROGRESS]: 0,
    [TicketStatus.RESOLVED]: 0,
    [TicketStatus.CITIZEN_FEEDBACK]: 0,
    [TicketStatus.CLOSED]: 0,
    [TicketStatus.REJECTED]: 0,
    [TicketStatus.ESCALATED]: 0,
    [TicketStatus.CANCELLED]: 0,
  };
}

function emptyPriorityCount(): Record<TicketPriority, number> {
  return {
    [TicketPriority.LOW]: 0,
    [TicketPriority.MEDIUM]: 0,
    [TicketPriority.HIGH]: 0,
    [TicketPriority.CRITICAL]: 0,
  };
}

function pushTimeline(
  complaintId: string,
  status: TicketStatus,
  note: string,
  actorId?: string,
): StoredComplaintTimeline {
  return complaintRepository.timeline.create({
    complaintId,
    status,
    note,
    actorId: actorId ?? null,
    createdAt: new Date().toISOString(),
  } as unknown as StoredComplaintTimeline);
}

function assertCanManage(complaint: StoredComplaint, actor: Actor): void {
  if ((STAFF_ROLES as UserRole[]).includes(actor.role)) return;
  if (actor.role === UserRole.CITIZEN && complaint.citizenId === actor.id) return;
  throw new ForbiddenError("You can only manage your own complaints");
}

function displayName(actor: Actor): string {
  const user = authRepository.users.findById(actor.id);
  return user?.fullName ?? actor.email;
}

/** Attach comments + timeline so the API returns fully-hydrated complaints. */
function withDetails(c: StoredComplaint) {
  const comments = complaintRepository.comments
    .all()
    .filter((cm) => cm.complaintId === c.id)
    .map((cm) => ({
      id: cm.id,
      authorId: cm.authorId,
      author: cm.authorName,
      body: cm.body,
      createdAt: cm.createdAt,
    }));
  const timeline = complaintRepository.timeline
    .all()
    .filter((t) => t.complaintId === c.id)
    .map((t) => ({ status: t.status, note: t.note, actorId: t.actorId, createdAt: t.createdAt }))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const feedback = complaintRepository.feedback.all().filter((f) => f.complaintId === c.id);
  return { ...c, comments, timeline, feedback };
}

function getLocation(latitude?: number | null, longitude?: number | null): number[] | null {
  if (
    latitude === undefined ||
    latitude === null ||
    longitude === undefined ||
    longitude === null ||
    Number.isNaN(Number(latitude)) ||
    Number.isNaN(Number(longitude))
  ) {
    return null;
  }
  return [Number(longitude), Number(latitude)];
}

function publishComplaintEvent(
  complaint: StoredComplaint,
  event: string,
  extra: Record<string, unknown> = {},
): void {
  const payload = { complaintId: complaint.id, ref: complaint.ref, status: complaint.status, ...extra };
  if (complaint.citizenId) emitToUser(complaint.citizenId, event, payload);
  if (complaint.assignedToId) emitToUser(complaint.assignedToId, event, payload);
  if (complaint.departmentId) emitToDepartment(complaint.departmentId, event, payload);
  emitToStaff(event, payload);
}

export const complaintService = {
  async list(query: ComplaintQuery = {}): Promise<{ items: StoredComplaint[]; pagination: Pagination }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    if (query.status !== undefined && !isStatus(query.status)) {
      throw new AppError(`Invalid status. Allowed: ${TICKET_STATUSES.join(", ")}`, 422);
    }
    if (query.priority !== undefined && !isPriority(query.priority)) {
      throw new AppError(`Invalid priority. Allowed: ${TICKET_PRIORITIES.join(", ")}`, 422);
    }
    const q = (query.search ?? "").trim().toLowerCase();
    const items = complaintRepository.complaints.query({
      searchFields: ["title", "description", "ref", "citizenName", "category"],
      search: q || undefined,
      filter: (c) =>
        (query.status === undefined || c.status === query.status) &&
        (query.priority === undefined || c.priority === query.priority) &&
        (query.category === undefined || c.category.toLowerCase() === query.category.toLowerCase()) &&
        (query.citizenId === undefined || c.citizenId === query.citizenId) &&
        (query.departmentId === undefined || c.departmentId === query.departmentId) &&
        (query.assignedToId === undefined || c.assignedToId === query.assignedToId),
      sort: (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    });
    const { items: paged, pagination } = paginate(items, page, limit);
    return { items: paged.map(withDetails), pagination };
  },

  async getById(id: string): Promise<StoredComplaint> {
    const complaint = complaintRepository.complaints.findById(id);
    if (!complaint) throw new NotFoundError("Complaint not found");
    return withDetails(complaint) as unknown as StoredComplaint;
  },

  async create(actor: Actor, dto: CreateComplaintDto): Promise<StoredComplaint> {
    if (!dto.title || !dto.title.trim()) throw new ValidationError({ title: "title is required" });
    if (!dto.description || !dto.description.trim()) {
      throw new ValidationError({ description: "description is required" });
    }
    if (!dto.category || !dto.category.trim()) throw new ValidationError({ category: "category is required" });
    const priority = dto.priority ?? TicketPriority.MEDIUM;
    if (!isPriority(priority)) throw new AppError(`Invalid priority. Allowed: ${TICKET_PRIORITIES.join(", ")}`, 422);

    const slaHours = await slaService.resolveHours({
      priority,
      category: dto.category,
      departmentId: dto.departmentId ?? null,
    });
    const createdAt = new Date().toISOString();
    const location = getLocation(dto.latitude, dto.longitude);
    const complaint = complaintRepository.complaints.create({
      ref: generateRef("CMP"),
      title: dto.title.trim(),
      description: dto.description.trim(),
      category: dto.category.trim(),
      status: dto.autoReceived ? TicketStatus.RECEIVED : TicketStatus.SUBMITTED,
      priority,
      latitude: dto.latitude ?? null,
      longitude: dto.longitude ?? null,
      location,
      address: dto.address?.trim() || null,
      imageUrls: dto.imageUrls ?? [],
      slaHours,
      slaDeadline: new Date(Date.now() + slaHours * 3_600_000).toISOString(),
      slaBreached: false,
      resolvedAt: null,
      citizenId: actor.id,
      citizenName: displayName(actor),
      assignedToId: null,
      assignedToName: null,
      departmentId: dto.departmentId ?? null,
      departmentName: dto.departmentId
        ? departmentRepository.departments.findById(dto.departmentId)?.name ?? null
        : null,
      ai: dto.ai ?? null,
      createdAt,
      updatedAt: createdAt,
    } as unknown as StoredComplaint);

    const initialStatus = complaint.status;
    pushTimeline(complaint.id, initialStatus, "Complaint submitted", actor.id);
    void notifyStaff(
      "New complaint submitted",
      `${complaint.ref}: ${complaint.title}`,
      { complaintId: complaint.id, ref: complaint.ref },
    );
    emitToStaff("complaint.created", {
      complaintId: complaint.id,
      ref: complaint.ref,
      title: complaint.title,
      status: complaint.status,
    });
    if (complaint.departmentId) {
      emitToDepartment(complaint.departmentId, "complaint.created", {
        complaintId: complaint.id,
        ref: complaint.ref,
        title: complaint.title,
      });
    }
    return complaint;
  },

  async update(id: string, actor: Actor, dto: UpdateComplaintDto): Promise<StoredComplaint> {
    const complaint = await this.getById(id);
    assertCanManage(complaint, actor);

    const patch: Partial<StoredComplaint> = {};
    if (dto.title !== undefined) patch.title = dto.title.trim();
    if (dto.description !== undefined) patch.description = dto.description.trim();
    if (dto.category !== undefined) patch.category = dto.category.trim();
    if (dto.priority !== undefined) {
      if (!isPriority(dto.priority)) throw new AppError(`Invalid priority. Allowed: ${TICKET_PRIORITIES.join(", ")}`, 422);
      const slaHours = await slaService.resolveHours({
        priority: dto.priority,
        category: dto.category ?? complaint.category,
        departmentId: dto.departmentId ?? complaint.departmentId ?? null,
      });
      patch.priority = dto.priority;
      patch.slaHours = slaHours;
      patch.slaDeadline = new Date(Date.now() + slaHours * 3_600_000).toISOString();
      patch.slaBreached = false;
    }
    if (dto.latitude !== undefined || dto.longitude !== undefined) {
      const latitude = dto.latitude ?? complaint.latitude ?? null;
      const longitude = dto.longitude ?? complaint.longitude ?? null;
      patch.latitude = latitude;
      patch.longitude = longitude;
      patch.location = getLocation(latitude as number | null, longitude as number | null);
    }
    if (dto.address !== undefined) patch.address = dto.address;
    if (dto.imageUrls !== undefined) patch.imageUrls = dto.imageUrls;
    patch.updatedAt = new Date().toISOString();

    const updated = complaintRepository.complaints.update(id, patch);
    if (!updated) throw new NotFoundError("Complaint not found");
    return updated;
  },

  async remove(id: string, actor: Actor): Promise<void> {
    const complaint = await this.getById(id);
    assertCanManage(complaint, actor);
    complaintRepository.complaints.delete(id);
    complaintRepository.comments
      .all()
      .filter((c) => c.complaintId === id)
      .forEach((c) => complaintRepository.comments.delete(c.id));
    complaintRepository.timeline
      .all()
      .filter((t) => t.complaintId === id)
      .forEach((t) => complaintRepository.timeline.delete(t.id));
    complaintRepository.feedback
      .all()
      .filter((f) => f.complaintId === id)
      .forEach((f) => complaintRepository.feedback.delete(f.id));
  },

  async assign(id: string, dto: AssignComplaintDto, actor: Actor): Promise<StoredComplaint> {
    const complaint = await this.getById(id);
    if (!dto.officerId) throw new ValidationError({ officerId: "officerId is required" });
    if ((TERMINAL_STATUSES as TicketStatus[]).includes(complaint.status)) {
      throw new AppError("A closed/rejected/cancelled complaint cannot be assigned", 422);
    }

    const officer = authRepository.users.findById(dto.officerId);
    if (!officer) throw new AppError("Officer not found", 404);
    if (!(STAFF_ROLES as UserRole[]).includes(officer.role)) {
      throw new AppError("Selected user is not an officer", 422);
    }

    const departmentId = dto.departmentId ?? officer.departmentId ?? complaint.departmentId ?? null;
    const dept = departmentId ? departmentRepository.departments.findById(departmentId) : undefined;
    const updated = complaintRepository.complaints.update(id, {
      status: TicketStatus.ASSIGNED,
      assignedToId: officer.id,
      assignedToName: officer.fullName,
      departmentId,
      departmentName: dept?.name ?? null,
      updatedAt: new Date().toISOString(),
    } as Partial<StoredComplaint>);
    if (!updated) throw new NotFoundError("Complaint not found");

    pushTimeline(id, TicketStatus.ASSIGNED, `Assigned to ${officer.fullName}`, actor.id);
    auditService.record({
      actorId: actor.id,
      actorEmail: actor.email,
      role: actor.role,
      action: "complaint.assigned",
      entity: "complaint",
      entityId: id,
      meta: { fromOfficerId: complaint.assignedToId ?? null, toOfficerId: officer.id, toStatus: TicketStatus.ASSIGNED },
      ip: actor.ip ?? null,
      userAgent: actor.userAgent ?? null,
    });
    void notificationService.notify(
      officer.id,
      "Complaint assigned to you",
      `${updated.ref}: ${updated.title}`,
      { payload: { complaintId: id, ref: updated.ref } },
    );
    void notificationService.notify(
      updated.citizenId,
      "Your complaint has been assigned",
      `${updated.ref}: now handled by ${officer.fullName}`,
      { payload: { complaintId: id, ref: updated.ref } },
    );
    publishComplaintEvent(updated, "complaint.assigned", { officerId: officer.id });
    return updated;
  },

  async updateStatus(id: string, dto: ComplaintStatusDto, actor: Actor): Promise<StoredComplaint> {
    const complaint = await this.getById(id);
    if (!isStatus(dto.status)) throw new AppError(`Invalid status. Allowed: ${TICKET_STATUSES.join(", ")}`, 422);

    const from = complaint.status;
    const allowed = WORKFLOW_TRANSITIONS[from];
    if (allowed && !(allowed as TicketStatus[]).includes(dto.status)) {
      throw new AppError(`Invalid workflow transition: ${from} → ${dto.status}`, 422);
    }

    const now = new Date();
    const deadline = complaint.slaDeadline ? new Date(complaint.slaDeadline) : null;
    const breached = complaint.slaBreached || (deadline !== null && now.getTime() > deadline.getTime());

    const patch: Partial<StoredComplaint> = {
      status: dto.status,
      slaBreached: breached,
      updatedAt: now.toISOString(),
    };
    if (RESOLVED_STATUSES.includes(dto.status)) {
      patch.resolvedAt = complaint.resolvedAt ?? now.toISOString();
    } else {
      patch.resolvedAt = null;
    }

    const applied = complaintRepository.complaints.update(id, patch);
    if (!applied) throw new NotFoundError("Complaint not found");

    auditService.record({
      actorId: actor.id,
      actorEmail: actor.email,
      role: actor.role,
      action: "complaint.status_change",
      entity: "complaint",
      entityId: id,
      meta: {
        fromStatus: from,
        toStatus: applied.status,
        note: dto.note ?? null,
        slaBreached: breached,
      },
      ip: actor.ip ?? null,
      userAgent: actor.userAgent ?? null,
    });

    const note = dto.note ?? `Status changed to ${dto.status}`;
    const slaNote = breached ? `SLA deadline (${complaint.slaHours}h) exceeded` : null;
    pushTimeline(id, dto.status, slaNote ? `${note}. ${slaNote}` : note, actor.id);
    void notificationService.notify(
      complaint.citizenId,
      "Complaint status update",
      `${complaint.ref}: ${note}`,
      { payload: { complaintId: id, ref: complaint.ref, status: dto.status } },
    );
    if (complaint.assignedToId && complaint.assignedToId !== complaint.citizenId) {
      void notificationService.notify(
        complaint.assignedToId,
        "Complaint status update",
        `${complaint.ref}: ${note}`,
        { payload: { complaintId: id, ref: complaint.ref, status: dto.status } },
      );
    }

    publishComplaintEvent(applied, "complaint.statusChanged", { note, from });
    if (dto.status === TicketStatus.RESOLVED) {
      emitToStaff("complaint.resolved", { complaintId: id, ref: complaint.ref });
    }
    if (dto.status === TicketStatus.ESCALATED) {
      emitToStaff("complaint.escalated", {
        complaintId: id,
        ref: complaint.ref,
        reason: dto.note ?? "Escalated",
      });
    }
    return applied;
  },

  /** Explicit workflow action wrappers (same as updateStatus semantics). */
  async receive(id: string, actor: Actor, note?: string): Promise<StoredComplaint> {
    return complaintService.updateStatus(id, { status: TicketStatus.RECEIVED, note }, actor);
  },
  async review(id: string, actor: Actor, note?: string): Promise<StoredComplaint> {
    return complaintService.updateStatus(id, { status: TicketStatus.UNDER_REVIEW, note }, actor);
  },
  async inspect(id: string, actor: Actor, note?: string): Promise<StoredComplaint> {
    return complaintService.updateStatus(id, { status: TicketStatus.FIELD_INSPECTION, note }, actor);
  },
  async progress(id: string, actor: Actor, note?: string): Promise<StoredComplaint> {
    return complaintService.updateStatus(id, { status: TicketStatus.IN_PROGRESS, note }, actor);
  },
  async resolve(id: string, actor: Actor, note?: string): Promise<StoredComplaint> {
    return complaintService.updateStatus(id, { status: TicketStatus.RESOLVED, note }, actor);
  },
  async close(id: string, actor: Actor, note?: string): Promise<StoredComplaint> {
    return complaintService.updateStatus(id, { status: TicketStatus.CLOSED, note }, actor);
  },
  async cancel(id: string, actor: Actor, note?: string): Promise<StoredComplaint> {
    return complaintService.updateStatus(id, { status: TicketStatus.CANCELLED, note }, actor);
  },
  async escalate(id: string, actor: Actor, note?: string): Promise<StoredComplaint> {
    return complaintService.updateStatus(id, { status: TicketStatus.ESCALATED, note }, actor);
  },

  async submitFeedback(id: string, dto: FeedbackDto, actor: Actor): Promise<StoredFeedback> {
    const complaint = await this.getById(id);
    if (actor.role !== UserRole.CITIZEN || complaint.citizenId !== actor.id) {
      throw new ForbiddenError("Only the reporting citizen can submit feedback");
    }
    if (complaint.status !== TicketStatus.RESOLVED) {
      throw new AppError("Feedback can only be provided after a complaint is resolved", 422);
    }
    const rating = Number(dto.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new ValidationError({ rating: "rating must be an integer between 1 and 5" });
    }
    const existing = complaintRepository.feedback.all().some((f) => f.complaintId === id);
    if (existing) throw new AppError("Feedback already submitted for this complaint", 409);

    const now = new Date().toISOString();
    const feedback = complaintRepository.feedback.create({
      complaintId: id,
      citizenId: actor.id,
      rating,
      comment: (dto.comment ?? "").trim() || null,
      createdAt: now,
    } as unknown as StoredFeedback);

    complaintRepository.complaints.update(id, {
      status: TicketStatus.CITIZEN_FEEDBACK,
      updatedAt: now,
    } as Partial<StoredComplaint>);
    pushTimeline(id, TicketStatus.CITIZEN_FEEDBACK, `Feedback received (${rating}/5)`, actor.id);
    publishComplaintEvent(
      { ...complaint, status: TicketStatus.CITIZEN_FEEDBACK } as StoredComplaint,
      "complaint.statusChanged",
      { note: "Citizen feedback submitted" },
    );
    return feedback;
  },

  async getFeedback(id: string): Promise<StoredFeedback[]> {
    return complaintRepository.feedback
      .all()
      .filter((f) => f.complaintId === id)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },

  async addComment(id: string, actor: Actor, dto: CommentDto): Promise<StoredComplaintComment> {
    const complaint = await this.getById(id);
    const body = (dto.body ?? "").trim();
    if (!body) throw new ValidationError({ body: "body is required" });

    return complaintRepository.comments.create({
      complaintId: complaint.id,
      authorId: actor.id,
      authorName: displayName(actor),
      body,
      createdAt: new Date().toISOString(),
    } as unknown as StoredComplaintComment);
  },

  async listComments(id: string): Promise<StoredComplaintComment[]> {
    return complaintRepository.comments
      .all()
      .filter((c) => c.complaintId === id)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },

  async stats(): Promise<ComplaintStats> {
    const complaints = complaintRepository.complaints.all();
    const byStatus = emptyStatusCount();
    const byPriority = emptyPriorityCount();
    const byCategory: Record<string, number> = {};
    let open = 0;
    let resolved = 0;
    let overdue = 0;

    for (const c of complaints) {
      byStatus[c.status] += 1;
      byPriority[c.priority] += 1;
      byCategory[c.category] = (byCategory[c.category] ?? 0) + 1;
      if ((OPEN_STATUSES as TicketStatus[]).includes(c.status)) open += 1;
      if ((RESOLVED_STATUSES as TicketStatus[]).includes(c.status)) resolved += 1;
      if (c.slaBreached) overdue += 1;
    }

    return { total: complaints.length, open, resolved, overdue, byStatus, byPriority, byCategory };
  },
};

export default complaintService;