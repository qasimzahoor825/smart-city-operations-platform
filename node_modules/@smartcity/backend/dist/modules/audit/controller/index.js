"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditController = void 0;
const service_1 = require("../service");
const utils_1 = require("../../../core/utils");
const paginate_1 = require("../../../middleware/paginate");
exports.auditController = {
    list: (0, utils_1.asyncHandler)(async (req, res) => {
        const { page, limit } = (0, paginate_1.paginationQuery)(req);
        const query = { page, limit };
        if (typeof req.query.entity === "string")
            query.entity = req.query.entity;
        if (typeof req.query.entityId === "string")
            query.entityId = req.query.entityId;
        if (typeof req.query.actorId === "string")
            query.actorId = req.query.actorId;
        if (typeof req.query.action === "string")
            query.action = req.query.action;
        if (typeof req.query.search === "string")
            query.search = req.query.search;
        const { items, pagination } = service_1.auditService.list(query);
        res.json((0, utils_1.createListResponse)(items, pagination, "Audit logs fetched"));
    }),
    stats: (0, utils_1.asyncHandler)(async (_req, res) => {
        const logs = service_1.auditService.list({ limit: 1000 }).items;
        const byAction = {};
        const byEntity = {};
        for (const log of logs) {
            byAction[log.action] = (byAction[log.action] ?? 0) + 1;
            byEntity[log.entity ?? "unknown"] = (byEntity[log.entity ?? "unknown"] ?? 0) + 1;
        }
        res.json((0, utils_1.createApiResponse)(true, "Audit statistics", { total: logs.length, byAction, byEntity }));
    }),
};
exports.default = exports.auditController;
//# sourceMappingURL=index.js.map