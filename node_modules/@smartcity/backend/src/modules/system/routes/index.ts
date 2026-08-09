import { Router, type RequestHandler } from "express";
import { UserRole } from "@smartcity/common";
import { systemController } from "../controller";
import { requireAuth, requireRole } from "../../../middleware/auth";
import { validateBody } from "../../../middleware/validate";
import { updateSettingsSchema } from "../validation";
import { systemRepository } from "../repository";

export const systemRouter = Router();

systemRouter.use(requireAuth);
systemRouter.use((_req, _res, next) => {
  systemRepository.recordRequest();
  next();
});

systemRouter.get("/health", systemController.health);
systemRouter.get("/settings", systemController.getSettings);
systemRouter.put(
  "/settings",
  requireRole(UserRole.SUPER_ADMIN),
  validateBody(updateSettingsSchema) as RequestHandler,
  systemController.updateSettings,
);
systemRouter.get("/metrics", systemController.metrics);

export default systemRouter;