import { Router, type RequestHandler } from "express";
import { UserRole } from "@smartcity/common";
import { slaController } from "../controller";
import { requireAuth, requireRole } from "../../../middleware/auth";
import { auditAction } from "../../../middleware/audit";
import { validateBody, validateParams } from "../../../middleware/validate";
import { createSlaRuleSchema, slaIdParamSchema, updateSlaRuleSchema } from "../validation";

export const slaRouter = Router();

slaRouter.use(requireAuth);

slaRouter.get("/", slaController.list);
slaRouter.get(
  "/:id",
  validateParams(slaIdParamSchema) as RequestHandler,
  slaController.get,
);

slaRouter.post(
  "/",
  requireRole(UserRole.SUPER_ADMIN),
  auditAction("sla.rule_created", "sla"),
  validateBody(createSlaRuleSchema) as RequestHandler,
  slaController.create,
);
slaRouter.patch(
  "/:id",
  requireRole(UserRole.SUPER_ADMIN),
  auditAction("sla.rule_updated", "sla"),
  validateParams(slaIdParamSchema) as RequestHandler,
  validateBody(updateSlaRuleSchema) as RequestHandler,
  slaController.update,
);

export default slaRouter;