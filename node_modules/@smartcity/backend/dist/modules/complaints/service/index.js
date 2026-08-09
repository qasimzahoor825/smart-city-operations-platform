"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.complaintService = void 0;
const client_1 = require("@prisma/client");
const common_1 = require("@smartcity/common");
const socket_1 = require("../../../core/socket");
const repository_1 = require("../../auth/repository");
const repository_2 = require("../../departments/repository");
const service_1 = require("../../notifications/service");
const service_2 = require("../../sla/service");
const service_3 = require("../../audit/service");
const repository_3 = require("../repository");
const TICKET_STATUSES = [
    client_1.TicketStatus.SUBMITTED,
    client_1.TicketStatus.RECEIVED,
    client_1.TicketStatus.ASSIGNED,
    client_1.TicketStatus.UNDER_REVIEW,
    client_1.TicketStatus.FIELD_INSPECTION,
    client_1.TicketStatus.IN_PROGRESS,
    client_1.TicketStatus.RESOLVED,
    client_1.TicketStatus.CITIZEN_FEEDBACK,
    client_1.TicketStatus.CLOSED,
    client_1.TicketStatus.REJECTED,
    client_1.TicketStatus.ESCALATED,
    client_1.TicketStatus.CANCELLED,
];
const TICKET_PRIORITIES = [
    client_1.TicketPriority.LOW,
    client_1.TicketPriority.MEDIUM,
    client_1.TicketPriority.HIGH,
    client_1.TicketPriority.CRITICAL,
];
const OPEN_STATUSES = [
    client_1.TicketStatus.SUBMITTED,
    client_1.TicketStatus.RECEIVED,
    client_1.TicketStatus.ASSIGNED,
    client_1.TicketStatus.UNDER_REVIEW,
    client_1.TicketStatus.FIELD_INSPECTION,
    client_1.TicketStatus.IN_PROGRESS,
    client_1.TicketStatus.ESCALATED,
];
const RESOLVED_STATUSES = [client_1.TicketStatus.RESOLVED, client_1.TicketStatus.CITIZEN_FEEDBACK, client_1.TicketStatus.CLOSED];
const TERMINAL_STATUSES = [client_1.TicketStatus.CLOSED, client_1.TicketStatus.REJECTED, client_1.TicketStatus.CANCELLED];
const STAFF_ROLES = [common_1.UserRole.OFFICER, common_1.UserRole.DEPARTMENT_HEAD, common_1.UserRole.SUPER_ADMIN];
/**
 * Workflow engine: which statuses can be transitioned to from each status.
 * Designed to satisfy the full complaint lifecycle while still allowing
 * real-world short-cuts (staff may resolve early, reject or cancel anytime
 * before a terminal state). Terminal states cannot be re-opened.
 */
const WORKFLOW_TRANSITIONS = {
    [client_1.TicketStatus.SUBMITTED]: [
        client_1.TicketStatus.RECEIVED,
        client_1.TicketStatus.ASSIGNED,
        client_1.TicketStatus.UNDER_REVIEW,
        client_1.TicketStatus.FIELD_INSPECTION,
        client_1.TicketStatus.IN_PROGRESS,
        client_1.TicketStatus.RESOLVED,
        client_1.TicketStatus.REJECTED,
        client_1.TicketStatus.ESCALATED,
        client_1.TicketStatus.CANCELLED,
    ],
    [client_1.TicketStatus.RECEIVED]: [
        client_1.TicketStatus.ASSIGNED,
        client_1.TicketStatus.UNDER_REVIEW,
        client_1.TicketStatus.FIELD_INSPECTION,
        client_1.TicketStatus.IN_PROGRESS,
        client_1.TicketStatus.RESOLVED,
        client_1.TicketStatus.REJECTED,
        client_1.TicketStatus.ESCALATED,
        client_1.TicketStatus.CANCELLED,
    ],
    [client_1.TicketStatus.ASSIGNED]: [
        client_1.TicketStatus.UNDER_REVIEW,
        client_1.TicketStatus.FIELD_INSPECTION,
        client_1.TicketStatus.IN_PROGRESS,
        client_1.TicketStatus.RESOLVED,
        client_1.TicketStatus.REJECTED,
        client_1.TicketStatus.ESCALATED,
        client_1.TicketStatus.CANCELLED,
    ],
    [client_1.TicketStatus.UNDER_REVIEW]: [
        client_1.TicketStatus.FIELD_INSPECTION,
        client_1.TicketStatus.IN_PROGRESS,
        client_1.TicketStatus.RESOLVED,
        client_1.TicketStatus.REJECTED,
        client_1.TicketStatus.ESCALATED,
        client_1.TicketStatus.CANCELLED,
    ],
    [client_1.TicketStatus.FIELD_INSPECTION]: [
        client_1.TicketStatus.UNDER_REVIEW,
        client_1.TicketStatus.IN_PROGRESS,
        client_1.TicketStatus.RESOLVED,
        client_1.TicketStatus.REJECTED,
        client_1.TicketStatus.ESCALATED,
        client_1.TicketStatus.CANCELLED,
    ],
    [client_1.TicketStatus.IN_PROGRESS]: [
        client_1.TicketStatus.RESOLVED,
        client_1.TicketStatus.REJECTED,
        client_1.TicketStatus.ESCALATED,
        client_1.TicketStatus.CANCELLED,
    ],
    [client_1.TicketStatus.RESOLVED]: [client_1.TicketStatus.CITIZEN_FEEDBACK, client_1.TicketStatus.CLOSED, client_1.TicketStatus.REJECTED],
    [client_1.TicketStatus.CITIZEN_FEEDBACK]: [client_1.TicketStatus.CLOSED, client_1.TicketStatus.REJECTED],
    [client_1.TicketStatus.ESCALATED]: [
        client_1.TicketStatus.UNDER_REVIEW,
        client_1.TicketStatus.FIELD_INSPECTION,
        client_1.TicketStatus.IN_PROGRESS,
        client_1.TicketStatus.RESOLVED,
        client_1.TicketStatus.REJECTED,
        client_1.TicketStatus.CANCELLED,
    ],
    [client_1.TicketStatus.CLOSED]: [],
    [client_1.TicketStatus.REJECTED]: [],
    [client_1.TicketStatus.CANCELLED]: [],
};
function notifyStaff(title, message, payload) {
    return Promise.all(repository_1.authRepository.users
        .all()
        .filter((u) => STAFF_ROLES.includes(u.role))
        .map((u) => service_1.notificationService.notify(u.id, title, message, { payload })));
}
function isStatus(value) {
    return typeof value === "string" && TICKET_STATUSES.includes(value);
}
function isPriority(value) {
    return typeof value === "string" && TICKET_PRIORITIES.includes(value);
}
function emptyStatusCount() {
    return {
        [client_1.TicketStatus.SUBMITTED]: 0,
        [client_1.TicketStatus.RECEIVED]: 0,
        [client_1.TicketStatus.ASSIGNED]: 0,
        [client_1.TicketStatus.UNDER_REVIEW]: 0,
        [client_1.TicketStatus.FIELD_INSPECTION]: 0,
        [client_1.TicketStatus.IN_PROGRESS]: 0,
        [client_1.TicketStatus.RESOLVED]: 0,
        [client_1.TicketStatus.CITIZEN_FEEDBACK]: 0,
        [client_1.TicketStatus.CLOSED]: 0,
        [client_1.TicketStatus.REJECTED]: 0,
        [client_1.TicketStatus.ESCALATED]: 0,
        [client_1.TicketStatus.CANCELLED]: 0,
    };
}
function emptyPriorityCount() {
    return {
        [client_1.TicketPriority.LOW]: 0,
        [client_1.TicketPriority.MEDIUM]: 0,
        [client_1.TicketPriority.HIGH]: 0,
        [client_1.TicketPriority.CRITICAL]: 0,
    };
}
function pushTimeline(complaintId, status, note, actorId) {
    return repository_3.complaintRepository.timeline.create({
        complaintId,
        status,
        note,
        actorId: actorId ?? null,
        createdAt: new Date().toISOString(),
    });
}
function assertCanManage(complaint, actor) {
    if (STAFF_ROLES.includes(actor.role))
        return;
    if (actor.role === common_1.UserRole.CITIZEN && complaint.citizenId === actor.id)
        return;
    throw new common_1.ForbiddenError("You can only manage your own complaints");
}
function displayName(actor) {
    const user = repository_1.authRepository.users.findById(actor.id);
    return user?.fullName ?? actor.email;
}
/** Attach comments + timeline so the API returns fully-hydrated complaints. */
function withDetails(c) {
    const comments = repository_3.complaintRepository.comments
        .all()
        .filter((cm) => cm.complaintId === c.id)
        .map((cm) => ({
        id: cm.id,
        authorId: cm.authorId,
        author: cm.authorName,
        body: cm.body,
        createdAt: cm.createdAt,
    }));
    const timeline = repository_3.complaintRepository.timeline
        .all()
        .filter((t) => t.complaintId === c.id)
        .map((t) => ({ status: t.status, note: t.note, actorId: t.actorId, createdAt: t.createdAt }))
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const feedback = repository_3.complaintRepository.feedback.all().filter((f) => f.complaintId === c.id);
    return { ...c, comments, timeline, feedback };
}
function getLocation(latitude, longitude) {
    if (latitude === undefined ||
        latitude === null ||
        longitude === undefined ||
        longitude === null ||
        Number.isNaN(Number(latitude)) ||
        Number.isNaN(Number(longitude))) {
        return null;
    }
    return [Number(longitude), Number(latitude)];
}
function publishComplaintEvent(complaint, event, extra = {}) {
    const payload = { complaintId: complaint.id, ref: complaint.ref, status: complaint.status, ...extra };
    if (complaint.citizenId)
        (0, socket_1.emitToUser)(complaint.citizenId, event, payload);
    if (complaint.assignedToId)
        (0, socket_1.emitToUser)(complaint.assignedToId, event, payload);
    if (complaint.departmentId)
        (0, socket_1.emitToDepartment)(complaint.departmentId, event, payload);
    (0, socket_1.emitToStaff)(event, payload);
}
exports.complaintService = {
    async list(query = {}) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        if (query.status !== undefined && !isStatus(query.status)) {
            throw new common_1.AppError(`Invalid status. Allowed: ${TICKET_STATUSES.join(", ")}`, 422);
        }
        if (query.priority !== undefined && !isPriority(query.priority)) {
            throw new common_1.AppError(`Invalid priority. Allowed: ${TICKET_PRIORITIES.join(", ")}`, 422);
        }
        const q = (query.search ?? "").trim().toLowerCase();
        const items = repository_3.complaintRepository.complaints.query({
            searchFields: ["title", "description", "ref", "citizenName", "category"],
            search: q || undefined,
            filter: (c) => (query.status === undefined || c.status === query.status) &&
                (query.priority === undefined || c.priority === query.priority) &&
                (query.category === undefined || c.category.toLowerCase() === query.category.toLowerCase()) &&
                (query.citizenId === undefined || c.citizenId === query.citizenId) &&
                (query.departmentId === undefined || c.departmentId === query.departmentId) &&
                (query.assignedToId === undefined || c.assignedToId === query.assignedToId),
            sort: (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        });
        const { items: paged, pagination } = (0, common_1.paginate)(items, page, limit);
        return { items: paged.map(withDetails), pagination };
    },
    async getById(id) {
        const complaint = repository_3.complaintRepository.complaints.findById(id);
        if (!complaint)
            throw new common_1.NotFoundError("Complaint not found");
        return withDetails(complaint);
    },
    async create(actor, dto) {
        if (!dto.title || !dto.title.trim())
            throw new common_1.ValidationError({ title: "title is required" });
        if (!dto.description || !dto.description.trim()) {
            throw new common_1.ValidationError({ description: "description is required" });
        }
        if (!dto.category || !dto.category.trim())
            throw new common_1.ValidationError({ category: "category is required" });
        const priority = dto.priority ?? client_1.TicketPriority.MEDIUM;
        if (!isPriority(priority))
            throw new common_1.AppError(`Invalid priority. Allowed: ${TICKET_PRIORITIES.join(", ")}`, 422);
        const slaHours = await service_2.slaService.resolveHours({
            priority,
            category: dto.category,
            departmentId: dto.departmentId ?? null,
        });
        const createdAt = new Date().toISOString();
        const location = getLocation(dto.latitude, dto.longitude);
        const complaint = repository_3.complaintRepository.complaints.create({
            ref: (0, common_1.generateRef)("CMP"),
            title: dto.title.trim(),
            description: dto.description.trim(),
            category: dto.category.trim(),
            status: dto.autoReceived ? client_1.TicketStatus.RECEIVED : client_1.TicketStatus.SUBMITTED,
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
                ? repository_2.departmentRepository.departments.findById(dto.departmentId)?.name ?? null
                : null,
            ai: dto.ai ?? null,
            createdAt,
            updatedAt: createdAt,
        });
        const initialStatus = complaint.status;
        pushTimeline(complaint.id, initialStatus, "Complaint submitted", actor.id);
        void notifyStaff("New complaint submitted", `${complaint.ref}: ${complaint.title}`, { complaintId: complaint.id, ref: complaint.ref });
        (0, socket_1.emitToStaff)("complaint.created", {
            complaintId: complaint.id,
            ref: complaint.ref,
            title: complaint.title,
            status: complaint.status,
        });
        if (complaint.departmentId) {
            (0, socket_1.emitToDepartment)(complaint.departmentId, "complaint.created", {
                complaintId: complaint.id,
                ref: complaint.ref,
                title: complaint.title,
            });
        }
        return complaint;
    },
    async update(id, actor, dto) {
        const complaint = await this.getById(id);
        assertCanManage(complaint, actor);
        const patch = {};
        if (dto.title !== undefined)
            patch.title = dto.title.trim();
        if (dto.description !== undefined)
            patch.description = dto.description.trim();
        if (dto.category !== undefined)
            patch.category = dto.category.trim();
        if (dto.priority !== undefined) {
            if (!isPriority(dto.priority))
                throw new common_1.AppError(`Invalid priority. Allowed: ${TICKET_PRIORITIES.join(", ")}`, 422);
            const slaHours = await service_2.slaService.resolveHours({
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
            patch.location = getLocation(latitude, longitude);
        }
        if (dto.address !== undefined)
            patch.address = dto.address;
        if (dto.imageUrls !== undefined)
            patch.imageUrls = dto.imageUrls;
        patch.updatedAt = new Date().toISOString();
        const updated = repository_3.complaintRepository.complaints.update(id, patch);
        if (!updated)
            throw new common_1.NotFoundError("Complaint not found");
        return updated;
    },
    async remove(id, actor) {
        const complaint = await this.getById(id);
        assertCanManage(complaint, actor);
        repository_3.complaintRepository.complaints.delete(id);
        repository_3.complaintRepository.comments
            .all()
            .filter((c) => c.complaintId === id)
            .forEach((c) => repository_3.complaintRepository.comments.delete(c.id));
        repository_3.complaintRepository.timeline
            .all()
            .filter((t) => t.complaintId === id)
            .forEach((t) => repository_3.complaintRepository.timeline.delete(t.id));
        repository_3.complaintRepository.feedback
            .all()
            .filter((f) => f.complaintId === id)
            .forEach((f) => repository_3.complaintRepository.feedback.delete(f.id));
    },
    async assign(id, dto, actor) {
        const complaint = await this.getById(id);
        if (!dto.officerId)
            throw new common_1.ValidationError({ officerId: "officerId is required" });
        if (TERMINAL_STATUSES.includes(complaint.status)) {
            throw new common_1.AppError("A closed/rejected/cancelled complaint cannot be assigned", 422);
        }
        const officer = repository_1.authRepository.users.findById(dto.officerId);
        if (!officer)
            throw new common_1.AppError("Officer not found", 404);
        if (!STAFF_ROLES.includes(officer.role)) {
            throw new common_1.AppError("Selected user is not an officer", 422);
        }
        const departmentId = dto.departmentId ?? officer.departmentId ?? complaint.departmentId ?? null;
        const dept = departmentId ? repository_2.departmentRepository.departments.findById(departmentId) : undefined;
        const updated = repository_3.complaintRepository.complaints.update(id, {
            status: client_1.TicketStatus.ASSIGNED,
            assignedToId: officer.id,
            assignedToName: officer.fullName,
            departmentId,
            departmentName: dept?.name ?? null,
            updatedAt: new Date().toISOString(),
        });
        if (!updated)
            throw new common_1.NotFoundError("Complaint not found");
        pushTimeline(id, client_1.TicketStatus.ASSIGNED, `Assigned to ${officer.fullName}`, actor.id);
        service_3.auditService.record({
            actorId: actor.id,
            actorEmail: actor.email,
            role: actor.role,
            action: "complaint.assigned",
            entity: "complaint",
            entityId: id,
            meta: { fromOfficerId: complaint.assignedToId ?? null, toOfficerId: officer.id, toStatus: client_1.TicketStatus.ASSIGNED },
            ip: actor.ip ?? null,
            userAgent: actor.userAgent ?? null,
        });
        void service_1.notificationService.notify(officer.id, "Complaint assigned to you", `${updated.ref}: ${updated.title}`, { payload: { complaintId: id, ref: updated.ref } });
        void service_1.notificationService.notify(updated.citizenId, "Your complaint has been assigned", `${updated.ref}: now handled by ${officer.fullName}`, { payload: { complaintId: id, ref: updated.ref } });
        publishComplaintEvent(updated, "complaint.assigned", { officerId: officer.id });
        return updated;
    },
    async updateStatus(id, dto, actor) {
        const complaint = await this.getById(id);
        if (!isStatus(dto.status))
            throw new common_1.AppError(`Invalid status. Allowed: ${TICKET_STATUSES.join(", ")}`, 422);
        const from = complaint.status;
        const allowed = WORKFLOW_TRANSITIONS[from];
        if (allowed && !allowed.includes(dto.status)) {
            throw new common_1.AppError(`Invalid workflow transition: ${from} → ${dto.status}`, 422);
        }
        const now = new Date();
        const deadline = complaint.slaDeadline ? new Date(complaint.slaDeadline) : null;
        const breached = complaint.slaBreached || (deadline !== null && now.getTime() > deadline.getTime());
        const patch = {
            status: dto.status,
            slaBreached: breached,
            updatedAt: now.toISOString(),
        };
        if (RESOLVED_STATUSES.includes(dto.status)) {
            patch.resolvedAt = complaint.resolvedAt ?? now.toISOString();
        }
        else {
            patch.resolvedAt = null;
        }
        const applied = repository_3.complaintRepository.complaints.update(id, patch);
        if (!applied)
            throw new common_1.NotFoundError("Complaint not found");
        service_3.auditService.record({
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
        void service_1.notificationService.notify(complaint.citizenId, "Complaint status update", `${complaint.ref}: ${note}`, { payload: { complaintId: id, ref: complaint.ref, status: dto.status } });
        if (complaint.assignedToId && complaint.assignedToId !== complaint.citizenId) {
            void service_1.notificationService.notify(complaint.assignedToId, "Complaint status update", `${complaint.ref}: ${note}`, { payload: { complaintId: id, ref: complaint.ref, status: dto.status } });
        }
        publishComplaintEvent(applied, "complaint.statusChanged", { note, from });
        if (dto.status === client_1.TicketStatus.RESOLVED) {
            (0, socket_1.emitToStaff)("complaint.resolved", { complaintId: id, ref: complaint.ref });
        }
        if (dto.status === client_1.TicketStatus.ESCALATED) {
            (0, socket_1.emitToStaff)("complaint.escalated", {
                complaintId: id,
                ref: complaint.ref,
                reason: dto.note ?? "Escalated",
            });
        }
        return applied;
    },
    /** Explicit workflow action wrappers (same as updateStatus semantics). */
    async receive(id, actor, note) {
        return exports.complaintService.updateStatus(id, { status: client_1.TicketStatus.RECEIVED, note }, actor);
    },
    async review(id, actor, note) {
        return exports.complaintService.updateStatus(id, { status: client_1.TicketStatus.UNDER_REVIEW, note }, actor);
    },
    async inspect(id, actor, note) {
        return exports.complaintService.updateStatus(id, { status: client_1.TicketStatus.FIELD_INSPECTION, note }, actor);
    },
    async progress(id, actor, note) {
        return exports.complaintService.updateStatus(id, { status: client_1.TicketStatus.IN_PROGRESS, note }, actor);
    },
    async resolve(id, actor, note) {
        return exports.complaintService.updateStatus(id, { status: client_1.TicketStatus.RESOLVED, note }, actor);
    },
    async close(id, actor, note) {
        return exports.complaintService.updateStatus(id, { status: client_1.TicketStatus.CLOSED, note }, actor);
    },
    async cancel(id, actor, note) {
        return exports.complaintService.updateStatus(id, { status: client_1.TicketStatus.CANCELLED, note }, actor);
    },
    async escalate(id, actor, note) {
        return exports.complaintService.updateStatus(id, { status: client_1.TicketStatus.ESCALATED, note }, actor);
    },
    async submitFeedback(id, dto, actor) {
        const complaint = await this.getById(id);
        if (actor.role !== common_1.UserRole.CITIZEN || complaint.citizenId !== actor.id) {
            throw new common_1.ForbiddenError("Only the reporting citizen can submit feedback");
        }
        if (complaint.status !== client_1.TicketStatus.RESOLVED) {
            throw new common_1.AppError("Feedback can only be provided after a complaint is resolved", 422);
        }
        const rating = Number(dto.rating);
        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            throw new common_1.ValidationError({ rating: "rating must be an integer between 1 and 5" });
        }
        const existing = repository_3.complaintRepository.feedback.all().some((f) => f.complaintId === id);
        if (existing)
            throw new common_1.AppError("Feedback already submitted for this complaint", 409);
        const now = new Date().toISOString();
        const feedback = repository_3.complaintRepository.feedback.create({
            complaintId: id,
            citizenId: actor.id,
            rating,
            comment: (dto.comment ?? "").trim() || null,
            createdAt: now,
        });
        repository_3.complaintRepository.complaints.update(id, {
            status: client_1.TicketStatus.CITIZEN_FEEDBACK,
            updatedAt: now,
        });
        pushTimeline(id, client_1.TicketStatus.CITIZEN_FEEDBACK, `Feedback received (${rating}/5)`, actor.id);
        publishComplaintEvent({ ...complaint, status: client_1.TicketStatus.CITIZEN_FEEDBACK }, "complaint.statusChanged", { note: "Citizen feedback submitted" });
        return feedback;
    },
    async getFeedback(id) {
        return repository_3.complaintRepository.feedback
            .all()
            .filter((f) => f.complaintId === id)
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    },
    async addComment(id, actor, dto) {
        const complaint = await this.getById(id);
        const body = (dto.body ?? "").trim();
        if (!body)
            throw new common_1.ValidationError({ body: "body is required" });
        return repository_3.complaintRepository.comments.create({
            complaintId: complaint.id,
            authorId: actor.id,
            authorName: displayName(actor),
            body,
            createdAt: new Date().toISOString(),
        });
    },
    async listComments(id) {
        return repository_3.complaintRepository.comments
            .all()
            .filter((c) => c.complaintId === id)
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    },
    async stats() {
        const complaints = repository_3.complaintRepository.complaints.all();
        const byStatus = emptyStatusCount();
        const byPriority = emptyPriorityCount();
        const byCategory = {};
        let open = 0;
        let resolved = 0;
        let overdue = 0;
        for (const c of complaints) {
            byStatus[c.status] += 1;
            byPriority[c.priority] += 1;
            byCategory[c.category] = (byCategory[c.category] ?? 0) + 1;
            if (OPEN_STATUSES.includes(c.status))
                open += 1;
            if (RESOLVED_STATUSES.includes(c.status))
                resolved += 1;
            if (c.slaBreached)
                overdue += 1;
        }
        return { total: complaints.length, open, resolved, overdue, byStatus, byPriority, byCategory };
    },
};
exports.default = exports.complaintService;
//# sourceMappingURL=index.js.map