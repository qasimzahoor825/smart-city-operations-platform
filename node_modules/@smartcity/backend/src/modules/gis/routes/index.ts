import { Router, type RequestHandler } from "express";
import { UserRole } from "@smartcity/common";
import { gisController } from "../controller";
import { requireAuth, requireRole } from "../../../middleware/auth";
import { validateBody } from "../../../middleware/validate";
import { createMarkerSchema } from "../validation";

export const gisRouter = Router();

gisRouter.use(requireAuth);

gisRouter.get("/layers", gisController.layers);
gisRouter.get("/markers", gisController.listMarkers);
gisRouter.get("/markers/stats", gisController.markerStats);
gisRouter.get("/search", gisController.search);
gisRouter.post(
  "/markers",
  requireRole(UserRole.OFFICER, UserRole.DEPARTMENT_HEAD, UserRole.SUPER_ADMIN),
  validateBody(createMarkerSchema) as RequestHandler,
  gisController.createMarker,
);

export default gisRouter;