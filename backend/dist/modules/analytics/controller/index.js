"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsController = void 0;
const utils_1 = require("../../../core/utils");
const service_1 = require("../service");
exports.analyticsController = {
    overview: (0, utils_1.asyncHandler)(async (_req, res) => {
        const data = await service_1.analyticsService.overview();
        res.json((0, utils_1.createApiResponse)(true, "Analytics overview", data));
    }),
    complaints: (0, utils_1.asyncHandler)(async (_req, res) => {
        const data = await service_1.analyticsService.complaints();
        res.json((0, utils_1.createApiResponse)(true, "Complaint analytics", data));
    }),
    departments: (0, utils_1.asyncHandler)(async (_req, res) => {
        const data = await service_1.analyticsService.departments();
        res.json((0, utils_1.createApiResponse)(true, "Department analytics", data));
    }),
    assets: (0, utils_1.asyncHandler)(async (_req, res) => {
        const data = await service_1.analyticsService.assets();
        res.json((0, utils_1.createApiResponse)(true, "Asset analytics", data));
    }),
    sla: (0, utils_1.asyncHandler)(async (_req, res) => {
        const data = await service_1.analyticsService.sla();
        res.json((0, utils_1.createApiResponse)(true, "SLA analytics", data));
    }),
    citizenSatisfaction: (0, utils_1.asyncHandler)(async (_req, res) => {
        const data = await service_1.analyticsService.citizenSatisfaction();
        res.json((0, utils_1.createApiResponse)(true, "Citizen satisfaction analytics", data));
    }),
    timeSeries: (0, utils_1.asyncHandler)(async (req, res) => {
        const days = Math.min(365, Math.max(1, Number(req.query.days) || 30));
        const data = await service_1.analyticsService.timeSeries(days);
        res.json((0, utils_1.createApiResponse)(true, "Time series analytics", data));
    }),
    forecast: (0, utils_1.asyncHandler)(async (req, res) => {
        const days = Math.min(90, Math.max(7, Number(req.query.days) || 30));
        const data = await service_1.analyticsService.forecast(days);
        res.json((0, utils_1.createApiResponse)(true, "Predictive complaint-volume forecast", data));
    }),
};
exports.default = exports.analyticsController;
//# sourceMappingURL=index.js.map