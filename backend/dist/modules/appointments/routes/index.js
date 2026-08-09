"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appointmentRouter = void 0;
const express_1 = require("express");
const common_1 = require("@smartcity/common");
const controller_1 = require("../controller");
const auth_1 = require("../../../middleware/auth");
const validate_1 = require("../../../middleware/validate");
const validation_1 = require("../validation");
exports.appointmentRouter = (0, express_1.Router)();
exports.appointmentRouter.use(auth_1.requireAuth);
exports.appointmentRouter.get("/", controller_1.appointmentController.list);
exports.appointmentRouter.get("/stats", controller_1.appointmentController.stats);
exports.appointmentRouter.post("/", (0, validate_1.validateBody)(validation_1.createAppointmentSchema), controller_1.appointmentController.create);
exports.appointmentRouter.get("/:id", controller_1.appointmentController.getById);
exports.appointmentRouter.patch("/:id/status", (0, auth_1.requireRole)(common_1.UserRole.OFFICER, common_1.UserRole.DEPARTMENT_HEAD, common_1.UserRole.SUPER_ADMIN), (0, validate_1.validateBody)(validation_1.appointmentStatusSchema), controller_1.appointmentController.status);
exports.appointmentRouter.delete("/:id", controller_1.appointmentController.remove);
exports.default = exports.appointmentRouter;
//# sourceMappingURL=index.js.map