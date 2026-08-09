import type { Request, Response } from "express";
import { auditService } from "../service";
import { asyncHandler, createApiResponse, createListResponse } from "../../../core/utils";
import { paginationQuery } from "../../../middleware/paginate";

export const auditController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = paginationQuery(req);
    const query = { page, limit };
    if (typeof req.query.entity === "string") (query as { entity?: string }).entity = req.query.entity;
    if (typeof req.query.entityId === "string") (query as { entityId?: string }).entityId = req.query.entityId;
    if (typeof req.query.actorId === "string") (query as { actorId?: string }).actorId = req.query.actorId;
    if (typeof req.query.action === "string") (query as { action?: string }).action = req.query.action;
    if (typeof req.query.search === "string") (query as { search?: string }).search = req.query.search;

    const { items, pagination } = auditService.list(query);
    res.json(createListResponse(items, pagination, "Audit logs fetched"));
  }),

  stats: asyncHandler(async (_req: Request, res: Response) => {
    const logs = auditService.list({ limit: 1000 }).items;
    const byAction: Record<string, number> = {};
    const byEntity: Record<string, number> = {};
    for (const log of logs) {
      byAction[log.action] = (byAction[log.action] ?? 0) + 1;
      byEntity[log.entity ?? "unknown"] = (byEntity[log.entity ?? "unknown"] ?? 0) + 1;
    }
    res.json(createApiResponse(true, "Audit statistics", { total: logs.length, byAction, byEntity }));
  }),
};

export default auditController;