import type { Request, Response } from "express";
import { departmentService } from "../service";
import { asyncHandler, createApiResponse, createListResponse } from "../../../core/utils";
import { paginatedResponse, paginationQuery } from "../../../middleware/paginate";

const firstString = (value: unknown): string | undefined =>
  typeof value === "string" && value.length > 0 ? value : undefined;

export const departmentController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = paginationQuery(req);
    const result = await departmentService.list({
      page,
      limit,
      search: firstString(req.query.search),
    });
    paginatedResponse(res, result.items, { page, limit }, "Departments fetched");
  }),

  /** Public feed: sanitized department summaries, no authentication. */
  publicList: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = paginationQuery(req);
    const result = await departmentService.listPublic({ page, limit });
    res.json(createListResponse(result.items, result.pagination, "Departments fetched"));
  }),

  get: asyncHandler(async (req: Request, res: Response) => {
    const department = await departmentService.getById(req.params.id);
    res.json(createApiResponse(true, "Department fetched", department));
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const department = await departmentService.create(req.body ?? {});
    res.status(201).json(createApiResponse(true, "Department created", department));
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const department = await departmentService.update(req.params.id, req.body ?? {});
    res.json(createApiResponse(true, "Department updated", department));
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await departmentService.remove(req.params.id);
    res.json(createApiResponse(true, "Department deleted"));
  }),

  stats: asyncHandler(async (req: Request, res: Response) => {
    const stats = await departmentService.getStats(req.params.id);
    res.json(createApiResponse(true, "Department statistics fetched", stats));
  }),

  assignOfficers: asyncHandler(async (req: Request, res: Response) => {
    const department = await departmentService.assignOfficers(req.params.id, req.body ?? {});
    res.json(createApiResponse(true, "Officers assigned", department));
  }),
};

export default departmentController;