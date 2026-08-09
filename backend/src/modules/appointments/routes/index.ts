import { Router, type RequestHandler } from "express";
import { UserRole } from "@smartcity/common";
import { appointmentController } from "../controller";
import { requireAuth, requireRole } from "../../../middleware/auth";
import { validateBody } from "../../../middleware/validate";
import { appointmentStatusSchema, createAppointmentSchema } from "../validation";

export const appointmentRouter = Router();

appointmentRouter.use(requireAuth);

appointmentRouter.get("/", appointmentController.list);
appointmentRouter.get("/stats", appointmentController.stats);
appointmentRouter.post("/", validateBody(createAppointmentSchema) as RequestHandler, appointmentController.create);

appointmentRouter.get("/:id", appointmentController.getById);
appointmentRouter.patch(
  "/:id/status",
  requireRole(UserRole.OFFICER, UserRole.DEPARTMENT_HEAD, UserRole.SUPER_ADMIN),
  validateBody(appointmentStatusSchema) as RequestHandler,
  appointmentController.status,
);
appointmentRouter.delete("/:id", appointmentController.remove);

export default appointmentRouter;