import type { Request, Response } from "express";
import type { UserRole } from "@smartcity/common";
import { gisService } from "../service";
import { asyncHandler, createApiResponse, createListResponse } from "../../../core/utils";
import { paginationQuery } from "../../../middleware/paginate";
import type { Actor, CreateMarkerDto, MarkerQuery, MarkerType } from "../dto";

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

function parseBBox(raw: unknown): [number, number, number, number] | undefined {
  if (typeof raw !== "string") return undefined;
  const parts = raw.split(",").map((v) => Number(v.trim()));
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return undefined;
  return [parts[0], parts[1], parts[2], parts[3]];
}

export const gisController = {
  layers: asyncHandler(async (_req: Request, res: Response) => {
    const layers = await gisService.listLayers();
    res.status(200).json(createApiResponse(true, "Layers fetched", layers));
  }),

  listMarkers: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = paginationQuery(req);
    const query: MarkerQuery = { page, limit };
    if (typeof req.query.type === "string") query.type = req.query.type as MarkerType;
    if (typeof req.query.status === "string") query.status = req.query.status;
    if (typeof req.query.search === "string") query.search = req.query.search;
    const bbox = parseBBox(req.query.bbox);
    if (bbox) query.bbox = bbox;

    const { items, pagination } = await gisService.listMarkers(query);
    res.json(createListResponse(items, pagination, "Markers fetched"));
  }),

  markerStats: asyncHandler(async (_req: Request, res: Response) => {
    const stats = await gisService.markerStats();
    res.json(createApiResponse(true, "Marker statistics", stats));
  }),

  createMarker: asyncHandler(async (req: Request, res: Response) => {
    const dto = bodyOf<CreateMarkerDto>(req);
    const marker = await gisService.createMarker(actorOf(req), dto);
    res.status(201).json(createApiResponse(true, "Marker created", marker));
  }),

  search: asyncHandler(async (req: Request, res: Response) => {
    const q = typeof req.query.q === "string" ? req.query.q : "";
    const results = await gisService.search(q);
    res.json(createApiResponse(true, "Search results", results));
  }),
};

export default gisController;