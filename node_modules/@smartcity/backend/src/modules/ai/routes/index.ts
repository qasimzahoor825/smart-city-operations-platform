import { Router, type RequestHandler } from "express";
import { aiController } from "../controller";
import { requireAuth } from "../../../middleware/auth";
import { validateBody } from "../../../middleware/validate";
import { categorizeSchema } from "../validation";

export const aiRouter = Router();

aiRouter.use(requireAuth);

aiRouter.post(
  "/categorize",
  validateBody(categorizeSchema) as RequestHandler,
  aiController.categorize,
);

export default aiRouter;