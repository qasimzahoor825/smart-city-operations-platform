"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentRouter = void 0;
const express_1 = require("express");
const controller_1 = require("../controller");
const auth_1 = require("../../../middleware/auth");
const validate_1 = require("../../../middleware/validate");
const validation_1 = require("../validation");
exports.paymentRouter = (0, express_1.Router)();
exports.paymentRouter.use(auth_1.requireAuth);
exports.paymentRouter.get("/", controller_1.paymentController.listBills);
exports.paymentRouter.get("/transactions", controller_1.paymentController.listTransactions);
exports.paymentRouter.get("/summary", controller_1.paymentController.summary);
exports.paymentRouter.post("/pay", (0, validate_1.validateBody)(validation_1.payBillSchema), controller_1.paymentController.pay);
exports.paymentRouter.get("/:id", controller_1.paymentController.getBill);
exports.default = exports.paymentRouter;
//# sourceMappingURL=index.js.map