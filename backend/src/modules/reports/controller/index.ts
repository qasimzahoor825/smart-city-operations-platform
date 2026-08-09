import type { Request, Response } from "express";
import { reportService } from "../service";
import { asyncHandler, createApiResponse } from "../../../core/utils";
import { AppError } from "@smartcity/common";

export const reportController = {
  overview: asyncHandler(async (_req: Request, res: Response) => {
    const overview = await reportService.overview();
    res.json(createApiResponse(true, "Report overview", overview));
  }),

  analytics: asyncHandler(async (_req: Request, res: Response) => {
    const analytics = await reportService.analytics();
    res.json(createApiResponse(true, "Report analytics", analytics));
  }),

  exportReport: asyncHandler(async (req: Request, res: Response) => {
    const requested = typeof req.query.format === "string" ? req.query.format : "json";
    const format = requested === "csv" ? "csv" : "json";
    if (requested !== "json" && requested !== "csv") {
      throw new AppError("Invalid format. Allowed: json, csv", 422);
    }
    const report = await reportService.exportReport(format);
    if (format === "csv") {
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="smartcity-report-${Date.now()}.csv"`);
      res.send(report.data as string);
      return;
    }
    res.json(createApiResponse(true, "Report exported", report));
  }),
};

export default reportController;