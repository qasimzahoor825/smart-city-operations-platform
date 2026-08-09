"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gisController = void 0;
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
function parseBBox(raw) {
    if (typeof raw !== "string")
        return undefined;
    const parts = raw.split(",").map((v) => Number(v.trim()));
    if (parts.length !== 4 || parts.some((n) => Number.isNaN(n)))
        return undefined;
    return [parts[0], parts[1], parts[2], parts[3]];
}
exports.gisController = {
    layers: (0, utils_1.asyncHandler)(async (_req, res) => {
        const layers = await service_1.gisService.listLayers();
        res.status(200).json((0, utils_1.createApiResponse)(true, "Layers fetched", layers));
    }),
    listMarkers: (0, utils_1.asyncHandler)(async (req, res) => {
        const { page, limit } = (0, paginate_1.paginationQuery)(req);
        const query = { page, limit };
        if (typeof req.query.type === "string")
            query.type = req.query.type;
        if (typeof req.query.status === "string")
            query.status = req.query.status;
        if (typeof req.query.search === "string")
            query.search = req.query.search;
        const bbox = parseBBox(req.query.bbox);
        if (bbox)
            query.bbox = bbox;
        const { items, pagination } = await service_1.gisService.listMarkers(query);
        res.json((0, utils_1.createListResponse)(items, pagination, "Markers fetched"));
    }),
    markerStats: (0, utils_1.asyncHandler)(async (_req, res) => {
        const stats = await service_1.gisService.markerStats();
        res.json((0, utils_1.createApiResponse)(true, "Marker statistics", stats));
    }),
    createMarker: (0, utils_1.asyncHandler)(async (req, res) => {
        const dto = bodyOf(req);
        const marker = await service_1.gisService.createMarker(actorOf(req), dto);
        res.status(201).json((0, utils_1.createApiResponse)(true, "Marker created", marker));
    }),
    search: (0, utils_1.asyncHandler)(async (req, res) => {
        const q = typeof req.query.q === "string" ? req.query.q : "";
        const results = await service_1.gisService.search(q);
        res.json((0, utils_1.createApiResponse)(true, "Search results", results));
    }),
};
exports.default = exports.gisController;
//# sourceMappingURL=index.js.map