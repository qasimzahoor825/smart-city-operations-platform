"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditRouter = void 0;
const express_1 = require("express");
const common_1 = require("@smartcity/common");
const controller_1 = require("../controller");
const auth_1 = require("../../../middleware/auth");
exports.auditRouter = (0, express_1.Router)();
exports.auditRouter.use(auth_1.requireAuth, (0, auth_1.requireRole)(common_1.UserRole.SUPER_ADMIN));
exports.auditRouter.get("/", controller_1.auditController.list);
exports.auditRouter.get("/stats", controller_1.auditController.stats);
exports.default = exports.auditRouter;
//# sourceMappingURL=index.js.map