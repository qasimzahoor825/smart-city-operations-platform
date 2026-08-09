import type { Request, Response } from "express";
import { newsService } from "../service";
import { asyncHandler, createApiResponse, createListResponse } from "../../../core/utils";
import { paginationQuery } from "../../../middleware/paginate";
import type { Actor, CreateNewsDto, NewsQuery, UpdateNewsDto } from "../dto";

function bodyOf<T>(req: Request): T {
  return (req as Request & { parsedBody: T }).parsedBody;
}

function actorOf(req: Request): Actor {
  return {
    id: req.user!.id,
    email: req.user!.email,
    role: req.user!.role,
  };
}

export const newsController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = paginationQuery(req);
    const query: NewsQuery = { page, limit };
    if (typeof req.query.category === "string") query.category = req.query.category;
    if (typeof req.query.search === "string") query.search = req.query.search;
    if (typeof req.query.published === "string" && (req.query.published === "true" || req.query.published === "false")) {
      query.published = req.query.published === "true";
    }
    const { items, pagination } = await newsService.list(query);
    res.json(createListResponse(items, pagination, "Articles fetched"));
  }),

  /** Public feed: only published articles, no auth. */
  publicList: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = paginationQuery(req);
    const query: NewsQuery = { page, limit, published: true };
    if (typeof req.query.category === "string") query.category = req.query.category;
    const { items, pagination } = await newsService.list(query);
    res.json(createListResponse(items, pagination, "Published articles fetched"));
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const article = await newsService.getById(req.params.id, actorOf(req));
    res.json(createApiResponse(true, "Article fetched", article));
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const dto = bodyOf<CreateNewsDto>(req);
    const article = await newsService.create(dto, actorOf(req));
    res.status(201).json(createApiResponse(true, "Article created", article));
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const dto = bodyOf<UpdateNewsDto>(req);
    const article = await newsService.update(req.params.id, dto);
    res.json(createApiResponse(true, "Article updated", article));
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await newsService.remove(req.params.id);
    res.json(createApiResponse(true, "Article deleted"));
  }),

  stats: asyncHandler(async (_req: Request, res: Response) => {
    const stats = await newsService.stats();
    res.json(createApiResponse(true, "Article statistics", stats));
  }),
};

export default newsController;