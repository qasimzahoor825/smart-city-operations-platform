import { Router, type RequestHandler } from "express";
import { paymentController } from "../controller";
import { requireAuth } from "../../../middleware/auth";
import { validateBody } from "../../../middleware/validate";
import { payBillSchema } from "../validation";

export const paymentRouter = Router();

paymentRouter.use(requireAuth);

paymentRouter.get("/", paymentController.listBills);
paymentRouter.get("/transactions", paymentController.listTransactions);
paymentRouter.get("/summary", paymentController.summary);
paymentRouter.post("/pay", validateBody(payBillSchema) as RequestHandler, paymentController.pay);
paymentRouter.get("/:id", paymentController.getBill);

export default paymentRouter;