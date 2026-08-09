import { Router, type RequestHandler } from "express";
import { roleController } from "../controller";
import { requireAuth } from "../../../middleware/auth";
import { validateParams } from "../../../middleware/validate";
import { roleParamSchema } from "../validation";

export const roleRouter = Router();

roleRouter.get("/", requireAuth, roleController.list);
roleRouter.get("/:role", requireAuth, validateParams(roleParamSchema) as RequestHandler, roleController.get);

export default roleRouter;