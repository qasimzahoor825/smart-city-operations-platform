"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newsRouter = void 0;
const express_1 = require("express");
const common_1 = require("@smartcity/common");
const controller_1 = require("../controller");
const auth_1 = require("../../../middleware/auth");
const validate_1 = require("../../../middleware/validate");
const validation_1 = require("../validation");
exports.newsRouter = (0, express_1.Router)();
// Public feed — published articles only, no authentication required.
exports.newsRouter.get("/public", controller_1.newsController.publicList);
exports.newsRouter.use(auth_1.requireAuth);
exports.newsRouter.get("/", controller_1.newsController.list);
exports.newsRouter.get("/stats", controller_1.newsController.stats);
exports.newsRouter.post("/", (0, auth_1.requireRole)(common_1.UserRole.SUPER_ADMIN), (0, validate_1.validateBody)(validation_1.createNewsSchema), controller_1.newsController.create);
exports.newsRouter.get("/:id", controller_1.newsController.getById);
exports.newsRouter.patch("/:id", (0, auth_1.requireRole)(common_1.UserRole.SUPER_ADMIN), (0, validate_1.validateBody)(validation_1.updateNewsSchema), controller_1.newsController.update);
exports.newsRouter.delete("/:id", (0, auth_1.requireRole)(common_1.UserRole.SUPER_ADMIN), controller_1.newsController.remove);
exports.default = exports.newsRouter;
//# sourceMappingURL=index.js.map