"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.departmentRouter = void 0;
const express_1 = require("express");
const common_1 = require("@smartcity/common");
const common_2 = require("@smartcity/common");
const controller_1 = require("../controller");
const auth_1 = require("../../../middleware/auth");
const audit_1 = require("../../../middleware/audit");
const validate_1 = require("../../../middleware/validate");
const validation_1 = require("../validation");
function requireDepartmentScope(req, _res, next) {
    if (req.user?.role === common_1.UserRole.SUPER_ADMIN) {
        next();
        return;
    }
    if (req.user?.role === common_1.UserRole.DEPARTMENT_HEAD && req.user.departmentId === req.params.id) {
        next();
        return;
    }
    throw new common_2.ForbiddenError("You can only manage your own department");
}
exports.departmentRouter = (0, express_1.Router)();
exports.departmentRouter.get("/", auth_1.requireAuth, controller_1.departmentController.list);
exports.departmentRouter.get("/:id", auth_1.requireAuth, (0, validate_1.validateParams)(validation_1.departmentIdParamSchema), controller_1.departmentController.get);
exports.departmentRouter.get("/:id/stats", auth_1.requireAuth, (0, validate_1.validateParams)(validation_1.departmentIdParamSchema), controller_1.departmentController.stats);
exports.departmentRouter.post("/", auth_1.requireAuth, (0, auth_1.requireRole)(common_1.UserRole.SUPER_ADMIN), (0, audit_1.auditAction)("department.created", "department"), (0, validate_1.validateBody)(validation_1.createDepartmentSchema), controller_1.departmentController.create);
exports.departmentRouter.patch("/:id", auth_1.requireAuth, (0, auth_1.requireRole)(common_1.UserRole.SUPER_ADMIN), (0, audit_1.auditAction)("department.updated", "department"), (0, validate_1.validateParams)(validation_1.departmentIdParamSchema), (0, validate_1.validateBody)(validation_1.updateDepartmentSchema), controller_1.departmentController.update);
exports.departmentRouter.delete("/:id", auth_1.requireAuth, (0, auth_1.requireRole)(common_1.UserRole.SUPER_ADMIN), (0, audit_1.auditAction)("department.deleted", "department"), (0, validate_1.validateParams)(validation_1.departmentIdParamSchema), controller_1.departmentController.remove);
exports.departmentRouter.post("/:id/officers", auth_1.requireAuth, (0, auth_1.requireRole)(common_1.UserRole.DEPARTMENT_HEAD, common_1.UserRole.SUPER_ADMIN), requireDepartmentScope, (0, audit_1.auditAction)("department.officers_updated", "department"), (0, validate_1.validateBody)(validation_1.assignOfficersSchema), controller_1.departmentController.assignOfficers);
exports.default = exports.departmentRouter;
//# sourceMappingURL=index.js.map