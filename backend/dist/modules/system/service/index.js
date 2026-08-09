"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.systemService = void 0;
const common_1 = require("@smartcity/common");
const repository_1 = require("../repository");
function toSettingsDto(settings) {
    return {
        id: settings.id,
        platformName: settings.platformName,
        maintenanceMode: settings.maintenanceMode,
        allowRegistrations: settings.allowRegistrations,
        allowPublicComplaints: settings.allowPublicComplaints,
        notificationsEnabled: settings.notificationsEnabled,
        createdAt: settings.createdAt,
        updatedAt: settings.updatedAt,
    };
}
function toMetricsDto(metrics) {
    return {
        totalRequests: metrics.totalRequests,
        activeUsers: metrics.activeUsers,
        apiCalls: metrics.apiCalls,
        startedAt: metrics.startedAt,
        recordedAt: new Date().toISOString(),
    };
}
async function pingDatabase() {
    return true;
}
exports.systemService = {
    async health() {
        const dbPing = await pingDatabase();
        return {
            service: "SmartCity OS Backend",
            status: dbPing ? "UP" : "DOWN",
            dbPing,
            uptimeSeconds: Math.floor(process.uptime()),
            timestamp: new Date().toISOString(),
        };
    },
    async getSettings() {
        const settings = repository_1.systemRepository.settings.all()[0];
        if (!settings)
            throw new common_1.NotFoundError("Platform settings not found");
        return toSettingsDto(settings);
    },
    async updateSettings(dto) {
        const settings = repository_1.systemRepository.settings.all()[0];
        if (!settings)
            throw new common_1.NotFoundError("Platform settings not found");
        const patch = { updatedAt: new Date().toISOString() };
        if (dto.platformName !== undefined)
            patch.platformName = dto.platformName.trim();
        if (dto.maintenanceMode !== undefined)
            patch.maintenanceMode = dto.maintenanceMode;
        if (dto.allowRegistrations !== undefined)
            patch.allowRegistrations = dto.allowRegistrations;
        if (dto.allowPublicComplaints !== undefined)
            patch.allowPublicComplaints = dto.allowPublicComplaints;
        if (dto.notificationsEnabled !== undefined)
            patch.notificationsEnabled = dto.notificationsEnabled;
        const updated = repository_1.systemRepository.settings.update(settings.id, patch);
        if (!updated)
            throw new common_1.NotFoundError("Platform settings not found");
        return toSettingsDto(updated);
    },
    async getMetrics() {
        const metrics = repository_1.systemRepository.metrics.all()[0];
        if (!metrics)
            throw new common_1.NotFoundError("Metrics not available");
        return toMetricsDto(metrics);
    },
};
exports.default = exports.systemService;
//# sourceMappingURL=index.js.map