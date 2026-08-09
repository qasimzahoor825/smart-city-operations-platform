import type { Request, Response } from "express";
import type { AppointmentStatus } from "@prisma/client";
import type { UserRole } from "@smartcity/common";
import { appointmentService } from "../service";
import { asyncHandler, createApiResponse, createListResponse } from "../../../core/utils";
import { paginationQuery } from "../../../middleware/paginate";
import type {
  Actor,
  AppointmentQuery,
  AppointmentStatusDto,
  CreateAppointmentDto,
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

export const appointmentController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = paginationQuery(req);
    const query: AppointmentQuery = { page, limit };
    if (typeof req.query.citizenId === "string") query.citizenId = req.query.citizenId;
    if (typeof req.query.departmentId === "string") query.departmentId = req.query.departmentId;
    if (typeof req.query.status === "string") query.status = req.query.status as AppointmentStatus;
    if (typeof req.query.search === "string") query.search = req.query.search;

    const { items, pagination } = await appointmentService.list(query);
    res.json(createListResponse(items, pagination, "Appointments fetched"));
  }),

  stats: asyncHandler(async (_req: Request, res: Response) => {
    const stats = await appointmentService.stats();
    res.json(createApiResponse(true, "Appointment statistics", stats));
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const appointment = await appointmentService.getById(req.params.id);
    res.json(createApiResponse(true, "Appointment fetched", appointment));
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const dto = bodyOf<CreateAppointmentDto>(req);
    const appointment = await appointmentService.create(actorOf(req), dto);
    res.status(201).json(createApiResponse(true, "Appointment booked", appointment));
  }),

  status: asyncHandler(async (req: Request, res: Response) => {
    const dto = bodyOf<AppointmentStatusDto>(req);
    const appointment = await appointmentService.updateStatus(req.params.id, actorOf(req), dto);
    res.json(createApiResponse(true, "Appointment status updated", appointment));
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await appointmentService.remove(req.params.id, actorOf(req));
    res.json(createApiResponse(true, "Appointment deleted"));
  }),
};

export default appointmentController;