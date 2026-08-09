import { Router } from "express";
import { UserRole } from "@smartcity/common";
import { auditController } from "../controller";
import { requireAuth, requireRole } from "../../../middleware/auth";

export const auditRouter = Router();

auditRouter.use(requireAuth, requireRole(UserRole.SUPER_ADMIN));

auditRouter.get("/", auditController.list);
auditRouter.get("/stats", auditController.stats);

export default auditRouter;