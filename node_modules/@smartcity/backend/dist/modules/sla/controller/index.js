"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.slaController = void 0;
const common_1 = require("@smartcity/common");
const utils_1 = require("../../../core/utils");
const service_1 = require("../service");
const repository_1 = require("../repository");
exports.slaController = {
    list: (0, utils_1.asyncHandler)(async (_req, res) => {
        const rules = await service_1.slaService.list();
        res.json((0, utils_1.createApiResponse)(true, "SLA rules fetched", rules));
    }),
    get: (0, utils_1.asyncHandler)(async (req, res) => {
        const rule = repository_1.slaRepository.rules.findById(req.params.id);
        if (!rule)
            throw new common_1.AppError("SLA rule not found", 404);
        res.json((0, utils_1.createApiResponse)(true, "SLA rule fetched", rule));
    }),
    create: (0, utils_1.asyncHandler)(async (req, res) => {
        const body = req.parsedBody ?? req.body;
        const rule = await service_1.slaService.upsert({
            id: `sla_${Date.now().toString(36)}`,
            name: body.name,
            priority: body.priority,
            category: body.category ?? null,
            departmentId: body.departmentId ?? null,
            hours: body.hours,
            active: body.active ?? true,
        });
        res.status(201).json((0, utils_1.createApiResponse)(true, "SLA rule created", rule));
    }),
    update: (0, utils_1.asyncHandler)(async (req, res) => {
        const existing = repository_1.slaRepository.rules.findById(req.params.id);
        if (!existing)
            throw new common_1.AppError("SLA rule not found", 404);
        const body = req.parsedBody ?? req.body;
        const updated = await service_1.slaService.upsert({
            ...existing,
            name: body.name ?? existing.name,
            priority: body.priority ?? existing.priority,
            category: body.category !== undefined ? body.category : existing.category,
            departmentId: body.departmentId !== undefined ? body.departmentId : existing.departmentId,
            hours: body.hours ?? existing.hours,
            active: body.active ?? existing.active,
        });
        res.json((0, utils_1.createApiResponse)(true, "SLA rule updated", updated));
    }),
};
exports.default = exports.slaController;
//# sourceMappingURL=index.js.map