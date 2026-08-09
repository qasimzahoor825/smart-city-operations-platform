"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportController = void 0;
const service_1 = require("../service");
const utils_1 = require("../../../core/utils");
const common_1 = require("@smartcity/common");
exports.reportController = {
    overview: (0, utils_1.asyncHandler)(async (_req, res) => {
        const overview = await service_1.reportService.overview();
        res.json((0, utils_1.createApiResponse)(true, "Report overview", overview));
    }),
    analytics: (0, utils_1.asyncHandler)(async (_req, res) => {
        const analytics = await service_1.reportService.analytics();
        res.json((0, utils_1.createApiResponse)(true, "Report analytics", analytics));
    }),
    exportReport: (0, utils_1.asyncHandler)(async (req, res) => {
        const requested = typeof req.query.format === "string" ? req.query.format : "json";
        const format = requested === "csv" ? "csv" : "json";
        if (requested !== "json" && requested !== "csv") {
            throw new common_1.AppError("Invalid format. Allowed: json, csv", 422);
        }
        const report = await service_1.reportService.exportReport(format);
        if (format === "csv") {
            res.setHeader("Content-Type", "text/csv; charset=utf-8");
            res.setHeader("Content-Disposition", `attachment; filename="smartcity-report-${Date.now()}.csv"`);
            res.send(report.data);
            return;
        }
        res.json((0, utils_1.createApiResponse)(true, "Report exported", report));
    }),
};
exports.default = exports.reportController;
//# sourceMappingURL=index.js.map