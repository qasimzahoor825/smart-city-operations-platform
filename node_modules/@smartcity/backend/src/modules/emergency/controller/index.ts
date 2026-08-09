import type { Request, Response } from "express";
import type { EmergencyStatus, EmergencyType, TicketPriority } from "@prisma/client";
import type { UserRole } from "@smartcity/common";
import { emergencyService } from "../service";
import { asyncHandler, createApiResponse, createListResponse } from "../../../core/utils";
import { paginationQuery } from "../../../middleware/paginate";
import type {
  Actor,
  CreateEmergencyDto,
  DispatchEmergencyDto,
  EmergencyQuery,
} from "../dto";

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

export const emergencyController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = paginationQuery(req);
    const query: EmergencyQuery = { page, limit };
    if (typeof req.query.status === "string") query.status = req.query.status as EmergencyStatus;
    if (typeof req.query.type === "string") query.type = req.query.type as EmergencyType;
    if (typeof req.query.severity === "string") query.severity = req.query.severity as TicketPriority;
    if (typeof req.query.search === "string") query.search = req.query.search;

    const { items, pagination } = await emergencyService.list(query);
    res.json(createListResponse(items, pagination, "Emergencies fetched"));
  }),

  stats: asyncHandler(async (_req: Request, res: Response) => {
    const stats = await emergencyService.stats();
    res.json(createApiResponse(true, "Emergency statistics", stats));
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const emergency = await emergencyService.getById(req.params.id);
    res.json(createApiResponse(true, "Emergency fetched", emergency));
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const dto = bodyOf<CreateEmergencyDto>(req);
    const emergency = await emergencyService.create(actorOf(req), dto);
    res.status(201).json(createApiResponse(true, "Emergency reported", emergency));
  }),

  dispatch: asyncHandler(async (req: Request, res: Response) => {
    const dto = bodyOf<DispatchEmergencyDto>(req);
    const emergency = await emergencyService.dispatch(req.params.id, dto, actorOf(req));
    res.json(createApiResponse(true, "Emergency dispatched", emergency));
  }),
};

export default emergencyController;