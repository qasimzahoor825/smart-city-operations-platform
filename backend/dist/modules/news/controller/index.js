"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newsController = void 0;
const service_1 = require("../service");
const utils_1 = require("../../../core/utils");
const paginate_1 = require("../../../middleware/paginate");
function bodyOf(req) {
    return req.parsedBody;
}
function actorOf(req) {
    return {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
    };
}
exports.newsController = {
    list: (0, utils_1.asyncHandler)(async (req, res) => {
        const { page, limit } = (0, paginate_1.paginationQuery)(req);
        const query = { page, limit };
        if (typeof req.query.category === "string")
            query.category = req.query.category;
        if (typeof req.query.search === "string")
            query.search = req.query.search;
        if (typeof req.query.published === "string" && (req.query.published === "true" || req.query.published === "false")) {
            query.published = req.query.published === "true";
        }
        const { items, pagination } = await service_1.newsService.list(query);
        res.json((0, utils_1.createListResponse)(items, pagination, "Articles fetched"));
    }),
    /** Public feed: only published articles, no auth. */
    publicList: (0, utils_1.asyncHandler)(async (req, res) => {
        const { page, limit } = (0, paginate_1.paginationQuery)(req);
        const query = { page, limit, published: true };
        if (typeof req.query.category === "string")
            query.category = req.query.category;
        const { items, pagination } = await service_1.newsService.list(query);
        res.json((0, utils_1.createListResponse)(items, pagination, "Published articles fetched"));
    }),
    getById: (0, utils_1.asyncHandler)(async (req, res) => {
        const article = await service_1.newsService.getById(req.params.id, actorOf(req));
        res.json((0, utils_1.createApiResponse)(true, "Article fetched", article));
    }),
    create: (0, utils_1.asyncHandler)(async (req, res) => {
        const dto = bodyOf(req);
        const article = await service_1.newsService.create(dto, actorOf(req));
        res.status(201).json((0, utils_1.createApiResponse)(true, "Article created", article));
    }),
    update: (0, utils_1.asyncHandler)(async (req, res) => {
        const dto = bodyOf(req);
        const article = await service_1.newsService.update(req.params.id, dto);
        res.json((0, utils_1.createApiResponse)(true, "Article updated", article));
    }),
    remove: (0, utils_1.asyncHandler)(async (req, res) => {
        await service_1.newsService.remove(req.params.id);
        res.json((0, utils_1.createApiResponse)(true, "Article deleted"));
    }),
    stats: (0, utils_1.asyncHandler)(async (_req, res) => {
        const stats = await service_1.newsService.stats();
        res.json((0, utils_1.createApiResponse)(true, "Article statistics", stats));
    }),
};
exports.default = exports.newsController;
//# sourceMappingURL=index.js.map