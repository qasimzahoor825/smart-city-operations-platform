"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.systemRepository = exports.seedMetrics = exports.seedSettings = void 0;
const repository_1 = require("../../../core/database/repository");
const now = new Date();
const seededStartedAt = new Date(now.getTime() - 12 * 3_600_000).toISOString();
exports.seedSettings = [
    {
        id: "settings_platform",
        platformName: "SmartCity OS",
        maintenanceMode: false,
        allowRegistrations: true,
        allowPublicComplaints: true,
        notificationsEnabled: true,
        createdAt: new Date(now.getTime() - 90 * 86_400_000).toISOString(),
        updatedAt: now.toISOString(),
    },
];
exports.seedMetrics = [
    {
        id: "metrics_platform",
        totalRequests: 128_940,
        activeUsers: 1_547,
        apiCalls: 1_310_872,
        startedAt: seededStartedAt,
    },
];
exports.systemRepository = {
    settings: (0, repository_1.collection)("system_settings"),
    metrics: (0, repository_1.collection)("system_metrics"),
    recordRequest() {
        const current = this.metrics.all()[0];
        if (!current)
            return;
        this.metrics.update(current.id, {
            totalRequests: current.totalRequests + 1,
            apiCalls: current.apiCalls + 1,
        });
    },
    reset() {
        this.settings.seed(exports.seedSettings);
        this.metrics.seed(exports.seedMetrics);
    },
};
exports.default = exports.systemRepository;
//# sourceMappingURL=index.js.map