import { Router } from "express";
import { analyticsController } from "../controller";
import { requireAuth, requireRole } from "../../../middleware/auth";
import { UserRole } from "@smartcity/common";

export const analyticsRouter = Router();

// Analytics are management/decision-support data — staff access only.
analyticsRouter.use(requireAuth, requireRole(UserRole.OFFICER, UserRole.DEPARTMENT_HEAD, UserRole.SUPER_ADMIN));

analyticsRouter.get("/overview", analyticsController.overview);
analyticsRouter.get("/complaints", analyticsController.complaints);
analyticsRouter.get("/departments", analyticsController.departments);
analyticsRouter.get("/assets", analyticsController.assets);
analyticsRouter.get("/sla", analyticsController.sla);
analyticsRouter.get("/citizen-satisfaction", analyticsController.citizenSatisfaction);
analyticsRouter.get("/time-series", analyticsController.timeSeries);

export default analyticsRouter;