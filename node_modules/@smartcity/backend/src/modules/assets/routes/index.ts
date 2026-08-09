import { Router, type RequestHandler } from "express";
import { UserRole } from "@smartcity/common";
import { assetController } from "../controller";
import { requireAuth, requireRole } from "../../../middleware/auth";
import { auditAction } from "../../../middleware/audit";
import { validateBody } from "../../../middleware/validate";
import { createAssetSchema, createInspectionSchema, updateAssetStatusSchema } from "../validation";

export const assetRouter = Router();

assetRouter.use(requireAuth);

assetRouter.get("/", assetController.list);
assetRouter.get("/stats", assetController.stats);
assetRouter.get("/:id", assetController.getById);

assetRouter.post(
  "/",
  requireRole(UserRole.OFFICER, UserRole.DEPARTMENT_HEAD, UserRole.SUPER_ADMIN),
  auditAction("asset.created", "asset"),
  validateBody(createAssetSchema) as RequestHandler,
  assetController.create,
);
assetRouter.patch(
  "/:id/status",
  requireRole(UserRole.OFFICER, UserRole.DEPARTMENT_HEAD, UserRole.SUPER_ADMIN),
  auditAction("asset.status_changed", "asset"),
  validateBody(updateAssetStatusSchema) as RequestHandler,
  assetController.updateStatus,
);
assetRouter.delete(
  "/:id",
  requireRole(UserRole.OFFICER, UserRole.DEPARTMENT_HEAD, UserRole.SUPER_ADMIN),
  auditAction("asset.deleted", "asset"),
  assetController.remove,
);

assetRouter.get("/:id/inspections", assetController.listInspections);
assetRouter.post(
  "/:id/inspections",
  requireRole(UserRole.OFFICER, UserRole.DEPARTMENT_HEAD, UserRole.SUPER_ADMIN),
  auditAction("asset.inspected", "asset"),
  validateBody(createInspectionSchema) as RequestHandler,
  assetController.createInspection,
);
assetRouter.get("/:id/inspections/latest", assetController.latestInspection);

export default assetRouter;