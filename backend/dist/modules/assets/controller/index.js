"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assetController = void 0;
const service_1 = require("../service");
const utils_1 = require("../../../core/utils");
const paginate_1 = require("../../../middleware/paginate");
function actorOf(req) {
    return {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
        departmentId: req.user.departmentId,
    };
}
function bodyOf(req) {
    return req.parsedBody;
}
exports.assetController = {
    list: (0, utils_1.asyncHandler)(async (req, res) => {
        const { page, limit } = (0, paginate_1.paginationQuery)(req);
        const query = { page, limit };
        if (typeof req.query.category === "string")
            query.category = req.query.category;
        if (typeof req.query.status === "string")
            query.status = req.query.status;
        if (typeof req.query.search === "string")
            query.search = req.query.search;
        const { items, pagination } = await service_1.assetService.list(query);
        res.json((0, utils_1.createListResponse)(items, pagination, "Assets fetched"));
    }),
    getById: (0, utils_1.asyncHandler)(async (req, res) => {
        const asset = await service_1.assetService.getById(req.params.id);
        res.json((0, utils_1.createApiResponse)(true, "Asset fetched", asset));
    }),
    create: (0, utils_1.asyncHandler)(async (req, res) => {
        const dto = bodyOf(req);
        const asset = await service_1.assetService.create(actorOf(req), dto);
        res.status(201).json((0, utils_1.createApiResponse)(true, "Asset created", asset));
    }),
    updateStatus: (0, utils_1.asyncHandler)(async (req, res) => {
        const dto = bodyOf(req);
        const asset = await service_1.assetService.updateStatus(req.params.id, actorOf(req), dto);
        res.json((0, utils_1.createApiResponse)(true, "Asset status updated", asset));
    }),
    remove: (0, utils_1.asyncHandler)(async (req, res) => {
        await service_1.assetService.remove(req.params.id, actorOf(req));
        res.json((0, utils_1.createApiResponse)(true, "Asset deleted"));
    }),
    listInspections: (0, utils_1.asyncHandler)(async (req, res) => {
        await service_1.assetService.getById(req.params.id);
        const inspections = await service_1.assetService.listInspections(req.params.id);
        res.json((0, utils_1.createApiResponse)(true, "Inspections fetched", inspections));
    }),
    createInspection: (0, utils_1.asyncHandler)(async (req, res) => {
        const dto = bodyOf(req);
        const inspection = await service_1.assetService.createInspection(req.params.id, actorOf(req), dto);
        res.status(201).json((0, utils_1.createApiResponse)(true, "Inspection recorded", inspection));
    }),
    latestInspection: (0, utils_1.asyncHandler)(async (req, res) => {
        await service_1.assetService.getById(req.params.id);
        const latest = await service_1.assetService.latestInspection(req.params.id);
        if (!latest) {
            res.json((0, utils_1.createApiResponse)(true, "No inspections recorded yet", null));
            return;
        }
        res.json((0, utils_1.createApiResponse)(true, "Latest inspection", latest));
    }),
    stats: (0, utils_1.asyncHandler)(async (_req, res) => {
        const stats = await service_1.assetService.stats();
        res.json((0, utils_1.createApiResponse)(true, "Asset statistics", stats));
    }),
};
exports.default = exports.assetController;
//# sourceMappingURL=index.js.map