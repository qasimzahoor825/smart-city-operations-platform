import { Router, type RequestHandler } from "express";
import { UserRole } from "@smartcity/common";
import { userController } from "../controller";
import { requireAuth, requireRole, requireSameUserOrRole } from "../../../middleware/auth";
import { auditAction } from "../../../middleware/audit";
import { validateBody, validateParams, validateQuery } from "../../../middleware/validate";
import {
  createUserSchema,
  listUsersQuerySchema,
  updateUserSchema,
  userIdParamSchema,
} from "../validation";

export const userRouter = Router();

userRouter.get(
  "/",
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN, UserRole.DEPARTMENT_HEAD),
  validateQuery(listUsersQuerySchema) as RequestHandler,
  userController.list,
);
userRouter.get("/me", requireAuth, userController.me);
userRouter.post(
  "/",
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN),
  auditAction("user.created", "user"),
  validateBody(createUserSchema) as RequestHandler,
  userController.create,
);

userRouter.get(
  "/:id",
  requireAuth,
  requireSameUserOrRole(UserRole.SUPER_ADMIN),
  validateParams(userIdParamSchema) as RequestHandler,
  userController.get,
);
userRouter.patch(
  "/:id",
  requireAuth,
  requireSameUserOrRole(UserRole.SUPER_ADMIN),
  auditAction("user.updated", "user"),
  validateParams(userIdParamSchema) as RequestHandler,
  validateBody(updateUserSchema) as RequestHandler,
  userController.update,
);
userRouter.patch(
  "/:id/activate",
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN),
  auditAction("user.activated", "user"),
  validateParams(userIdParamSchema) as RequestHandler,
  userController.activate,
);
userRouter.patch(
  "/:id/deactivate",
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN),
  auditAction("user.deactivated", "user"),
  validateParams(userIdParamSchema) as RequestHandler,
  userController.deactivate,
);
userRouter.delete(
  "/:id",
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN),
  auditAction("user.deleted", "user"),
  validateParams(userIdParamSchema) as RequestHandler,
  userController.remove,
);

export default userRouter;