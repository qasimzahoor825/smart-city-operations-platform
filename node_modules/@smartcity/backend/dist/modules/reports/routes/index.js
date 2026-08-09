"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportRouter = void 0;
const express_1 = require("express");
const controller_1 = require("../controller");
const auth_1 = require("../../../middleware/auth");
const validate_1 = require("../../../middleware/validate");
const validation_1 = require("../validation");
exports.reportRouter = (0, express_1.Router)();
exports.reportRouter.use(auth_1.requireAuth);
exports.reportRouter.get("/overview", controller_1.reportController.overview);
exports.reportRouter.get("/analytics", controller_1.reportController.analytics);
exports.reportRouter.get("/export", (0, validate_1.validateQuery)(validation_1.exportReportQuerySchema), controller_1.reportController.exportReport);
exports.default = exports.reportRouter;
//# sourceMappingURL=index.js.map