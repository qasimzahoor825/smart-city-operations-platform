import { Router, type RequestHandler } from "express";
import { UserRole } from "@smartcity/common";
import { iotController } from "../controller";
import { requireAuth, requireRole } from "../../../middleware/auth";
import { validateBody } from "../../../middleware/validate";
import { ingestSchema } from "../validation";

export const iotRouter = Router();

// Device telemetry ingestion — no user token required (sensors are not people).
iotRouter.post("/ingest", validateBody(ingestSchema) as RequestHandler, iotController.ingest);

iotRouter.use(requireAuth);

iotRouter.get("/readings/live", iotController.live);
iotRouter.get("/readings/:sensorId", iotController.sensorReadings);
iotRouter.get("/sensors", iotController.sensors);

// Anomaly intelligence is an operations/command-centre view — staff access only.
iotRouter.get(
  "/anomalies/overview",
  requireRole(UserRole.OFFICER, UserRole.DEPARTMENT_HEAD, UserRole.SUPER_ADMIN),
  iotController.anomalyOverview,
);
iotRouter.get(
  "/anomalies",
  requireRole(UserRole.OFFICER, UserRole.DEPARTMENT_HEAD, UserRole.SUPER_ADMIN),
  iotController.anomalies,
);

export default iotRouter;
