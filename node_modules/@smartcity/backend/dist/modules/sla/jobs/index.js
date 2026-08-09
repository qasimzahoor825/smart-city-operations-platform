"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runSlaSweep = runSlaSweep;
exports.startSlaMonitor = startSlaMonitor;
const common_1 = require("@smartcity/common");
const logger_1 = require("../../../core/logger");
const socket_1 = require("../../../core/socket");
const repository_1 = require("../../auth/repository");
const repository_2 = require("../../complaints/repository");
const service_1 = require("../../notifications/service");
const OPEN_STATUSES = [
    common_1.ComplaintStatus.SUBMITTED,
    common_1.ComplaintStatus.RECEIVED,
    common_1.ComplaintStatus.ASSIGNED,
    common_1.ComplaintStatus.UNDER_REVIEW,
    common_1.ComplaintStatus.FIELD_INSPECTION,
    common_1.ComplaintStatus.IN_PROGRESS,
];
function pushTimeline(complaintId, status, note, actorId) {
    repository_2.complaintRepository.timeline.create({
        complaintId,
        status,
        note,
        actorId,
        createdAt: new Date().toISOString(),
    });
}
function notifyStaff(title, message, payload) {
    repository_1.authRepository.users
        .all()
        .filter((u) => [common_1.UserRole.OFFICER, common_1.UserRole.DEPARTMENT_HEAD, common_1.UserRole.SUPER_ADMIN].includes(u.role))
        .forEach((u) => {
        void service_1.notificationService.notify(u.id, title, message, { payload });
    });
}
/**
 * Scheduled SLA monitor. Marks overdue complaints as SLA-breached, notifies the
 * responsible officer + department head, and auto-escalates CRITICAL complaints
 * that run past their deadline. Guarded so each complaint is processed once.
 */
async function runSlaSweep() {
    const now = new Date().getTime();
    let breached = 0;
    let escalated = 0;
    const overdue = repository_2.complaintRepository.complaints.all().filter((c) => {
        if (!OPEN_STATUSES.includes(c.status))
            return false;
        if (!c.slaDeadline)
            return false;
        return new Date(c.slaDeadline).getTime() < now;
    });
    for (const complaint of overdue) {
        const newlyBreached = !complaint.slaBreached;
        if (newlyBreached) {
            breachComplaint(complaint, now);
            breached += 1;
        }
        const critical = complaint.priority === common_1.ComplaintPriority.CRITICAL;
        const shouldEscalate = critical && !complaint.escalatedViaSla;
        if (shouldEscalate && complaint.status !== common_1.ComplaintStatus.ESCALATED) {
            escalateComplaint(complaint);
            escalated += 1;
        }
    }
    return { breached, escalated };
}
function breachComplaint(complaint, now) {
    repository_2.complaintRepository.complaints.update(complaint.id, {
        slaBreached: true,
        updatedAt: new Date(now).toISOString(),
    });
    pushTimeline(complaint.id, String(complaint.status), `SLA deadline (${complaint.slaHours}h) breached`, "system");
    const title = "SLA deadline violated";
    const message = `${complaint.ref}: ${complaint.title} exceeded its ${complaint.slaHours}h SLA.`;
    const payload = { complaintId: complaint.id, ref: complaint.ref, slaHours: complaint.slaHours };
    if (complaint.citizenId) {
        void service_1.notificationService.notify(complaint.citizenId, title, message, { payload });
        (0, socket_1.emitToUser)(complaint.citizenId, "sla.violated", { complaintId: complaint.id, ref: complaint.ref });
    }
    if (complaint.assignedToId) {
        void service_1.notificationService.notify(complaint.assignedToId, title, message, { payload });
        (0, socket_1.emitToUser)(complaint.assignedToId, "sla.violated", { complaintId: complaint.id, ref: complaint.ref });
    }
    if (complaint.departmentId) {
        (0, socket_1.emitToDepartment)(complaint.departmentId, "sla.violated", {
            complaintId: complaint.id,
            ref: complaint.ref,
        });
    }
    (0, socket_1.emitToStaff)("sla.violated", { complaintId: complaint.id, ref: complaint.ref });
    void notifyStaff(title, message, payload);
}
function escalateComplaint(complaint) {
    const now = new Date().toISOString();
    repository_2.complaintRepository.complaints.update(complaint.id, {
        status: common_1.ComplaintStatus.ESCALATED,
        escalatedViaSla: true,
        updatedAt: now,
    });
    pushTimeline(complaint.id, common_1.ComplaintStatus.ESCALATED, "Escalated automatically after SLA deadline (CRITICAL)", "system");
    const payload = {
        complaintId: complaint.id,
        ref: complaint.ref,
        priority: complaint.priority,
        reason: "SLA deadline exceeded",
    };
    (0, socket_1.emitToStaff)("complaint.escalated", payload);
    if (complaint.departmentId)
        (0, socket_1.emitToDepartment)(complaint.departmentId, "complaint.escalated", payload);
    if (complaint.assignedToId)
        (0, socket_1.emitToUser)(complaint.assignedToId, "complaint.escalated", payload);
    repository_1.authRepository.users
        .all()
        .filter((u) => u.role === common_1.UserRole.DEPARTMENT_HEAD && (u.departmentId ?? null) === complaint.departmentId)
        .forEach((head) => {
        void service_1.notificationService.notify(head.id, "Complaint escalated", `${complaint.ref}: ${payload.reason}`, {
            payload,
        });
    });
}
let timer = null;
function startSlaMonitor(intervalMs = 60_000) {
    if (timer)
        clearInterval(timer);
    const tick = () => {
        runSlaSweep()
            .then((res) => {
            if (res.breached + res.escalated > 0) {
                logger_1.logger.info(`[sla] sweep complete: ${res.breached} breached, ${res.escalated} escalated`);
            }
        })
            .catch((err) => logger_1.logger.error("[sla] sweep failed", err));
    };
    void tick();
    timer = setInterval(tick, intervalMs);
    timer.unref?.();
    return timer;
}
exports.default = { runSlaSweep, startSlaMonitor };
//# sourceMappingURL=index.js.map