"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.citizenRouter = void 0;
const express_1 = require("express");
const common_1 = require("@smartcity/common");
const controller_1 = require("../controller");
const auth_1 = require("../../../middleware/auth");
const validate_1 = require("../../../middleware/validate");
const validation_1 = require("../validation");
const CITIZEN_MANAGERS = [common_1.UserRole.OFFICER, common_1.UserRole.DEPARTMENT_HEAD, common_1.UserRole.SUPER_ADMIN];
exports.citizenRouter = (0, express_1.Router)();
exports.citizenRouter.get("/", auth_1.requireAuth, (0, auth_1.requireRole)(...CITIZEN_MANAGERS), (0, validate_1.validateQuery)(validation_1.listCitizensQuerySchema), controller_1.citizenController.list);
exports.citizenRouter.get("/stats", auth_1.requireAuth, controller_1.citizenController.overview);
exports.citizenRouter.get("/me", auth_1.requireAuth, controller_1.citizenController.me);
exports.citizenRouter.get("/:id", auth_1.requireAuth, (0, auth_1.requireSameUserOrRole)(...CITIZEN_MANAGERS), (0, validate_1.validateParams)(validation_1.citizenIdParamSchema), controller_1.citizenController.get);
exports.citizenRouter.get("/:id/stats", auth_1.requireAuth, (0, auth_1.requireSameUserOrRole)(...CITIZEN_MANAGERS), (0, validate_1.validateParams)(validation_1.citizenIdParamSchema), controller_1.citizenController.stats);
exports.citizenRouter.patch("/:id", auth_1.requireAuth, (0, auth_1.requireSameUserOrRole)(...CITIZEN_MANAGERS), (0, validate_1.validateParams)(validation_1.citizenIdParamSchema), (0, validate_1.validateBody)(validation_1.updateCitizenProfileSchema), controller_1.citizenController.update);
exports.default = exports.citizenRouter;
//# sourceMappingURL=index.js.map