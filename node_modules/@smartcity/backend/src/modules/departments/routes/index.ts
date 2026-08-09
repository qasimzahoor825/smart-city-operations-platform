import type { NextFunction, Request, Response } from "express";
import { Router, type RequestHandler } from "express";
import { UserRole } from "@smartcity/common";
import { ForbiddenError } from "@smartcity/common";
import { departmentController } from "../controller";
import { requireAuth, requireRole } from "../../../middleware/auth";
import { auditAction } from "../../../middleware/audit";
import { validateBody, validateParams } from "../../../middleware/validate";
import {
  assignOfficersSchema,
  createDepartmentSchema,
  departmentIdParamSchema,
  updateDepartmentSchema,
} from "../validation";

function requireDepartmentScope(req: Request, _res: Response, next: NextFunction): void {
  if (req.user?.role === UserRole.SUPER_ADMIN) {
    next();
    return;
  }
  if (req.user?.role === UserRole.DEPARTMENT_HEAD && req.user.departmentId === req.params.id) {
    next();
    return;
  }
  throw new ForbiddenError("You can only manage your own department");
}

export const departmentRouter = Router();

departmentRouter.get("/", requireAuth, departmentController.list);
departmentRouter.get("/:id", requireAuth, validateParams(departmentIdParamSchema) as RequestHandler, departmentController.get);
departmentRouter.get(
  "/:id/stats",
  requireAuth,
  validateParams(departmentIdParamSchema) as RequestHandler,
  departmentController.stats,
);

departmentRouter.post(
  "/",
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN),
  auditAction("department.created", "department"),
  validateBody(createDepartmentSchema) as RequestHandler,
  departmentController.create,
);
departmentRouter.patch(
  "/:id",
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN),
  auditAction("department.updated", "department"),
  validateParams(departmentIdParamSchema) as RequestHandler,
  validateBody(updateDepartmentSchema) as RequestHandler,
  departmentController.update,
);
departmentRouter.delete(
  "/:id",
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN),
  auditAction("department.deleted", "department"),
  validateParams(departmentIdParamSchema) as RequestHandler,
  departmentController.remove,
);

departmentRouter.post(
  "/:id/officers",
  requireAuth,
  requireRole(UserRole.DEPARTMENT_HEAD, UserRole.SUPER_ADMIN),
  requireDepartmentScope,
  auditAction("department.officers_updated", "department"),
  validateBody(assignOfficersSchema) as RequestHandler,
  departmentController.assignOfficers,
);

export default departmentRouter;