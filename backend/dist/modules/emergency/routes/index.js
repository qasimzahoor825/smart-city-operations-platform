"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emergencyRouter = void 0;
const express_1 = require("express");
const common_1 = require("@smartcity/common");
const controller_1 = require("../controller");
const auth_1 = require("../../../middleware/auth");
const audit_1 = require("../../../middleware/audit");
const validate_1 = require("../../../middleware/validate");
const validation_1 = require("../validation");
exports.emergencyRouter = (0, express_1.Router)();
exports.emergencyRouter.use(auth_1.requireAuth);
exports.emergencyRouter.get("/", controller_1.emergencyController.list);
exports.emergencyRouter.get("/stats", controller_1.emergencyController.stats);
exports.emergencyRouter.post("/", (0, audit_1.auditAction)("emergency.created", "emergency"), (0, validate_1.validateBody)(validation_1.createEmergencySchema), controller_1.emergencyController.create);
exports.emergencyRouter.get("/:id", controller_1.emergencyController.getById);
exports.emergencyRouter.patch("/:id/dispatch", (0, auth_1.requireRole)(common_1.UserRole.OFFICER, common_1.UserRole.DEPARTMENT_HEAD, common_1.UserRole.SUPER_ADMIN), (0, audit_1.auditAction)("emergency.status_changed", "emergency"), (0, validate_1.validateBody)(validation_1.dispatchEmergencySchema), controller_1.emergencyController.dispatch);
exports.default = exports.emergencyRouter;
//# sourceMappingURL=index.js.map