import type { Request, Response } from "express";
import { notificationService } from "../service";
import { asyncHandler, createApiResponse, createListResponse } from "../../../core/utils";
import { paginationQuery } from "../../../middleware/paginate";
import type { NotificationPreferencesDto, NotificationQuery, SendNotificationDto } from "../dto";

function bodyOf<T>(req: Request): T {
  return (req as Request & { parsedBody: T }).parsedBody;
}

export const notificationController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = paginationQuery(req);
    const query: NotificationQuery = {
      page,
      limit,
      userId: typeof req.query.userId === "string" ? req.query.userId : req.user!.id,
    };
    if (typeof req.query.unread === "string") query.unread = req.query.unread === "true";
    const { items, pagination } = await notificationService.list(query);
    res.json(createListResponse(items, pagination, "Notifications fetched"));
  }),

  unreadCount: asyncHandler(async (_req: Request, res: Response) => {
    const userId = typeof _req.query.userId === "string" ? _req.query.userId : _req.user!.id;
    const result = await notificationService.unreadCount(userId);
    res.json(createApiResponse(true, "Unread count fetched", result));
  }),

  markRead: asyncHandler(async (req: Request, res: Response) => {
    const notification = await notificationService.markRead(req.params.id, req.user!.id);
    res.json(createApiResponse(true, "Notification marked as read", notification));
  }),

  readAll: asyncHandler(async (req: Request, res: Response) => {
    const result = await notificationService.readAll(req.user!.id);
    res.json(createApiResponse(true, "All notifications marked as read", result));
  }),

  send: asyncHandler(async (req: Request, res: Response) => {
    const dto = bodyOf<SendNotificationDto>(req);
    const result = await notificationService.send(dto);
    res.status(201).json(createApiResponse(true, "Notification dispatched", result));
  }),

  getPreferences: asyncHandler(async (req: Request, res: Response) => {
    const preferences = await notificationService.getPreferences(req.user!.id);
    res.json(createApiResponse(true, "Notification preferences fetched", preferences));
  }),

  updatePreferences: asyncHandler(async (req: Request, res: Response) => {
    const dto = bodyOf<NotificationPreferencesDto>(req);
    const preferences = await notificationService.updatePreferences(req.user!.id, dto);
    res.json(createApiResponse(true, "Notification preferences updated", preferences));
  }),
};

export default notificationController;