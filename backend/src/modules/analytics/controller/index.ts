import type { Request, Response } from "express";
import { asyncHandler, createApiResponse } from "../../../core/utils";
import { analyticsService } from "../service";

export const analyticsController = {
  overview: asyncHandler(async (_req: Request, res: Response) => {
    const data = await analyticsService.overview();
    res.json(createApiResponse(true, "Analytics overview", data));
  }),

  complaints: asyncHandler(async (_req: Request, res: Response) => {
    const data = await analyticsService.complaints();
    res.json(createApiResponse(true, "Complaint analytics", data));
  }),

  departments: asyncHandler(async (_req: Request, res: Response) => {
    const data = await analyticsService.departments();
    res.json(createApiResponse(true, "Department analytics", data));
  }),

  assets: asyncHandler(async (_req: Request, res: Response) => {
    const data = await analyticsService.assets();
    res.json(createApiResponse(true, "Asset analytics", data));
  }),

  sla: asyncHandler(async (_req: Request, res: Response) => {
    const data = await analyticsService.sla();
    res.json(createApiResponse(true, "SLA analytics", data));
  }),

  citizenSatisfaction: asyncHandler(async (_req: Request, res: Response) => {
    const data = await analyticsService.citizenSatisfaction();
    res.json(createApiResponse(true, "Citizen satisfaction analytics", data));
  }),

  timeSeries: asyncHandler(async (req: Request, res: Response) => {
    const days = Math.min(365, Math.max(1, Number(req.query.days) || 30));
    const data = await analyticsService.timeSeries(days);
    res.json(createApiResponse(true, "Time series analytics", data));
  }),

  forecast: asyncHandler(async (req: Request, res: Response) => {
    const days = Math.min(90, Math.max(7, Number(req.query.days) || 30));
    const data = await analyticsService.forecast(days);
    res.json(createApiResponse(true, "Predictive complaint-volume forecast", data));
  }),
};

export default analyticsController;