import { Router, type RequestHandler } from "express";
import { reportController } from "../controller";
import { requireAuth } from "../../../middleware/auth";
import { validateQuery } from "../../../middleware/validate";
import { exportReportQuerySchema } from "../validation";

export const reportRouter = Router();

reportRouter.use(requireAuth);

reportRouter.get("/overview", reportController.overview);
reportRouter.get("/analytics", reportController.analytics);
reportRouter.get(
  "/export",
  validateQuery(exportReportQuerySchema) as RequestHandler,
  reportController.exportReport,
);

export default reportRouter;