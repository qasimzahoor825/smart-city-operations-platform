import type { Request, Response } from "express";
import type { TicketPriority, TicketStatus } from "@prisma/client";
import type { UserRole } from "@smartcity/common";
import { complaintService } from "../service";
import { asyncHandler, createApiResponse, createListResponse } from "../../../core/utils";
import { paginationQuery } from "../../../middleware/paginate";
import type {
  Actor,
  AssignComplaintDto,
  CommentDto,
  ComplaintQuery,
  ComplaintStatusDto,
  CreateComplaintDto,
  UpdateComplaintDto,
} from "../dto";

function actorOf(req: Request): Actor {
  return {
    id: req.user!.id,
    email: req.user!.email,
    role: req.user!.role as UserRole,
    departmentId: req.user!.departmentId,
    ip: req.user!.ip ?? null,
    userAgent: req.user!.userAgent ?? null,
  };
}

function bodyOf<T>(req: Request): T {
  return (req as Request & { parsedBody: T }).parsedBody;
}

export const complaintController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = paginationQuery(req);
    const query: ComplaintQuery = { page, limit };
    if (typeof req.query.status === "string") query.status = req.query.status as TicketStatus;
    if (typeof req.query.priority === "string") query.priority = req.query.priority as TicketPriority;
    if (typeof req.query.category === "string") query.category = req.query.category;
    if (typeof req.query.search === "string") query.search = req.query.search;
    if (typeof req.query.citizenId === "string") query.citizenId = req.query.citizenId;

    const { items, pagination } = await complaintService.list(query);
    res.json(createListResponse(items, pagination, "Complaints fetched"));
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const complaint = await complaintService.getById(req.params.id);
    res.json(createApiResponse(true, "Complaint fetched", complaint));
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const dto = bodyOf<CreateComplaintDto>(req);
    const complaint = await complaintService.create(actorOf(req), dto);
    res.status(201).json(createApiResponse(true, "Complaint submitted", complaint));
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const dto = bodyOf<UpdateComplaintDto>(req);
    const complaint = await complaintService.update(req.params.id, actorOf(req), dto);
    res.json(createApiResponse(true, "Complaint updated", complaint));
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await complaintService.remove(req.params.id, actorOf(req));
    res.json(createApiResponse(true, "Complaint deleted"));
  }),

  status: asyncHandler(async (req: Request, res: Response) => {
    const dto = bodyOf<ComplaintStatusDto>(req);
    const complaint = await complaintService.updateStatus(req.params.id, dto, actorOf(req));
    res.locals.auditMeta = { toStatus: complaint.status, note: dto.note ?? null };
    res.locals.auditEntityId = complaint.id;
    res.json(createApiResponse(true, "Complaint status updated", complaint));
  }),

  assign: asyncHandler(async (req: Request, res: Response) => {
    const dto = bodyOf<AssignComplaintDto>(req);
    const complaint = await complaintService.assign(req.params.id, dto, actorOf(req));
    res.locals.auditMeta = { officerId: dto.officerId, toStatus: complaint.status };
    res.locals.auditEntityId = complaint.id;
    res.json(createApiResponse(true, "Complaint assigned", complaint));
  }),

  addComment: asyncHandler(async (req: Request, res: Response) => {
    const dto = bodyOf<CommentDto>(req);
    const comment = await complaintService.addComment(req.params.id, actorOf(req), dto);
    res.status(201).json(createApiResponse(true, "Comment added", comment));
  }),

  listComments: asyncHandler(async (req: Request, res: Response) => {
    const comments = await complaintService.listComments(req.params.id);
    res.json(createApiResponse(true, "Comments fetched", comments));
  }),

  submitFeedback: asyncHandler(async (req: Request, res: Response) => {
    const dto = bodyOf<{ rating: number; comment?: string }>(req);
    const feedback = await complaintService.submitFeedback(req.params.id, dto, actorOf(req));
    res.status(201).json(createApiResponse(true, "Feedback submitted", feedback));
  }),

  getFeedback: asyncHandler(async (req: Request, res: Response) => {
    const feedback = await complaintService.getFeedback(req.params.id);
    res.json(createApiResponse(true, "Feedback fetched", feedback));
  }),

  stats: asyncHandler(async (_req: Request, res: Response) => {
    const stats = await complaintService.stats();
    res.json(createApiResponse(true, "Complaint statistics", stats));
  }),
};

export default complaintController;