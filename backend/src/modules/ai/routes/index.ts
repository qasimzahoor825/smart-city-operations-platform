import { Router, type RequestHandler } from "express";
import { aiController } from "../controller";
import { requireAuth } from "../../../middleware/auth";
import { validateBody } from "../../../middleware/validate";
import { categorizeSchema, chatSchema, validateImageSchema } from "../validation";

export const aiRouter = Router();

aiRouter.use(requireAuth);

aiRouter.post(
  "/categorize",
  validateBody(categorizeSchema) as RequestHandler,
  aiController.categorize,
);

aiRouter.post(
  "/chat/stream",
  validateBody(chatSchema) as RequestHandler,
  aiController.chatStream,
);

aiRouter.post(
  "/chat",
  validateBody(chatSchema) as RequestHandler,
  aiController.chat,
);

aiRouter.post(
  "/validate-image",
  validateBody(validateImageSchema) as RequestHandler,
  aiController.validateImage,
);

export default aiRouter;