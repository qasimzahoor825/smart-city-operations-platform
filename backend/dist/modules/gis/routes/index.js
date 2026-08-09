"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gisRouter = void 0;
const express_1 = require("express");
const common_1 = require("@smartcity/common");
const controller_1 = require("../controller");
const auth_1 = require("../../../middleware/auth");
const validate_1 = require("../../../middleware/validate");
const validation_1 = require("../validation");
exports.gisRouter = (0, express_1.Router)();
exports.gisRouter.use(auth_1.requireAuth);
exports.gisRouter.get("/layers", controller_1.gisController.layers);
exports.gisRouter.get("/markers", controller_1.gisController.listMarkers);
exports.gisRouter.get("/markers/stats", controller_1.gisController.markerStats);
exports.gisRouter.get("/search", controller_1.gisController.search);
exports.gisRouter.post("/markers", (0, auth_1.requireRole)(common_1.UserRole.OFFICER, common_1.UserRole.DEPARTMENT_HEAD, common_1.UserRole.SUPER_ADMIN), (0, validate_1.validateBody)(validation_1.createMarkerSchema), controller_1.gisController.createMarker);
exports.default = exports.gisRouter;
//# sourceMappingURL=index.js.map