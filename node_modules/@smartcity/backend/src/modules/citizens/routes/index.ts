import { Router, type RequestHandler } from "express";
import { UserRole } from "@smartcity/common";
import { citizenController } from "../controller";
import { requireAuth, requireRole, requireSameUserOrRole } from "../../../middleware/auth";
import { validateBody, validateParams, validateQuery } from "../../../middleware/validate";
import {
  citizenIdParamSchema,
  listCitizensQuerySchema,
  updateCitizenProfileSchema,
} from "../validation";

const CITIZEN_MANAGERS = [UserRole.OFFICER, UserRole.DEPARTMENT_HEAD, UserRole.SUPER_ADMIN];

export const citizenRouter = Router();

citizenRouter.get(
  "/",
  requireAuth,
  requireRole(...CITIZEN_MANAGERS),
  validateQuery(listCitizensQuerySchema) as RequestHandler,
  citizenController.list,
);
citizenRouter.get("/stats", requireAuth, citizenController.overview);
citizenRouter.get("/me", requireAuth, citizenController.me);

citizenRouter.get(
  "/:id",
  requireAuth,
  requireSameUserOrRole(...CITIZEN_MANAGERS),
  validateParams(citizenIdParamSchema) as RequestHandler,
  citizenController.get,
);
citizenRouter.get(
  "/:id/stats",
  requireAuth,
  requireSameUserOrRole(...CITIZEN_MANAGERS),
  validateParams(citizenIdParamSchema) as RequestHandler,
  citizenController.stats,
);
citizenRouter.patch(
  "/:id",
  requireAuth,
  requireSameUserOrRole(...CITIZEN_MANAGERS),
  validateParams(citizenIdParamSchema) as RequestHandler,
  validateBody(updateCitizenProfileSchema) as RequestHandler,
  citizenController.update,
);

export default citizenRouter;