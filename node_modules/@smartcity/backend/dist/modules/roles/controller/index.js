"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleController = void 0;
const service_1 = require("../service");
const utils_1 = require("../../../core/utils");
exports.roleController = {
    list: (0, utils_1.asyncHandler)(async (_req, res) => {
        res.json((0, utils_1.createApiResponse)(true, "Roles fetched", service_1.roleService.list()));
    }),
    get: (0, utils_1.asyncHandler)(async (req, res) => {
        const info = service_1.roleService.get(req.params.role);
        res.json((0, utils_1.createApiResponse)(true, "Role fetched", info));
    }),
};
exports.default = exports.roleController;
//# sourceMappingURL=index.js.map