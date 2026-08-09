"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditService = void 0;
const utils_1 = require("../../../core/utils");
const repository_1 = require("../repository");
const common_1 = require("@smartcity/common");
exports.auditService = {
    /**
     * Persist an audit record. Fire-and-forget: the repository enqueues the
     * write so callers are never blocked on audit bookkeeping.
     */
    record(input) {
        const now = new Date().toISOString();
        const entry = {
            id: (0, utils_1.uid)("aud"),
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
        repository_1.auditRepository.logs.create(entry);
        return entry;
    },
    list(query = {}) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const q = (query.search ?? "").trim().toLowerCase();
        const items = repository_1.auditRepository.logs.query({
            searchFields: ["action", "entity", "actorEmail", "entityId"],
            search: q || undefined,
            filter: (log) => (query.entity === undefined || log.entity === query.entity) &&
                (query.entityId === undefined || log.entityId === query.entityId) &&
                (query.actorId === undefined || log.actorId === query.actorId) &&
                (query.action === undefined || log.action === query.action),
            sort: (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        });
        const { items: paged, pagination } = (0, common_1.paginate)(items, page, limit);
        return { items: paged, pagination };
    },
};
exports.default = exports.auditService;
//# sourceMappingURL=index.js.map