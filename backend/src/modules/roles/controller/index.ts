import type { Request, Response } from "express";
import { roleService } from "../service";
import { asyncHandler, createApiResponse } from "../../../core/utils";

export const roleController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    res.json(createApiResponse(true, "Roles fetched", roleService.list()));
  }),

  get: asyncHandler(async (req: Request, res: Response) => {
    const info = roleService.get(req.params.role);
    res.json(createApiResponse(true, "Role fetched", info));
  }),
};

export default roleController;