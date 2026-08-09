"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiRouter = void 0;
const express_1 = require("express");
const controller_1 = require("../controller");
const auth_1 = require("../../../middleware/auth");
const validate_1 = require("../../../middleware/validate");
const validation_1 = require("../validation");
exports.aiRouter = (0, express_1.Router)();
exports.aiRouter.use(auth_1.requireAuth);
exports.aiRouter.post("/categorize", (0, validate_1.validateBody)(validation_1.categorizeSchema), controller_1.aiController.categorize);
exports.default = exports.aiRouter;
//# sourceMappingURL=index.js.map