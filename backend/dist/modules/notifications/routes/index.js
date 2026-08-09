"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationRouter = void 0;
const express_1 = require("express");
const controller_1 = require("../controller");
const auth_1 = require("../../../middleware/auth");
const validate_1 = require("../../../middleware/validate");
const validation_1 = require("../validation");
exports.notificationRouter = (0, express_1.Router)();
exports.notificationRouter.use(auth_1.requireAuth);
exports.notificationRouter.get("/", controller_1.notificationController.list);
exports.notificationRouter.get("/unread-count", controller_1.notificationController.unreadCount);
exports.notificationRouter.get("/preferences", controller_1.notificationController.getPreferences);
exports.notificationRouter.put("/preferences", (0, validate_1.validateBody)(validation_1.updatePreferencesSchema), controller_1.notificationController.updatePreferences);
exports.notificationRouter.post("/read-all", controller_1.notificationController.readAll);
exports.notificationRouter.post("/send", (0, validate_1.validateBody)(validation_1.sendNotificationSchema), controller_1.notificationController.send);
exports.notificationRouter.patch("/:id/read", (0, validate_1.validateParams)(validation_1.notificationParamsSchema), controller_1.notificationController.markRead);
exports.default = exports.notificationRouter;
//# sourceMappingURL=index.js.map