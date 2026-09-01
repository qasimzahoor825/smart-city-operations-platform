"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appointmentService = void 0;
const client_1 = require("@prisma/client");
const common_1 = require("@smartcity/common");
const repository_1 = require("../repository");
const repository_2 = require("../../auth/repository");
const APPOINTMENT_STATUSES = [
    client_1.AppointmentStatus.PENDING,
    client_1.AppointmentStatus.CONFIRMED,
    client_1.AppointmentStatus.COMPLETED,
    client_1.AppointmentStatus.CANCELLED,
];
const STAFF_ROLES = [common_1.UserRole.OFFICER, common_1.UserRole.DEPARTMENT_HEAD, common_1.UserRole.SUPER_ADMIN];
const DEPARTMENT_NAMES = {
    "dept-public-works": "Public Works",
    "dept-water-sanitation": "Water & Sanitation",
};
const ALLOWED_TRANSITIONS = {
    [client_1.AppointmentStatus.PENDING]: [client_1.AppointmentStatus.CONFIRMED, client_1.AppointmentStatus.CANCELLED],
    [client_1.AppointmentStatus.CONFIRMED]: [client_1.AppointmentStatus.COMPLETED, client_1.AppointmentStatus.CANCELLED],
    [client_1.AppointmentStatus.COMPLETED]: [],
    [client_1.AppointmentStatus.CANCELLED]: [],
};
function isStatus(value) {
    return typeof value === "string" && APPOINTMENT_STATUSES.includes(value);
}
function emptyStatusCount() {
    return {
        [client_1.AppointmentStatus.PENDING]: 0,
        [client_1.AppointmentStatus.CONFIRMED]: 0,
        [client_1.AppointmentStatus.COMPLETED]: 0,
        [client_1.AppointmentStatus.CANCELLED]: 0,
    };
}
function assertCanManage(appointment, actor) {
    if (STAFF_ROLES.includes(actor.role))
        return;
    if (actor.role === common_1.UserRole.CITIZEN && appointment.citizenId === actor.id)
        return;
    throw new common_1.ForbiddenError("You can only manage your own appointments");
}
function displayName(actor) {
    const user = repository_2.authRepository.users.findById(actor.id);
    return user?.fullName ?? actor.email;
}
exports.appointmentService = {
    async list(query = {}) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        if (query.status !== undefined && !isStatus(query.status)) {
            throw new common_1.AppError(`Invalid status. Allowed: ${APPOINTMENT_STATUSES.join(", ")}`, 422);
        }
        const q = (query.search ?? "").trim().toLowerCase();
        const items = repository_1.appointmentRepository.appointments.query({
            searchFields: ["title", "description", "citizenName", "departmentName"],
            search: q || undefined,
            filter: (a) => (query.citizenId === undefined || a.citizenId === query.citizenId) &&
                (query.departmentId === undefined || a.departmentId === query.departmentId) &&
                (query.status === undefined || a.status === query.status),
            sort: (a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime(),
        });
        const { items: paged, pagination } = (0, common_1.paginate)(items, page, limit);
        return { items: paged, pagination };
    },
    async getById(id) {
        const appointment = repository_1.appointmentRepository.appointments.findById(id);
        if (!appointment)
            throw new common_1.NotFoundError("Appointment not found");
        return appointment;
    },
    async create(actor, dto) {
        if (!dto.title || !dto.title.trim())
            throw new common_1.ValidationError({ title: "title is required" });
        if (!dto.scheduledAt)
            throw new common_1.ValidationError({ scheduledAt: "scheduledAt is required" });
        const scheduled = new Date(dto.scheduledAt);
        if (Number.isNaN(scheduled.getTime())) {
            throw new common_1.ValidationError({ scheduledAt: "scheduledAt must be a valid ISO datetime" }, "scheduledAt must be a valid ISO datetime");
        }
        const now = new Date().toISOString();
        const departmentId = dto.departmentId ?? "dept-public-works";
        return repository_1.appointmentRepository.appointments.create({
            title: dto.title.trim(),
            description: dto.description?.trim() || null,
            scheduledAt: scheduled.toISOString(),
            status: client_1.AppointmentStatus.PENDING,
            citizenId: actor.id,
            citizenName: displayName(actor),
            departmentId,
            departmentName: departmentId ? DEPARTMENT_NAMES[departmentId] ?? "Department" : null,
            durationMinutes: dto.durationMinutes ?? 30,
            createdAt: now,
            updatedAt: now,
        });
    },
    async updateStatus(id, actor, dto) {
        const appointment = await this.getById(id);
        if (!isStatus(dto.status)) {
            throw new common_1.AppError(`Invalid status. Allowed: ${APPOINTMENT_STATUSES.join(", ")}`, 422);
        }
        assertCanManage(appointment, actor);
        if (actor.role === common_1.UserRole.CITIZEN && dto.status !== client_1.AppointmentStatus.CANCELLED) {
            throw new common_1.ForbiddenError("Citizens can only cancel their own appointments");
        }
        const allowed = ALLOWED_TRANSITIONS[appointment.status];
        if (!allowed.includes(dto.status) && dto.status !== appointment.status) {
            throw new common_1.AppError(`Invalid status transition from ${appointment.status} to ${dto.status}. Allowed: ${allowed.join(", ")}`, 422);
        }
        const updated = repository_1.appointmentRepository.appointments.update(id, {
            status: dto.status,
            updatedAt: new Date().toISOString(),
        });
        if (!updated)
            throw new common_1.NotFoundError("Appointment not found");
        return updated;
    },
    async remove(id, actor) {
        const appointment = await this.getById(id);
        assertCanManage(appointment, actor);
        repository_1.appointmentRepository.appointments.delete(id);
    },
    async stats() {
        const appointments = repository_1.appointmentRepository.appointments.all();
        const byStatus = emptyStatusCount();
        for (const a of appointments)
            byStatus[a.status] += 1;
        return {
            total: appointments.length,
            pending: byStatus[client_1.AppointmentStatus.PENDING],
            confirmed: byStatus[client_1.AppointmentStatus.CONFIRMED],
            completed: byStatus[client_1.AppointmentStatus.COMPLETED],
            cancelled: byStatus[client_1.AppointmentStatus.CANCELLED],
            byStatus,
        };
    },
};
exports.default = exports.appointmentService;
//# sourceMappingURL=index.js.map