import { Router, type RequestHandler } from "express";
import { notificationController } from "../controller";
import { requireAuth } from "../../../middleware/auth";
import { validateBody, validateParams } from "../../../middleware/validate";
import { notificationParamsSchema, sendNotificationSchema, updatePreferencesSchema } from "../validation";

export const notificationRouter = Router();

notificationRouter.use(requireAuth);

notificationRouter.get("/", notificationController.list);
notificationRouter.get("/unread-count", notificationController.unreadCount);
notificationRouter.get("/preferences", notificationController.getPreferences);
notificationRouter.put(
  "/preferences",
  validateBody(updatePreferencesSchema) as RequestHandler,
  notificationController.updatePreferences,
);
notificationRouter.post("/read-all", notificationController.readAll);
notificationRouter.post(
  "/send",
  validateBody(sendNotificationSchema) as RequestHandler,
  notificationController.send,
);
notificationRouter.patch(
  "/:id/read",
  validateParams(notificationParamsSchema) as RequestHandler,
  notificationController.markRead,
);

export default notificationRouter;