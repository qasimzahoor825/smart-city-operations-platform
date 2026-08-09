"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportService = void 0;
const common_1 = require("@smartcity/common");
const repository_1 = require("../../auth/repository");
const repository_2 = require("../../assets/repository");
const repository_3 = require("../../departments/repository");
const repository_4 = require("../../complaints/repository");
const repository_5 = require("../repository");
const OPEN_STATUSES = ["SUBMITTED", "ASSIGNED", "IN_PROGRESS"];
const RESOLVED_STATUSES = ["RESOLVED", "CLOSED"];
function round1(value) {
    return Math.round(value * 10) / 10;
}
function resolutionHours(createdAt, resolvedAt) {
    if (!resolvedAt)
        return null;
    const diff = new Date(resolvedAt).getTime() - new Date(createdAt).getTime();
    return round1(Math.max(0, diff / 3_600_000));
}
function averageHours(pairs) {
    const hours = pairs
        .map((p) => resolutionHours(p.createdAt, p.resolvedAt))
        .filter((h) => h !== null);
    if (hours.length === 0)
        return 0;
    return round1(hours.reduce((sum, h) => sum + h, 0) / hours.length);
}
function csvEscape(value) {
    const s = String(value);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function csvSection(title, headers, rows) {
    const lines = [title, headers.map(csvEscape).join(","), ...rows.map((row) => row.map(csvEscape).join(","))];
    return lines.join("\n");
}
exports.reportService = {
    async overview() {
        const users = repository_1.authRepository.users.all();
        const officers = users.filter((u) => u.role === common_1.UserRole.OFFICER || u.role === common_1.UserRole.DEPARTMENT_HEAD).length;
        return {
            departments: repository_3.departmentRepository.departments.count(),
            officers,
            assets: repository_2.assetRepository.assets.count(),
            complaints: repository_4.complaintRepository.complaints.count(),
            emergencies: repository_5.reportRepository.emergencies.count(),
            appointments: repository_5.reportRepository.appointments.count(),
            generatedAt: new Date().toISOString(),
        };
    },
    async analytics() {
        const complaints = repository_4.complaintRepository.complaints.all();
        const total = complaints.length;
        const resolvedComplaints = complaints.filter((c) => RESOLVED_STATUSES.includes(c.status));
        const resolutionRate = total === 0 ? 0 : round1((resolvedComplaints.length / total) * 100);
        const avgResolutionHours = averageHours(resolvedComplaints.map((c) => ({ createdAt: c.createdAt, resolvedAt: c.resolvedAt })));
        const slaBreachCount = complaints.filter((c) => c.slaBreached).length;
        const groups = new Map();
        complaints.forEach((c) => {
            const key = c.departmentId ?? "unassigned";
            const entry = groups.get(key) ?? {
                departmentId: c.departmentId ?? null,
                departmentName: c.departmentName ?? null,
                total: 0,
                open: 0,
                resolved: 0,
                avgResolutionHours: 0,
            };
            entry.total += 1;
            if (OPEN_STATUSES.includes(c.status))
                entry.open += 1;
            if (RESOLVED_STATUSES.includes(c.status))
                entry.resolved += 1;
            groups.set(key, entry);
        });
        const byDepartment = [];
        groups.forEach((entry, key) => {
            const deptComplaints = complaints.filter((c) => (c.departmentId ?? "unassigned") === key);
            byDepartment.push({
                ...entry,
                avgResolutionHours: averageHours(deptComplaints.map((c) => ({ createdAt: c.createdAt, resolvedAt: c.resolvedAt }))),
            });
        });
        byDepartment.sort((a, b) => b.total - a.total);
        return {
            totalComplaints: total,
            resolvedComplaints: resolvedComplaints.length,
            resolutionRate,
            avgResolutionHours,
            slaBreachCount,
            byDepartment,
            generatedAt: new Date().toISOString(),
        };
    },
    async exportReport(format) {
        const overview = await this.overview();
        const analytics = await this.analytics();
        const generatedAt = new Date().toISOString();
        if (format === "csv") {
            const overviewRows = [
                ["departments", overview.departments],
                ["officers", overview.officers],
                ["assets", overview.assets],
                ["complaints", overview.complaints],
                ["emergencies", overview.emergencies],
                ["appointments", overview.appointments],
            ];
            const analyticsRows = [
                ["totalComplaints", analytics.totalComplaints],
                ["resolvedComplaints", analytics.resolvedComplaints],
                ["resolutionRate", analytics.resolutionRate],
                ["avgResolutionHours", analytics.avgResolutionHours],
                ["slaBreachCount", analytics.slaBreachCount],
            ];
            const departmentRows = analytics.byDepartment.map((d) => [
                d.departmentId ?? "unassigned",
                d.departmentName ?? "Unassigned",
                d.total,
                d.open,
                d.resolved,
                d.avgResolutionHours,
            ]);
            const csv = [
                csvSection("OVERVIEW", ["metric", "value"], overviewRows),
                csvSection("ANALYTICS", ["metric", "value"], analyticsRows),
                csvSection("BY_DEPARTMENT", ["departmentId", "departmentName", "total", "open", "resolved", "avgResolutionHours"], departmentRows),
            ].join("\n\n");
            return { format, generatedAt, data: csv };
        }
        return { format, generatedAt, data: { overview, analytics } };
    },
};
exports.default = exports.reportService;
//# sourceMappingURL=index.js.map