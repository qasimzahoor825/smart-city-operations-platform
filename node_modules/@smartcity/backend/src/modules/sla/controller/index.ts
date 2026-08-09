import type { Request, Response } from "express";
import { AppError } from "@smartcity/common";
import { asyncHandler, createApiResponse } from "../../../core/utils";
import { slaService } from "../service";
import { slaRepository } from "../repository";
import type { SlaRuleDto } from "../dto";

export const slaController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    const rules = await slaService.list();
    res.json(createApiResponse(true, "SLA rules fetched", rules));
  }),

  get: asyncHandler(async (req: Request, res: Response) => {
    const rule = slaRepository.rules.findById(req.params.id) as SlaRuleDto | undefined;
    if (!rule) throw new AppError("SLA rule not found", 404);
    res.json(createApiResponse(true, "SLA rule fetched", rule));
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const body = (req as Request & { parsedBody?: Record<string, never> }).parsedBody ?? req.body;
    const rule = await slaService.upsert({
      id: `sla_${Date.now().toString(36)}`,
      name: body.name,
      priority: body.priority,
      category: body.category ?? null,
      departmentId: body.departmentId ?? null,
      hours: body.hours,
      active: body.active ?? true,
    });
    res.status(201).json(createApiResponse(true, "SLA rule created", rule));
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const existing = slaRepository.rules.findById(req.params.id) as SlaRuleDto | undefined;
    if (!existing) throw new AppError("SLA rule not found", 404);

    const body = (req as Request & { parsedBody?: Record<string, never> }).parsedBody ?? req.body;
    const updated = await slaService.upsert({
      ...existing,
      name: body.name ?? existing.name,
      priority: body.priority ?? existing.priority,
      category: body.category !== undefined ? body.category : existing.category,
      departmentId: body.departmentId !== undefined ? body.departmentId : existing.departmentId,
      hours: body.hours ?? existing.hours,
      active: body.active ?? existing.active,
    });
    res.json(createApiResponse(true, "SLA rule updated", updated));
  }),
};

export default slaController;