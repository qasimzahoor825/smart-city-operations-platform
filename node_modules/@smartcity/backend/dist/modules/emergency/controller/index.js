"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emergencyController = void 0;
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
exports.emergencyController = {
    list: (0, utils_1.asyncHandler)(async (req, res) => {
        const { page, limit } = (0, paginate_1.paginationQuery)(req);
        const query = { page, limit };
        if (typeof req.query.status === "string")
            query.status = req.query.status;
        if (typeof req.query.type === "string")
            query.type = req.query.type;
        if (typeof req.query.severity === "string")
            query.severity = req.query.severity;
        if (typeof req.query.search === "string")
            query.search = req.query.search;
        const { items, pagination } = await service_1.emergencyService.list(query);
        res.json((0, utils_1.createListResponse)(items, pagination, "Emergencies fetched"));
    }),
    stats: (0, utils_1.asyncHandler)(async (_req, res) => {
        const stats = await service_1.emergencyService.stats();
        res.json((0, utils_1.createApiResponse)(true, "Emergency statistics", stats));
    }),
    getById: (0, utils_1.asyncHandler)(async (req, res) => {
        const emergency = await service_1.emergencyService.getById(req.params.id);
        res.json((0, utils_1.createApiResponse)(true, "Emergency fetched", emergency));
    }),
    create: (0, utils_1.asyncHandler)(async (req, res) => {
        const dto = bodyOf(req);
        const emergency = await service_1.emergencyService.create(actorOf(req), dto);
        res.status(201).json((0, utils_1.createApiResponse)(true, "Emergency reported", emergency));
    }),
    dispatch: (0, utils_1.asyncHandler)(async (req, res) => {
        const dto = bodyOf(req);
        const emergency = await service_1.emergencyService.dispatch(req.params.id, dto, actorOf(req));
        res.json((0, utils_1.createApiResponse)(true, "Emergency dispatched", emergency));
    }),
};
exports.default = exports.emergencyController;
//# sourceMappingURL=index.js.map