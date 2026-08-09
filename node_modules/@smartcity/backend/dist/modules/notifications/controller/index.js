"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationController = void 0;
const service_1 = require("../service");
const utils_1 = require("../../../core/utils");
const paginate_1 = require("../../../middleware/paginate");
function bodyOf(req) {
    return req.parsedBody;
}
exports.notificationController = {
    list: (0, utils_1.asyncHandler)(async (req, res) => {
        const { page, limit } = (0, paginate_1.paginationQuery)(req);
        const query = {
            page,
            limit,
            userId: typeof req.query.userId === "string" ? req.query.userId : req.user.id,
        };
        if (typeof req.query.unread === "string")
            query.unread = req.query.unread === "true";
        const { items, pagination } = await service_1.notificationService.list(query);
        res.json((0, utils_1.createListResponse)(items, pagination, "Notifications fetched"));
    }),
    unreadCount: (0, utils_1.asyncHandler)(async (_req, res) => {
        const userId = typeof _req.query.userId === "string" ? _req.query.userId : _req.user.id;
        const result = await service_1.notificationService.unreadCount(userId);
        res.json((0, utils_1.createApiResponse)(true, "Unread count fetched", result));
    }),
    markRead: (0, utils_1.asyncHandler)(async (req, res) => {
        const notification = await service_1.notificationService.markRead(req.params.id, req.user.id);
        res.json((0, utils_1.createApiResponse)(true, "Notification marked as read", notification));
    }),
    readAll: (0, utils_1.asyncHandler)(async (req, res) => {
        const result = await service_1.notificationService.readAll(req.user.id);
        res.json((0, utils_1.createApiResponse)(true, "All notifications marked as read", result));
    }),
    send: (0, utils_1.asyncHandler)(async (req, res) => {
        const dto = bodyOf(req);
        const result = await service_1.notificationService.send(dto);
        res.status(201).json((0, utils_1.createApiResponse)(true, "Notification dispatched", result));
    }),
    getPreferences: (0, utils_1.asyncHandler)(async (req, res) => {
        const preferences = await service_1.notificationService.getPreferences(req.user.id);
        res.json((0, utils_1.createApiResponse)(true, "Notification preferences fetched", preferences));
    }),
    updatePreferences: (0, utils_1.asyncHandler)(async (req, res) => {
        const dto = bodyOf(req);
        const preferences = await service_1.notificationService.updatePreferences(req.user.id, dto);
        res.json((0, utils_1.createApiResponse)(true, "Notification preferences updated", preferences));
    }),
};
exports.default = exports.notificationController;
//# sourceMappingURL=index.js.map