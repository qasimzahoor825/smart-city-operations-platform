import type { Request, Response } from "express";
import { UserRole } from "@smartcity/common";
import { userService } from "../service";
import { asyncHandler, createApiResponse } from "../../../core/utils";
import { paginatedResponse, paginationQuery } from "../../../middleware/paginate";

const toRole = (value: unknown): UserRole | undefined =>
  typeof value === "string" && (Object.values(UserRole) as string[]).includes(value)
    ? (value as UserRole)
    : undefined;

const firstString = (value: unknown): string | undefined =>
  typeof value === "string" && value.length > 0 ? value : undefined;

export const userController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = paginationQuery(req);
    const result = await userService.list({
      page,
      limit,
      role: toRole(req.query.role),
      search: firstString(req.query.search),
      departmentId: firstString(req.query.departmentId),
    });
    paginatedResponse(res, result.items, { page, limit }, "Users fetched");
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.getById(req.user!.id);
    res.json(createApiResponse(true, "Current user fetched", user));
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.create(req.body ?? {});
    res.status(201).json(createApiResponse(true, "User provisioned", user));
  }),

  get: asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.getById(req.params.id);
    res.json(createApiResponse(true, "User fetched", user));
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.update(req.params.id, req.body ?? {});
    res.json(createApiResponse(true, "User updated", user));
  }),

  activate: asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.setActive(req.params.id, true);
    res.json(createApiResponse(true, "User activated", user));
  }),

  deactivate: asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.setActive(req.params.id, false);
    res.json(createApiResponse(true, "User deactivated", user));
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await userService.remove(req.params.id);
    res.json(createApiResponse(true, "User deleted"));
  }),
};

export default userController;