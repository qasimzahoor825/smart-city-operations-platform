import { Router, type RequestHandler } from "express";
import { UserRole } from "@smartcity/common";
import { complaintController } from "../controller";
import { requireAuth, requireRole } from "../../../middleware/auth";
import { auditAction } from "../../../middleware/audit";
import { validateBody } from "../../../middleware/validate";
import {
  assignComplaintSchema,
  commentSchema,
  complaintStatusSchema,
  createComplaintSchema,
  feedbackSchema,
  updateComplaintSchema,
} from "../validation";

export const complaintRouter = Router();

complaintRouter.use(requireAuth);

complaintRouter.get("/", complaintController.list);
complaintRouter.get("/stats", complaintController.stats);
complaintRouter.post(
  "/",
  auditAction("complaint.created", "complaint"),
  validateBody(createComplaintSchema) as RequestHandler,
  complaintController.create,
);

complaintRouter.get("/:id", complaintController.getById);
complaintRouter.patch(
  "/:id",
  auditAction("complaint.updated", "complaint"),
  validateBody(updateComplaintSchema) as RequestHandler,
  complaintController.update,
);
complaintRouter.delete("/:id", auditAction("complaint.deleted", "complaint"), complaintController.remove);

complaintRouter.post(
  "/:id/assign",
  requireRole(UserRole.OFFICER, UserRole.DEPARTMENT_HEAD, UserRole.SUPER_ADMIN),
  validateBody(assignComplaintSchema) as RequestHandler,
  complaintController.assign,
);
complaintRouter.post(
  "/:id/status",
  requireRole(UserRole.OFFICER, UserRole.DEPARTMENT_HEAD, UserRole.SUPER_ADMIN),
  validateBody(complaintStatusSchema) as RequestHandler,
  complaintController.status,
);

complaintRouter.post(
  "/:id/comments",
  validateBody(commentSchema) as RequestHandler,
  complaintController.addComment,
);
complaintRouter.get("/:id/comments", complaintController.listComments);

complaintRouter.post(
  "/:id/feedback",
  requireRole(UserRole.CITIZEN),
  auditAction("complaint.feedback", "complaint"),
  validateBody(feedbackSchema) as RequestHandler,
  complaintController.submitFeedback,
);
complaintRouter.get("/:id/feedback", requireAuth, complaintController.getFeedback);

export default complaintRouter;