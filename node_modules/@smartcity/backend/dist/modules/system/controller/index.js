"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.systemController = void 0;
const service_1 = require("../service");
const utils_1 = require("../../../core/utils");
function bodyOf(req) {
    return req.parsedBody;
}
exports.systemController = {
    health: (0, utils_1.asyncHandler)(async (_req, res) => {
        const health = await service_1.systemService.health();
        res.json((0, utils_1.createApiResponse)(true, "System health", health));
    }),
    getSettings: (0, utils_1.asyncHandler)(async (_req, res) => {
        const settings = await service_1.systemService.getSettings();
        res.json((0, utils_1.createApiResponse)(true, "Platform settings fetched", settings));
    }),
    updateSettings: (0, utils_1.asyncHandler)(async (req, res) => {
        const dto = bodyOf(req);
        const settings = await service_1.systemService.updateSettings(dto);
        res.json((0, utils_1.createApiResponse)(true, "Platform settings updated", settings));
    }),
    metrics: (0, utils_1.asyncHandler)(async (_req, res) => {
        const metrics = await service_1.systemService.getMetrics();
        res.json((0, utils_1.createApiResponse)(true, "System metrics", metrics));
    }),
};
exports.default = exports.systemController;
//# sourceMappingURL=index.js.map