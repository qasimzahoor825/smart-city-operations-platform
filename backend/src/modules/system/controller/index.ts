import type { Request, Response } from "express";
import { systemService } from "../service";
import { asyncHandler, createApiResponse } from "../../../core/utils";
import type { UpdateSettingsDto } from "../dto";

function bodyOf<T>(req: Request): T {
  return (req as Request & { parsedBody: T }).parsedBody;
}

export const systemController = {
  health: asyncHandler(async (_req: Request, res: Response) => {
    const health = await systemService.health();
    res.json(createApiResponse(true, "System health", health));
  }),

  getSettings: asyncHandler(async (_req: Request, res: Response) => {
    const settings = await systemService.getSettings();
    res.json(createApiResponse(true, "Platform settings fetched", settings));
  }),

  updateSettings: asyncHandler(async (req: Request, res: Response) => {
    const dto = bodyOf<UpdateSettingsDto>(req);
    const settings = await systemService.updateSettings(dto);
    res.json(createApiResponse(true, "Platform settings updated", settings));
  }),

  metrics: asyncHandler(async (_req: Request, res: Response) => {
    const metrics = await systemService.getMetrics();
    res.json(createApiResponse(true, "System metrics", metrics));
  }),
};

export default systemController;