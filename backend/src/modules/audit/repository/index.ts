import { collection, type Repository } from "../../../core/database/repository";

export interface StoredAuditLog {
  id: string;
  actorId: string | null;
  actorEmail: string | null;
  role: string | null;
  action: string;
  entity: string | null;
  entityId: string | null;
  meta: Record<string, unknown> | null;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
  updatedAt: string;
}

export type AuditLogRepository = {
  logs: Repository<StoredAuditLog>;
};

export const auditRepository: AuditLogRepository = {
  logs: collection<StoredAuditLog>("audit_logs"),
};

export default auditRepository;