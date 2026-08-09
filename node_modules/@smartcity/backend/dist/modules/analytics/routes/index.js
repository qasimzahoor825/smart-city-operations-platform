"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsRouter = void 0;
const express_1 = require("express");
const controller_1 = require("../controller");
const auth_1 = require("../../../middleware/auth");
const common_1 = require("@smartcity/common");
exports.analyticsRouter = (0, express_1.Router)();
// Analytics are management/decision-support data — staff access only.
exports.analyticsRouter.use(auth_1.requireAuth, (0, auth_1.requireRole)(common_1.UserRole.OFFICER, common_1.UserRole.DEPARTMENT_HEAD, common_1.UserRole.SUPER_ADMIN));
exports.analyticsRouter.get("/overview", controller_1.analyticsController.overview);
exports.analyticsRouter.get("/complaints", controller_1.analyticsController.complaints);
exports.analyticsRouter.get("/departments", controller_1.analyticsController.departments);
exports.analyticsRouter.get("/assets", controller_1.analyticsController.assets);
exports.analyticsRouter.get("/sla", controller_1.analyticsController.sla);
exports.analyticsRouter.get("/citizen-satisfaction", controller_1.analyticsController.citizenSatisfaction);
exports.analyticsRouter.get("/time-series", controller_1.analyticsController.timeSeries);
exports.default = exports.analyticsRouter;
//# sourceMappingURL=index.js.map