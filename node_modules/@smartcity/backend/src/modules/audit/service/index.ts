import { uid } from "../../../core/utils";
import { auditRepository, type StoredAuditLog } from "../repository";
import { paginate, type Pagination } from "@smartcity/common";

export interface AuditRecordInput {
  actorId?: string | null;
  actorEmail?: string | null;
  role?: string | null;
  action: string;
  entity?: string | null;
  entityId?: string | null;
  meta?: Record<string, unknown> | null;
  ip?: string | null;
  userAgent?: string | null;
}

export interface AuditQuery {
  page?: number;
  limit?: number;
  entity?: string;
  entityId?: string;
  actorId?: string;
  action?: string;
  search?: string;
}

export const auditService = {
  /**
   * Persist an audit record. Fire-and-forget: the repository enqueues the
   * write so callers are never blocked on audit bookkeeping.
   */
  record(input: AuditRecordInput): StoredAuditLog {
    const now = new Date().toISOString();
    const entry: StoredAuditLog = {
      id: uid("aud"),
      actorId: input.actorId ?? null,
      actorEmail: input.actorEmail ?? null,
      role: input.role ?? null,
      action: input.action,
      entity: input.entity ?? null,
      entityId: input.entityId ?? null,
      meta: input.meta ?? null,
      ip: input.ip ?? null,
      userAgent: input.userAgent ?? null,
      createdAt: now,
      updatedAt: now,
    };
    auditRepository.logs.create(entry as never);
    return entry;
  },

  list(query: AuditQuery = {}): { items: StoredAuditLog[]; pagination: Pagination } {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const q = (query.search ?? "").trim().toLowerCase();
    const items = auditRepository.logs.query({
      searchFields: ["action", "entity", "actorEmail", "entityId"],
      search: q || undefined,
      filter: (log) =>
        (query.entity === undefined || log.entity === query.entity) &&
        (query.entityId === undefined || log.entityId === query.entityId) &&
        (query.actorId === undefined || log.actorId === query.actorId) &&
        (query.action === undefined || log.action === query.action),
      sort: (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    });
    const { items: paged, pagination } = paginate(items, page, limit);
    return { items: paged, pagination };
  },
};

export default auditService;