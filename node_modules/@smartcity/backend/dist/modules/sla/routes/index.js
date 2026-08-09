"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.slaRouter = void 0;
const express_1 = require("express");
const common_1 = require("@smartcity/common");
const controller_1 = require("../controller");
const auth_1 = require("../../../middleware/auth");
const audit_1 = require("../../../middleware/audit");
const validate_1 = require("../../../middleware/validate");
const validation_1 = require("../validation");
exports.slaRouter = (0, express_1.Router)();
exports.slaRouter.use(auth_1.requireAuth);
exports.slaRouter.get("/", controller_1.slaController.list);
exports.slaRouter.get("/:id", (0, validate_1.validateParams)(validation_1.slaIdParamSchema), controller_1.slaController.get);
exports.slaRouter.post("/", (0, auth_1.requireRole)(common_1.UserRole.SUPER_ADMIN), (0, audit_1.auditAction)("sla.rule_created", "sla"), (0, validate_1.validateBody)(validation_1.createSlaRuleSchema), controller_1.slaController.create);
exports.slaRouter.patch("/:id", (0, auth_1.requireRole)(common_1.UserRole.SUPER_ADMIN), (0, audit_1.auditAction)("sla.rule_updated", "sla"), (0, validate_1.validateParams)(validation_1.slaIdParamSchema), (0, validate_1.validateBody)(validation_1.updateSlaRuleSchema), controller_1.slaController.update);
exports.default = exports.slaRouter;
//# sourceMappingURL=index.js.map