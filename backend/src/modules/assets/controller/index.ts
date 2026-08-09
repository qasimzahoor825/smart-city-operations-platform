import type { Request, Response } from "express";
import type { AssetCategory, AssetStatus } from "@prisma/client";
import type { UserRole } from "@smartcity/common";
import { assetService } from "../service";
import { asyncHandler, createApiResponse, createListResponse } from "../../../core/utils";
import { paginationQuery } from "../../../middleware/paginate";
import type { Actor, AssetQuery, CreateAssetDto, CreateInspectionDto, UpdateAssetStatusDto } from "../dto";

function actorOf(req: Request): Actor {
  return {
    id: req.user!.id,
    email: req.user!.email,
    role: req.user!.role as UserRole,
    departmentId: req.user!.departmentId,
  };
}

function bodyOf<T>(req: Request): T {
  return (req as Request & { parsedBody: T }).parsedBody;
}

export const assetController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = paginationQuery(req);
    const query: AssetQuery = { page, limit };
    if (typeof req.query.category === "string") query.category = req.query.category as AssetCategory;
    if (typeof req.query.status === "string") query.status = req.query.status as AssetStatus;
    if (typeof req.query.search === "string") query.search = req.query.search;

    const { items, pagination } = await assetService.list(query);
    res.json(createListResponse(items, pagination, "Assets fetched"));
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const asset = await assetService.getById(req.params.id);
    res.json(createApiResponse(true, "Asset fetched", asset));
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const dto = bodyOf<CreateAssetDto>(req);
    const asset = await assetService.create(actorOf(req), dto);
    res.status(201).json(createApiResponse(true, "Asset created", asset));
  }),

  updateStatus: asyncHandler(async (req: Request, res: Response) => {
    const dto = bodyOf<UpdateAssetStatusDto>(req);
    const asset = await assetService.updateStatus(req.params.id, actorOf(req), dto);
    res.json(createApiResponse(true, "Asset status updated", asset));
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await assetService.remove(req.params.id, actorOf(req));
    res.json(createApiResponse(true, "Asset deleted"));
  }),

  listInspections: asyncHandler(async (req: Request, res: Response) => {
    await assetService.getById(req.params.id);
    const inspections = await assetService.listInspections(req.params.id);
    res.json(createApiResponse(true, "Inspections fetched", inspections));
  }),

  createInspection: asyncHandler(async (req: Request, res: Response) => {
    const dto = bodyOf<CreateInspectionDto>(req);
    const inspection = await assetService.createInspection(req.params.id, actorOf(req), dto);
    res.status(201).json(createApiResponse(true, "Inspection recorded", inspection));
  }),

  latestInspection: asyncHandler(async (req: Request, res: Response) => {
    await assetService.getById(req.params.id);
    const latest = await assetService.latestInspection(req.params.id);
    if (!latest) {
      res.json(createApiResponse(true, "No inspections recorded yet", null));
      return;
    }
    res.json(createApiResponse(true, "Latest inspection", latest));
  }),

  stats: asyncHandler(async (_req: Request, res: Response) => {
    const stats = await assetService.stats();
    res.json(createApiResponse(true, "Asset statistics", stats));
  }),
};

export default assetController;