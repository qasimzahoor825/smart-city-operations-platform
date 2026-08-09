import { ComplaintStatus, ComplaintPriority, UserRole } from "@smartcity/common";
import { logger } from "../../../core/logger";
import { emitToDepartment, emitToStaff, emitToUser } from "../../../core/socket";
import { authRepository } from "../../auth/repository";
import { complaintRepository, type StoredComplaint } from "../../complaints/repository";
import { notificationService } from "../../notifications/service";

const OPEN_STATUSES = [
  ComplaintStatus.SUBMITTED,
  ComplaintStatus.RECEIVED,
  ComplaintStatus.ASSIGNED,
  ComplaintStatus.UNDER_REVIEW,
  ComplaintStatus.FIELD_INSPECTION,
  ComplaintStatus.IN_PROGRESS,
];

function pushTimeline(complaintId: string, status: string, note: string, actorId: string | null): void {
  complaintRepository.timeline.create({
    complaintId,
    status,
    note,
    actorId,
    createdAt: new Date().toISOString(),
  } as never);
}

function notifyStaff(title: string, message: string, payload: Record<string, unknown>): void {
  authRepository.users
    .all()
    .filter((u) => [UserRole.OFFICER, UserRole.DEPARTMENT_HEAD, UserRole.SUPER_ADMIN].includes(u.role))
    .forEach((u) => {
      void notificationService.notify(u.id, title, message, { payload });
    });
}

/**
 * Scheduled SLA monitor. Marks overdue complaints as SLA-breached, notifies the
 * responsible officer + department head, and auto-escalates CRITICAL complaints
 * that run past their deadline. Guarded so each complaint is processed once.
 */
export async function runSlaSweep(): Promise<{ breached: number; escalated: number }> {
  const now = new Date().getTime();
  let breached = 0;
  let escalated = 0;

  const overdue = complaintRepository.complaints.all().filter((c) => {
    if (!OPEN_STATUSES.includes(c.status as ComplaintStatus)) return false;
    if (!c.slaDeadline) return false;
    return new Date(c.slaDeadline).getTime() < now;
  });

  for (const complaint of overdue) {
    const newlyBreached = !complaint.slaBreached;

    if (newlyBreached) {
      breachComplaint(complaint, now);
      breached += 1;
    }

    const critical = complaint.priority === ComplaintPriority.CRITICAL;
    const shouldEscalate = critical && !(complaint as StoredComplaint & { escalatedViaSla?: boolean }).escalatedViaSla;
    if (shouldEscalate && complaint.status !== ComplaintStatus.ESCALATED) {
      escalateComplaint(complaint);
      escalated += 1;
    }
  }

  return { breached, escalated };
}

function breachComplaint(complaint: StoredComplaint, now: number): void {
  complaintRepository.complaints.update(complaint.id, {
    slaBreached: true,
    updatedAt: new Date(now).toISOString(),
  } as Partial<StoredComplaint>);

  pushTimeline(
    complaint.id,
    String(complaint.status),
    `SLA deadline (${complaint.slaHours}h) breached`,
    "system",
  );

  const title = "SLA deadline violated";
  const message = `${complaint.ref}: ${complaint.title} exceeded its ${complaint.slaHours}h SLA.`;
  const payload = { complaintId: complaint.id, ref: complaint.ref, slaHours: complaint.slaHours };

  if (complaint.citizenId) {
    void notificationService.notify(complaint.citizenId, title, message, { payload });
    emitToUser(complaint.citizenId, "sla.violated", { complaintId: complaint.id, ref: complaint.ref });
  }
  if (complaint.assignedToId) {
    void notificationService.notify(complaint.assignedToId, title, message, { payload });
    emitToUser(complaint.assignedToId, "sla.violated", { complaintId: complaint.id, ref: complaint.ref });
  }
  if (complaint.departmentId) {
    emitToDepartment(complaint.departmentId, "sla.violated", {
      complaintId: complaint.id,
      ref: complaint.ref,
    });
  }
  emitToStaff("sla.violated", { complaintId: complaint.id, ref: complaint.ref });
  void notifyStaff(title, message, payload);
}

function escalateComplaint(complaint: StoredComplaint): void {
  const now = new Date().toISOString();
  complaintRepository.complaints.update(complaint.id, {
    status: ComplaintStatus.ESCALATED,
    escalatedViaSla: true,
    updatedAt: now,
  } as Partial<StoredComplaint>);

  pushTimeline(complaint.id, ComplaintStatus.ESCALATED, "Escalated automatically after SLA deadline (CRITICAL)", "system");

  const payload = {
    complaintId: complaint.id,
    ref: complaint.ref,
    priority: complaint.priority,
    reason: "SLA deadline exceeded",
  };
  emitToStaff("complaint.escalated", payload);
  if (complaint.departmentId) emitToDepartment(complaint.departmentId, "complaint.escalated", payload);
  if (complaint.assignedToId) emitToUser(complaint.assignedToId, "complaint.escalated", payload);

  authRepository.users
    .all()
    .filter((u) => u.role === UserRole.DEPARTMENT_HEAD && (u.departmentId ?? null) === complaint.departmentId)
    .forEach((head) => {
      void notificationService.notify(head.id, "Complaint escalated", `${complaint.ref}: ${payload.reason}`, {
        payload,
      });
    });
}

let timer: NodeJS.Timeout | null = null;

export function startSlaMonitor(intervalMs = 60_000): NodeJS.Timeout {
  if (timer) clearInterval(timer);
  const tick = (): void => {
    runSlaSweep()
      .then((res) => {
        if (res.breached + res.escalated > 0) {
          logger.info(`[sla] sweep complete: ${res.breached} breached, ${res.escalated} escalated`);
        }
      })
      .catch((err) => logger.error("[sla] sweep failed", err));
  };
  void tick();
  timer = setInterval(tick, intervalMs);
  timer.unref?.();
  return timer;
}

export default { runSlaSweep, startSlaMonitor };