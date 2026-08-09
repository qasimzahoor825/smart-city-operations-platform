"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.systemRouter = void 0;
const express_1 = require("express");
const common_1 = require("@smartcity/common");
const controller_1 = require("../controller");
const auth_1 = require("../../../middleware/auth");
const validate_1 = require("../../../middleware/validate");
const validation_1 = require("../validation");
const repository_1 = require("../repository");
exports.systemRouter = (0, express_1.Router)();
exports.systemRouter.use(auth_1.requireAuth);
exports.systemRouter.use((_req, _res, next) => {
    repository_1.systemRepository.recordRequest();
    next();
});
exports.systemRouter.get("/health", controller_1.systemController.health);
exports.systemRouter.get("/settings", controller_1.systemController.getSettings);
exports.systemRouter.put("/settings", (0, auth_1.requireRole)(common_1.UserRole.SUPER_ADMIN), (0, validate_1.validateBody)(validation_1.updateSettingsSchema), controller_1.systemController.updateSettings);
exports.systemRouter.get("/metrics", controller_1.systemController.metrics);
exports.default = exports.systemRouter;
//# sourceMappingURL=index.js.map