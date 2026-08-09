"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = void 0;
const common_1 = require("@smartcity/common");
const service_1 = require("../service");
const utils_1 = require("../../../core/utils");
const paginate_1 = require("../../../middleware/paginate");
const toRole = (value) => typeof value === "string" && Object.values(common_1.UserRole).includes(value)
    ? value
    : undefined;
const firstString = (value) => typeof value === "string" && value.length > 0 ? value : undefined;
exports.userController = {
    list: (0, utils_1.asyncHandler)(async (req, res) => {
        const { page, limit } = (0, paginate_1.paginationQuery)(req);
        const result = await service_1.userService.list({
            page,
            limit,
            role: toRole(req.query.role),
            search: firstString(req.query.search),
            departmentId: firstString(req.query.departmentId),
        });
        (0, paginate_1.paginatedResponse)(res, result.items, { page, limit }, "Users fetched");
    }),
    me: (0, utils_1.asyncHandler)(async (req, res) => {
        const user = await service_1.userService.getById(req.user.id);
        res.json((0, utils_1.createApiResponse)(true, "Current user fetched", user));
    }),
    create: (0, utils_1.asyncHandler)(async (req, res) => {
        const user = await service_1.userService.create(req.body ?? {});
        res.status(201).json((0, utils_1.createApiResponse)(true, "User provisioned", user));
    }),
    get: (0, utils_1.asyncHandler)(async (req, res) => {
        const user = await service_1.userService.getById(req.params.id);
        res.json((0, utils_1.createApiResponse)(true, "User fetched", user));
    }),
    update: (0, utils_1.asyncHandler)(async (req, res) => {
        const user = await service_1.userService.update(req.params.id, req.body ?? {});
        res.json((0, utils_1.createApiResponse)(true, "User updated", user));
    }),
    activate: (0, utils_1.asyncHandler)(async (req, res) => {
        const user = await service_1.userService.setActive(req.params.id, true);
        res.json((0, utils_1.createApiResponse)(true, "User activated", user));
    }),
    deactivate: (0, utils_1.asyncHandler)(async (req, res) => {
        const user = await service_1.userService.setActive(req.params.id, false);
        res.json((0, utils_1.createApiResponse)(true, "User deactivated", user));
    }),
    remove: (0, utils_1.asyncHandler)(async (req, res) => {
        await service_1.userService.remove(req.params.id);
        res.json((0, utils_1.createApiResponse)(true, "User deleted"));
    }),
};
exports.default = exports.userController;
//# sourceMappingURL=index.js.map