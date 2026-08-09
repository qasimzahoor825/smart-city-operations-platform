"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appointmentController = void 0;
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
exports.appointmentController = {
    list: (0, utils_1.asyncHandler)(async (req, res) => {
        const { page, limit } = (0, paginate_1.paginationQuery)(req);
        const query = { page, limit };
        if (typeof req.query.citizenId === "string")
            query.citizenId = req.query.citizenId;
        if (typeof req.query.departmentId === "string")
            query.departmentId = req.query.departmentId;
        if (typeof req.query.status === "string")
            query.status = req.query.status;
        if (typeof req.query.search === "string")
            query.search = req.query.search;
        const { items, pagination } = await service_1.appointmentService.list(query);
        res.json((0, utils_1.createListResponse)(items, pagination, "Appointments fetched"));
    }),
    stats: (0, utils_1.asyncHandler)(async (_req, res) => {
        const stats = await service_1.appointmentService.stats();
        res.json((0, utils_1.createApiResponse)(true, "Appointment statistics", stats));
    }),
    getById: (0, utils_1.asyncHandler)(async (req, res) => {
        const appointment = await service_1.appointmentService.getById(req.params.id);
        res.json((0, utils_1.createApiResponse)(true, "Appointment fetched", appointment));
    }),
    create: (0, utils_1.asyncHandler)(async (req, res) => {
        const dto = bodyOf(req);
        const appointment = await service_1.appointmentService.create(actorOf(req), dto);
        res.status(201).json((0, utils_1.createApiResponse)(true, "Appointment booked", appointment));
    }),
    status: (0, utils_1.asyncHandler)(async (req, res) => {
        const dto = bodyOf(req);
        const appointment = await service_1.appointmentService.updateStatus(req.params.id, actorOf(req), dto);
        res.json((0, utils_1.createApiResponse)(true, "Appointment status updated", appointment));
    }),
    remove: (0, utils_1.asyncHandler)(async (req, res) => {
        await service_1.appointmentService.remove(req.params.id, actorOf(req));
        res.json((0, utils_1.createApiResponse)(true, "Appointment deleted"));
    }),
};
exports.default = exports.appointmentController;
//# sourceMappingURL=index.js.map