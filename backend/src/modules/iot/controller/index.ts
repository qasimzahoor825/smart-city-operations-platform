import type { Request, Response } from "express";
import { asyncHandler, createApiResponse } from "../../../core/utils";
import { iotService } from "../service";
import type { IngestDto } from "../dto";

function bodyOf<T>(req: Request): T {
  return (req as Request & { parsedBody: T }).parsedBody;
}

export const iotController = {
  live: asyncHandler(async (_req: Request, res: Response) => {
    const data = iotService.live();
    res.json(createApiResponse(true, "Live sensor readings", data));
  }),

  sensors: asyncHandler(async (_req: Request, res: Response) => {
    res.json(createApiResponse(true, "Registered IoT sensors", iotService.sensors()));
  }),

  sensorReadings: asyncHandler(async (req: Request, res: Response) => {
    const limit = Math.min(500, Math.max(1, Number(req.query.limit) || 120));
    const data = iotService.readingsFor(req.params.sensorId, limit);
    res.json(createApiResponse(true, "Sensor reading history", data));
  }),

  anomalies: asyncHandler(async (req: Request, res: Response) => {
    const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 50));
    const threshold = Math.min(6, Math.max(1.5, Number(req.query.threshold) || 3));
    const data = iotService.anomalies(limit, threshold);
    res.json(createApiResponse(true, "Detected IoT anomalies", data));
  }),

  anomalyOverview: asyncHandler(async (_req: Request, res: Response) => {
    const data = iotService.anomalyOverview();
    res.json(createApiResponse(true, "IoT anomaly overview", data));
  }),

  ingest: asyncHandler(async (req: Request, res: Response) => {
    const dto = bodyOf<IngestDto>(req);
    const result = iotService.ingest(dto);
    res.status(201).json(createApiResponse(true, "Reading ingested", result));
  }),
};

export default iotController;
