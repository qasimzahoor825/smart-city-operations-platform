"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginationQuery = paginationQuery;
exports.paginatedResponse = paginatedResponse;
function paginationQuery(req) {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 20));
    return { page, limit };
}
function paginatedResponse(res, items, { page, limit }, message = "Success") {
    const total = items.length;
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
    const start = (page - 1) * limit;
    res.json({
        success: true,
        message,
        data: items.slice(start, start + limit),
        pagination: { page, limit, total, totalPages },
        timestamp: new Date().toISOString(),
    });
}
//# sourceMappingURL=paginate.js.map