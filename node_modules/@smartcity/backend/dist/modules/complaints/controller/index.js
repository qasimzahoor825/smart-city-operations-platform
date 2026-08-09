"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.complaintController = void 0;
const service_1 = require("../service");
const utils_1 = require("../../../core/utils");
const paginate_1 = require("../../../middleware/paginate");
function actorOf(req) {
    return {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
        departmentId: req.user.departmentId,
        ip: req.user.ip ?? null,
        userAgent: req.user.userAgent ?? null,
    };
}
function bodyOf(req) {
    return req.parsedBody;
}
exports.complaintController = {
    list: (0, utils_1.asyncHandler)(async (req, res) => {
        const { page, limit } = (0, paginate_1.paginationQuery)(req);
        const query = { page, limit };
        if (typeof req.query.status === "string")
            query.status = req.query.status;
        if (typeof req.query.priority === "string")
            query.priority = req.query.priority;
        if (typeof req.query.category === "string")
            query.category = req.query.category;
        if (typeof req.query.search === "string")
            query.search = req.query.search;
        if (typeof req.query.citizenId === "string")
            query.citizenId = req.query.citizenId;
        const { items, pagination } = await service_1.complaintService.list(query);
        res.json((0, utils_1.createListResponse)(items, pagination, "Complaints fetched"));
    }),
    getById: (0, utils_1.asyncHandler)(async (req, res) => {
        const complaint = await service_1.complaintService.getById(req.params.id);
        res.json((0, utils_1.createApiResponse)(true, "Complaint fetched", complaint));
    }),
    create: (0, utils_1.asyncHandler)(async (req, res) => {
        const dto = bodyOf(req);
        const complaint = await service_1.complaintService.create(actorOf(req), dto);
        res.status(201).json((0, utils_1.createApiResponse)(true, "Complaint submitted", complaint));
    }),
    update: (0, utils_1.asyncHandler)(async (req, res) => {
        const dto = bodyOf(req);
        const complaint = await service_1.complaintService.update(req.params.id, actorOf(req), dto);
        res.json((0, utils_1.createApiResponse)(true, "Complaint updated", complaint));
    }),
    remove: (0, utils_1.asyncHandler)(async (req, res) => {
        await service_1.complaintService.remove(req.params.id, actorOf(req));
        res.json((0, utils_1.createApiResponse)(true, "Complaint deleted"));
    }),
    status: (0, utils_1.asyncHandler)(async (req, res) => {
        const dto = bodyOf(req);
        const complaint = await service_1.complaintService.updateStatus(req.params.id, dto, actorOf(req));
        res.locals.auditMeta = { toStatus: complaint.status, note: dto.note ?? null };
        res.locals.auditEntityId = complaint.id;
        res.json((0, utils_1.createApiResponse)(true, "Complaint status updated", complaint));
    }),
    assign: (0, utils_1.asyncHandler)(async (req, res) => {
        const dto = bodyOf(req);
        const complaint = await service_1.complaintService.assign(req.params.id, dto, actorOf(req));
        res.locals.auditMeta = { officerId: dto.officerId, toStatus: complaint.status };
        res.locals.auditEntityId = complaint.id;
        res.json((0, utils_1.createApiResponse)(true, "Complaint assigned", complaint));
    }),
    addComment: (0, utils_1.asyncHandler)(async (req, res) => {
        const dto = bodyOf(req);
        const comment = await service_1.complaintService.addComment(req.params.id, actorOf(req), dto);
        res.status(201).json((0, utils_1.createApiResponse)(true, "Comment added", comment));
    }),
    listComments: (0, utils_1.asyncHandler)(async (req, res) => {
        const comments = await service_1.complaintService.listComments(req.params.id);
        res.json((0, utils_1.createApiResponse)(true, "Comments fetched", comments));
    }),
    submitFeedback: (0, utils_1.asyncHandler)(async (req, res) => {
        const dto = bodyOf(req);
        const feedback = await service_1.complaintService.submitFeedback(req.params.id, dto, actorOf(req));
        res.status(201).json((0, utils_1.createApiResponse)(true, "Feedback submitted", feedback));
    }),
    getFeedback: (0, utils_1.asyncHandler)(async (req, res) => {
        const feedback = await service_1.complaintService.getFeedback(req.params.id);
        res.json((0, utils_1.createApiResponse)(true, "Feedback fetched", feedback));
    }),
    stats: (0, utils_1.asyncHandler)(async (_req, res) => {
        const stats = await service_1.complaintService.stats();
        res.json((0, utils_1.createApiResponse)(true, "Complaint statistics", stats));
    }),
};
exports.default = exports.complaintController;
//# sourceMappingURL=index.js.map