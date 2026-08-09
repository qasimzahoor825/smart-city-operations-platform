"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.citizenController = void 0;
const service_1 = require("../service");
const utils_1 = require("../../../core/utils");
const paginate_1 = require("../../../middleware/paginate");
const firstString = (value) => typeof value === "string" && value.length > 0 ? value : undefined;
exports.citizenController = {
    list: (0, utils_1.asyncHandler)(async (req, res) => {
        const { page, limit } = (0, paginate_1.paginationQuery)(req);
        const result = await service_1.citizenService.list({
            page,
            limit,
            search: firstString(req.query.search),
            ward: firstString(req.query.ward),
        });
        (0, paginate_1.paginatedResponse)(res, result.items, { page, limit }, "Citizens fetched");
    }),
    get: (0, utils_1.asyncHandler)(async (req, res) => {
        const citizen = await service_1.citizenService.getById(req.params.id);
        res.json((0, utils_1.createApiResponse)(true, "Citizen fetched", citizen));
    }),
    update: (0, utils_1.asyncHandler)(async (req, res) => {
        const citizen = await service_1.citizenService.updateProfile(req.params.id, req.body ?? {});
        res.json((0, utils_1.createApiResponse)(true, "Citizen profile updated", citizen));
    }),
    stats: (0, utils_1.asyncHandler)(async (req, res) => {
        const stats = await service_1.citizenService.getStats(req.params.id);
        res.json((0, utils_1.createApiResponse)(true, "Citizen statistics fetched", stats));
    }),
    overview: (0, utils_1.asyncHandler)(async (_req, res) => {
        const overview = await service_1.citizenService.overview();
        res.json((0, utils_1.createApiResponse)(true, "Citizen overview fetched", overview));
    }),
    me: (0, utils_1.asyncHandler)(async (req, res) => {
        const citizen = await service_1.citizenService.getById(req.user.id);
        res.json((0, utils_1.createApiResponse)(true, "Current citizen fetched", citizen));
    }),
};
exports.default = exports.citizenController;
//# sourceMappingURL=index.js.map