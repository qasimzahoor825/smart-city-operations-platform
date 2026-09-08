"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportRouter = void 0;
const express_1 = require("express");
const controller_1 = require("../controller");
const auth_1 = require("../../../middleware/auth");
const common_1 = require("@smartcity/common");
const validate_1 = require("../../../middleware/validate");
const validation_1 = require("../validation");
exports.reportRouter = (0, express_1.Router)();
// Public feed — aggregate platform counts only, no authentication required.
exports.reportRouter.get("/public/overview", controller_1.reportController.overview);
exports.reportRouter.use(auth_1.requireAuth);
// Detailed reports are only for department heads & super admins.
exports.reportRouter.use((0, auth_1.requireRole)(common_1.UserRole.SUPER_ADMIN, common_1.UserRole.DEPARTMENT_HEAD));
exports.reportRouter.get("/overview", controller_1.reportController.overview);
exports.reportRouter.get("/analytics", controller_1.reportController.analytics);
exports.reportRouter.get("/export", (0, validate_1.validateQuery)(validation_1.exportReportQuerySchema), controller_1.reportController.exportReport);
exports.default = exports.reportRouter;
//# sourceMappingURL=index.js.map