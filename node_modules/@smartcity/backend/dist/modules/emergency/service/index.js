"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emergencyService = void 0;
const client_1 = require("@prisma/client");
const common_1 = require("@smartcity/common");
const repository_1 = require("../../auth/repository");
const service_1 = require("../../notifications/service");
const socket_1 = require("../../../core/socket");
const repository_2 = require("../repository");
const EMERGENCY_STATUSES = [
    client_1.EmergencyStatus.REPORTED,
    client_1.EmergencyStatus.ACKNOWLEDGED,
    client_1.EmergencyStatus.DISPATCHED,
    client_1.EmergencyStatus.ON_SCENE,
    client_1.EmergencyStatus.RESOLVED,
    client_1.EmergencyStatus.CLOSED,
];
const EMERGENCY_TYPES = [
    client_1.EmergencyType.FIRE,
    client_1.EmergencyType.MEDICAL,
    client_1.EmergencyType.FLOOD,
    client_1.EmergencyType.ACCIDENT,
    client_1.EmergencyType.PUBLIC_ALERT,
];
const SEVERITIES = [
    client_1.TicketPriority.LOW,
    client_1.TicketPriority.MEDIUM,
    client_1.TicketPriority.HIGH,
    client_1.TicketPriority.CRITICAL,
];
const STAFF_ROLES = [common_1.UserRole.OFFICER, common_1.UserRole.DEPARTMENT_HEAD, common_1.UserRole.SUPER_ADMIN];
const ACTIVE_STATUSES = [
    client_1.EmergencyStatus.REPORTED,
    client_1.EmergencyStatus.ACKNOWLEDGED,
    client_1.EmergencyStatus.DISPATCHED,
    client_1.EmergencyStatus.ON_SCENE,
];
function isStatus(value) {
    return typeof value === "string" && EMERGENCY_STATUSES.includes(value);
}
function isType(value) {
    return typeof value === "string" && EMERGENCY_TYPES.includes(value);
}
function isSeverity(value) {
    return typeof value === "string" && SEVERITIES.includes(value);
}
function emptyStatusCount() {
    return {
        [client_1.EmergencyStatus.REPORTED]: 0,
        [client_1.EmergencyStatus.ACKNOWLEDGED]: 0,
        [client_1.EmergencyStatus.DISPATCHED]: 0,
        [client_1.EmergencyStatus.ON_SCENE]: 0,
        [client_1.EmergencyStatus.RESOLVED]: 0,
        [client_1.EmergencyStatus.CLOSED]: 0,
    };
}
function emptyTypeCount() {
    return {
        [client_1.EmergencyType.FIRE]: 0,
        [client_1.EmergencyType.MEDICAL]: 0,
        [client_1.EmergencyType.FLOOD]: 0,
        [client_1.EmergencyType.ACCIDENT]: 0,
        [client_1.EmergencyType.PUBLIC_ALERT]: 0,
    };
}
function displayName(actor) {
    const user = repository_1.authRepository.users.findById(actor.id);
    return user?.fullName ?? actor.email;
}
exports.emergencyService = {
    async list(query = {}) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        if (query.status !== undefined && !isStatus(query.status)) {
            throw new common_1.AppError(`Invalid status. Allowed: ${EMERGENCY_STATUSES.join(", ")}`, 422);
        }
        if (query.type !== undefined && !isType(query.type)) {
            throw new common_1.AppError(`Invalid type. Allowed: ${EMERGENCY_TYPES.join(", ")}`, 422);
        }
        if (query.severity !== undefined && !isSeverity(query.severity)) {
            throw new common_1.AppError(`Invalid severity. Allowed: ${SEVERITIES.join(", ")}`, 422);
        }
        const q = (query.search ?? "").trim().toLowerCase();
        const items = repository_2.emergencyRepository.emergencies.query({
            searchFields: ["title", "description", "address", "ref"],
            search: q || undefined,
            filter: (e) => (query.status === undefined || e.status === query.status) &&
                (query.type === undefined || e.type === query.type) &&
                (query.severity === undefined || e.severity === query.severity),
            sort: (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        });
        const { items: paged, pagination } = (0, common_1.paginate)(items, page, limit);
        return { items: paged, pagination };
    },
    async getById(id) {
        const emergency = repository_2.emergencyRepository.emergencies.findById(id);
        if (!emergency)
            throw new common_1.NotFoundError("Emergency not found");
        return emergency;
    },
    async create(actor, dto) {
        if (!dto.title || !dto.title.trim())
            throw new common_1.ValidationError({ title: "title is required" });
        if (!dto.description || !dto.description.trim()) {
            throw new common_1.ValidationError({ description: "description is required" });
        }
        if (!isType(dto.type))
            throw new common_1.AppError(`Invalid type. Allowed: ${EMERGENCY_TYPES.join(", ")}`, 422);
        const severity = dto.severity ?? client_1.TicketPriority.HIGH;
        if (!isSeverity(severity)) {
            throw new common_1.AppError(`Invalid severity. Allowed: ${SEVERITIES.join(", ")}`, 422);
        }
        const now = new Date().toISOString();
        const reportedAt = new Date().toISOString();
        const location = dto.latitude !== undefined && dto.latitude !== null && dto.longitude !== undefined && dto.longitude !== null
            ? [Number(dto.longitude), Number(dto.latitude)]
            : null;
        const emergency = repository_2.emergencyRepository.emergencies.create({
            ref: (0, common_1.generateRef)("EMG"),
            type: dto.type,
            title: dto.title.trim(),
            description: dto.description.trim(),
            severity,
            status: client_1.EmergencyStatus.REPORTED,
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
        });
        void service_1.notificationService.notify(emergency.reportedById ?? actor.id, "Emergency report received", `${emergency.ref}: ${emergency.title}`, { payload: { emergencyId: emergency.id, ref: emergency.ref, type: emergency.type } });
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
        (0, socket_1.emitToStaff)("emergency.created", eventPayload);
        if (emergency.reportedById)
            (0, socket_1.emitToUser)(emergency.reportedById, "emergency.created", eventPayload);
        repository_1.authRepository.users
            .all()
            .filter((u) => STAFF_ROLES.includes(u.role))
            .forEach((u) => {
            void service_1.notificationService.notify(u.id, `New ${dto.type.replace("_", " ")} emergency`, `${emergency.ref}: ${emergency.title}`, { payload: { emergencyId: emergency.id, ref: emergency.ref } });
        });
        return emergency;
    },
    async dispatch(id, dto, actor) {
        const emergency = await this.getById(id);
        if (!isStatus(dto.status)) {
            throw new common_1.AppError(`Invalid status. Allowed: ${EMERGENCY_STATUSES.join(", ")}`, 422);
        }
        if (emergency.status === client_1.EmergencyStatus.RESOLVED && dto.status !== client_1.EmergencyStatus.RESOLVED) {
            throw new common_1.AppError("A resolved emergency cannot be re-dispatched", 422);
        }
        if (!STAFF_ROLES.includes(actor.role)) {
            throw new common_1.ForbiddenError("Only emergency response staff can dispatch units");
        }
        const now = new Date();
        const unitNote = dto.unit ? `Unit ${dto.unit} ` : "";
        const entry = `${unitNote}${dto.note?.trim() || `Status changed to ${dto.status}`} at ${now.toISOString()}`;
        const timeline = [...emergency.timeline, entry];
        const updated = repository_2.emergencyRepository.emergencies.update(id, {
            status: dto.status,
            dispatchedUnit: dto.unit?.trim() || emergency.dispatchedUnit,
            timeline,
            updatedAt: now.toISOString(),
        });
        if (!updated)
            throw new common_1.NotFoundError("Emergency not found");
        (0, socket_1.emitToStaff)("emergency.updated", {
            emergencyId: id,
            ref: emergency.ref,
            status: dto.status,
            unit: dto.unit ?? null,
        });
        if (emergency.reportedById) {
            void service_1.notificationService.notify(emergency.reportedById, "Emergency update", `${emergency.ref}: ${dto.note?.trim() || dto.status.replace("_", " ")}`, { payload: { emergencyId: id, ref: emergency.ref, status: dto.status } });
        }
        return updated;
    },
    async stats() {
        const emergencies = repository_2.emergencyRepository.emergencies.all();
        const byStatus = emptyStatusCount();
        const byType = emptyTypeCount();
        let active = 0;
        let resolved = 0;
        for (const e of emergencies) {
            byStatus[e.status] += 1;
            byType[e.type] += 1;
            if (ACTIVE_STATUSES.includes(e.status))
                active += 1;
            if (e.status === client_1.EmergencyStatus.RESOLVED)
                resolved += 1;
        }
        return { total: emergencies.length, active, resolved, byStatus, byType };
    },
};
exports.default = exports.emergencyService;
//# sourceMappingURL=index.js.map