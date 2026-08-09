import { Router, type RequestHandler } from "express";
import { UserRole } from "@smartcity/common";
import { newsController } from "../controller";
import { requireAuth, requireRole } from "../../../middleware/auth";
import { validateBody } from "../../../middleware/validate";
import { createNewsSchema, updateNewsSchema } from "../validation";

export const newsRouter = Router();

// Public feed — published articles only, no authentication required.
newsRouter.get("/public", newsController.publicList);

newsRouter.use(requireAuth);

newsRouter.get("/", newsController.list);
newsRouter.get("/stats", newsController.stats);
newsRouter.post(
  "/",
  requireRole(UserRole.SUPER_ADMIN),
  validateBody(createNewsSchema) as RequestHandler,
  newsController.create,
);
newsRouter.get("/:id", newsController.getById);
newsRouter.patch(
  "/:id",
  requireRole(UserRole.SUPER_ADMIN),
  validateBody(updateNewsSchema) as RequestHandler,
  newsController.update,
);
newsRouter.delete("/:id", requireRole(UserRole.SUPER_ADMIN), newsController.remove);

export default newsRouter;