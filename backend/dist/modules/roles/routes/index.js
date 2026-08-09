"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleRouter = void 0;
const express_1 = require("express");
const controller_1 = require("../controller");
const auth_1 = require("../../../middleware/auth");
const validate_1 = require("../../../middleware/validate");
const validation_1 = require("../validation");
exports.roleRouter = (0, express_1.Router)();
exports.roleRouter.get("/", auth_1.requireAuth, controller_1.roleController.list);
exports.roleRouter.get("/:role", auth_1.requireAuth, (0, validate_1.validateParams)(validation_1.roleParamSchema), controller_1.roleController.get);
exports.default = exports.roleRouter;
//# sourceMappingURL=index.js.map