import type { Request, Response } from "express";
import { citizenService } from "../service";
import { asyncHandler, createApiResponse } from "../../../core/utils";
import { paginatedResponse, paginationQuery } from "../../../middleware/paginate";

const firstString = (value: unknown): string | undefined =>
  typeof value === "string" && value.length > 0 ? value : undefined;

export const citizenController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = paginationQuery(req);
    const result = await citizenService.list({
      page,
      limit,
      search: firstString(req.query.search),
      ward: firstString(req.query.ward),
    });
    paginatedResponse(res, result.items, { page, limit }, "Citizens fetched");
  }),

  get: asyncHandler(async (req: Request, res: Response) => {
    const citizen = await citizenService.getById(req.params.id);
    res.json(createApiResponse(true, "Citizen fetched", citizen));
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const citizen = await citizenService.updateProfile(req.params.id, req.body ?? {});
    res.json(createApiResponse(true, "Citizen profile updated", citizen));
  }),

  stats: asyncHandler(async (req: Request, res: Response) => {
    const stats = await citizenService.getStats(req.params.id);
    res.json(createApiResponse(true, "Citizen statistics fetched", stats));
  }),

  overview: asyncHandler(async (_req: Request, res: Response) => {
    const overview = await citizenService.overview();
    res.json(createApiResponse(true, "Citizen overview fetched", overview));
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    const citizen = await citizenService.getById(req.user!.id);
    res.json(createApiResponse(true, "Current citizen fetched", citizen));
  }),
};

export default citizenController;