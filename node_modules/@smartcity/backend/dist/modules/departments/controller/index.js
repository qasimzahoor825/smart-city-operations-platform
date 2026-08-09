"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.departmentController = void 0;
const service_1 = require("../service");
const utils_1 = require("../../../core/utils");
const paginate_1 = require("../../../middleware/paginate");
const firstString = (value) => typeof value === "string" && value.length > 0 ? value : undefined;
exports.departmentController = {
    list: (0, utils_1.asyncHandler)(async (req, res) => {
        const { page, limit } = (0, paginate_1.paginationQuery)(req);
        const result = await service_1.departmentService.list({
            page,
            limit,
            search: firstString(req.query.search),
        });
        (0, paginate_1.paginatedResponse)(res, result.items, { page, limit }, "Departments fetched");
    }),
    get: (0, utils_1.asyncHandler)(async (req, res) => {
        const department = await service_1.departmentService.getById(req.params.id);
        res.json((0, utils_1.createApiResponse)(true, "Department fetched", department));
    }),
    create: (0, utils_1.asyncHandler)(async (req, res) => {
        const department = await service_1.departmentService.create(req.body ?? {});
        res.status(201).json((0, utils_1.createApiResponse)(true, "Department created", department));
    }),
    update: (0, utils_1.asyncHandler)(async (req, res) => {
        const department = await service_1.departmentService.update(req.params.id, req.body ?? {});
        res.json((0, utils_1.createApiResponse)(true, "Department updated", department));
    }),
    remove: (0, utils_1.asyncHandler)(async (req, res) => {
        await service_1.departmentService.remove(req.params.id);
        res.json((0, utils_1.createApiResponse)(true, "Department deleted"));
    }),
    stats: (0, utils_1.asyncHandler)(async (req, res) => {
        const stats = await service_1.departmentService.getStats(req.params.id);
        res.json((0, utils_1.createApiResponse)(true, "Department statistics fetched", stats));
    }),
    assignOfficers: (0, utils_1.asyncHandler)(async (req, res) => {
        const department = await service_1.departmentService.assignOfficers(req.params.id, req.body ?? {});
        res.json((0, utils_1.createApiResponse)(true, "Officers assigned", department));
    }),
};
exports.default = exports.departmentController;
//# sourceMappingURL=index.js.map