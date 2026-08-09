import { Router, type RequestHandler } from "express";
import { UserRole } from "@smartcity/common";
import { emergencyController } from "../controller";
import { requireAuth, requireRole } from "../../../middleware/auth";
import { auditAction } from "../../../middleware/audit";
import { validateBody } from "../../../middleware/validate";
import { createEmergencySchema, dispatchEmergencySchema } from "../validation";

export const emergencyRouter = Router();

emergencyRouter.use(requireAuth);

emergencyRouter.get("/", emergencyController.list);
emergencyRouter.get("/stats", emergencyController.stats);
emergencyRouter.post(
  "/",
  auditAction("emergency.created", "emergency"),
  validateBody(createEmergencySchema) as RequestHandler,
  emergencyController.create,
);

emergencyRouter.get("/:id", emergencyController.getById);
emergencyRouter.patch(
  "/:id/dispatch",
  requireRole(UserRole.OFFICER, UserRole.DEPARTMENT_HEAD, UserRole.SUPER_ADMIN),
  auditAction("emergency.status_changed", "emergency"),
  validateBody(dispatchEmergencySchema) as RequestHandler,
  emergencyController.dispatch,
);

export default emergencyRouter;