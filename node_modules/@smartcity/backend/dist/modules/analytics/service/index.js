"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsService = void 0;
const common_1 = require("@smartcity/common");
const mongo_1 = require("../../../core/database/mongo");
const repository_1 = require("../../../core/database/repository");
const redis_1 = require("../../../core/redis");
const repository_2 = require("../../auth/repository");
const repository_3 = require("../../departments/repository");
const repository_4 = require("../../complaints/repository");
const repository_5 = require("../../assets/repository");
const repository_6 = require("../../emergency/repository");
const OPEN_STATUSES = [
    common_1.ComplaintStatus.SUBMITTED,
    common_1.ComplaintStatus.RECEIVED,
    common_1.ComplaintStatus.ASSIGNED,
    common_1.ComplaintStatus.UNDER_REVIEW,
    common_1.ComplaintStatus.FIELD_INSPECTION,
    common_1.ComplaintStatus.IN_PROGRESS,
    common_1.ComplaintStatus.ESCALATED,
];
const RESOLVED_STATUSES = [
    common_1.ComplaintStatus.RESOLVED,
    common_1.ComplaintStatus.CITIZEN_FEEDBACK,
    common_1.ComplaintStatus.CLOSED,
];
const REVIEW_STATUSES = [common_1.ComplaintStatus.RECEIVED, common_1.ComplaintStatus.UNDER_REVIEW];
const INSPECTION_STATUSES = [common_1.ComplaintStatus.FIELD_INSPECTION];
const serviceRequests = (0, repository_1.collection)("service_requests");
const feedbackColl = (0, repository_1.collection)("feedback");
function isDb() {
    return (0, mongo_1.mongoState)() === "connected";
}
/** Run a pipeline against a collection; empty when MongoDB is unavailable. */
function runAgg(collectionName, pipeline) {
    return (0, repository_1.collection)(collectionName).aggregate(pipeline);
}
/** First element of a `$count` result, coerced to a number. */
function countFrom(rows) {
    return rows[0]?.n ?? 0;
}
function round1(value) {
    return Math.round(value * 10) / 10;
}
function kvToValueCount(rows, fallbackKey = "unknown") {
    return (rows ?? [])
        .map((row) => ({ key: String(row._id ?? fallbackKey), count: Number(row.count) }))
        .sort((a, b) => b.count - a.count);
}
// ---------------------------------------------------------------------------
// Aggregation pipelines (real MongoDB $group / $facet / $count queries).
// ---------------------------------------------------------------------------
async function overviewFromAggs() {
    const users = await runAgg("users", [
        {
            $facet: {
                citizens: [{ $match: { role: common_1.UserRole.CITIZEN } }, { $count: "n" }],
                officers: [{ $match: { role: { $in: [common_1.UserRole.OFFICER, common_1.UserRole.DEPARTMENT_HEAD] } } }, { $count: "n" }],
            },
        },
    ]);
    const complaints = await runAgg("complaints", [
        {
            $facet: {
                total: [{ $count: "n" }],
                open: [{ $match: { status: { $in: OPEN_STATUSES } } }, { $count: "n" }],
                resolved: [{ $match: { status: { $in: RESOLVED_STATUSES } } }, { $count: "n" }],
                pendingReview: [{ $match: { status: { $in: REVIEW_STATUSES } } }, { $count: "n" }],
                fieldInspections: [{ $match: { status: { $in: INSPECTION_STATUSES } } }, { $count: "n" }],
                slaViolations: [{ $match: { slaBreached: true } }, { $count: "n" }],
                avgResolutionHours: [
                    { $match: { resolvedAt: { $ne: null } } },
                    {
                        $project: {
                            h: { $divide: [{ $subtract: [{ $toDate: "$resolvedAt" }, { $toDate: "$createdAt" }] }, 3_600_000] },
                        },
                    },
                    { $group: { _id: null, avg: { $avg: "$h" } } },
                ],
            },
        },
    ]);
    const assets = await runAgg("assets", [
        {
            $facet: {
                total: [{ $count: "n" }],
                active: [
                    { $match: { status: { $nin: ["RETIRED", "INACTIVE"] } } },
                    { $count: "n" },
                ],
                maintenance: [
                    { $match: { status: { $in: ["MAINTENANCE", "UNDER_MAINTENANCE", "DAMAGED"] } } },
                    { $count: "n" },
                ],
            },
        },
    ]);
    const emergencies = await runAgg("emergencies", [
        {
            $facet: {
                total: [{ $count: "n" }],
                active: [{ $match: { status: { $nin: [common_1.EmergencyStatus.RESOLVED, common_1.EmergencyStatus.CLOSED] } } }, { $count: "n" }],
            },
        },
    ]);
    const serviceRequestsAgg = await runAgg("service_requests", [
        {
            $facet: {
                pending: [{ $match: { status: { $nin: ["COMPLETED", "REJECTED", "CANCELLED"] } } }, { $count: "n" }],
            },
        },
    ]);
    const feedback = await runAgg("feedback", [
        {
            $facet: {
                total: [{ $count: "n" }],
                avg: [{ $group: { _id: null, avg: { $avg: "$rating" } } }],
            },
        },
    ]);
    const departmentsCount = await runAgg("departments", [{ $count: "total" }]);
    const u = users[0] ?? { citizens: [], officers: [] };
    const c = complaints[0] ?? {};
    const a = assets[0] ?? {};
    const e = emergencies[0] ?? {};
    const s = serviceRequestsAgg[0] ?? {};
    const f = feedback[0] ?? {};
    const totalCitizens = countFrom(u.citizens);
    const totalOfficers = countFrom(u.officers);
    const totalComplaints = countFrom(c.total);
    const openComplaints = countFrom(c.open);
    const resolvedComplaints = countFrom(c.resolved);
    const pendingReview = countFrom(c.pendingReview);
    const fieldInspections = countFrom(c.fieldInspections);
    const slaViolations = countFrom(c.slaViolations);
    const avgResolutionHours = round1(Math.max(0, c.avgResolutionHours?.[0]?.avg ?? 0));
    const resolutionRate = totalComplaints === 0 ? 0 : round1((resolvedComplaints / totalComplaints) * 100);
    const slaComplianceRate = totalComplaints === 0 ? 0 : round1(((totalComplaints - slaViolations) / totalComplaints) * 100);
    const activeAssets = countFrom(a.active);
    const assetsInMaintenance = countFrom(a.maintenance);
    const activeEmergencies = countFrom(e.active);
    const pendingServiceRequests = countFrom(s.pending);
    const totalFeedback = countFrom(f.total);
    const avgCitizenRating = round1(Math.max(0, f.avg?.[0]?.avg ?? 0));
    return {
        totalCitizens,
        totalOfficers,
        totalDepartments: countFrom(departmentsCount[0]?.total ?? []),
        totalComplaints,
        openComplaints,
        resolvedComplaints,
        pendingReview,
        fieldInspections,
        slaViolations,
        slaComplianceRate,
        avgResolutionHours,
        resolutionRate,
        activeAssets,
        assetsInMaintenance,
        activeEmergencies,
        totalEmergencies: countFrom(e.total),
        pendingServiceRequests,
        totalFeedback,
        avgCitizenRating,
        generatedAt: new Date().toISOString(),
    };
}
async function complaintsFromAggs() {
    const rows = await runAgg("complaints", [
        {
            $facet: {
                byStatus: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
                byPriority: [{ $group: { _id: "$priority", count: { $sum: 1 } } }],
                byCategory: [{ $group: { _id: "$category", count: { $sum: 1 } } }],
                byDepartment: [
                    { $group: { _id: { $ifNull: ["$departmentName", { $ifNull: ["$departmentId", "unassigned"] }] }, count: { $sum: 1 } } },
                ],
                byCitizen: [{ $group: { _id: { $ifNull: ["$citizenName", "citizen"] }, count: { $sum: 1 } } }],
            },
        },
    ]);
    const r = rows[0] ?? {};
    const total = await runAgg("complaints", [{ $count: "total" }]);
    return {
        total: countFrom(total[0]?.total ?? []),
        byStatus: kvToValueCount(r.byStatus),
        byPriority: kvToValueCount(r.byPriority),
        byCategory: kvToValueCount(r.byCategory),
        byDepartment: kvToValueCount(r.byDepartment),
        byCitizen: kvToValueCount(r.byCitizen),
    };
}
async function departmentsFromAggs() {
    const complaintStats = await runAgg("complaints", [
        {
            $group: {
                _id: "$departmentId",
                total: { $sum: 1 },
                open: { $sum: { $cond: [{ $in: ["$status", OPEN_STATUSES] }, 1, 0] } },
                resolved: { $sum: { $cond: [{ $in: ["$status", RESOLVED_STATUSES] }, 1, 0] } },
                slaViolations: { $sum: { $cond: ["$slaBreached", 1, 0] } },
                avgHours: {
                    $avg: {
                        $cond: [
                            { $and: [{ $ne: ["$resolvedAt", null] }, { $ne: ["$createdAt", null] }] },
                            { $divide: [{ $subtract: [{ $toDate: "$resolvedAt" }, { $toDate: "$createdAt" }] }, 3_600_000] },
                            0,
                        ],
                    },
                },
            },
        },
    ]);
    const officerStats = await runAgg("users", [
        {
            $match: { role: { $in: [common_1.UserRole.OFFICER, common_1.UserRole.DEPARTMENT_HEAD] } },
        },
        { $group: { _id: { $ifNull: ["$departmentId", null] }, count: { $sum: 1 } } },
    ]);
    const assetStats = await runAgg("assets", [
        { $group: { _id: "$department", count: { $sum: 1 } } },
    ]);
    const officerByDept = new Map();
    officerStats.forEach((o) => officerByDept.set(String(o._id ?? "null"), o.count));
    const assetByDept = new Map();
    assetStats.forEach((o) => assetByDept.set(String(o._id ?? "null"), o.count));
    const departments = repository_3.departmentRepository.departments.all();
    if (departments.length === 0)
        return [];
    return departments.map((dept) => {
        const stats = complaintStats.find((s) => String(s.departmentId) === dept.id);
        return {
            departmentId: dept.id,
            departmentName: dept.name,
            total: stats?.total ?? 0,
            open: stats?.open ?? 0,
            resolved: stats?.resolved ?? 0,
            avgResolutionHours: round1(Math.max(0, stats?.avgHours ?? 0)),
            slaViolations: stats?.slaViolations ?? 0,
            officerCount: officerByDept.get(dept.id) ?? 0,
            assets: (assetByDept.get(dept.id) ?? 0) + (assetByDept.get(dept.name) ?? 0),
        };
    }).sort((a, b) => b.total - a.total);
}
async function assetsFromAggs() {
    const rows = await runAgg("assets", [
        {
            $facet: {
                total: [{ $count: "n" }],
                byStatus: [{ $group: { _id: { $ifNull: ["$status", "UNKNOWN"] }, count: { $sum: 1 } } }],
                byCategory: [{ $group: { _id: { $ifNull: ["$category", "OTHER"] }, count: { $sum: 1 } } }],
                byDepartment: [{ $group: { _id: { $ifNull: ["$department", "unassigned"] }, count: { $sum: 1 } } }],
                operational: [
                    { $match: { status: { $in: [common_1.AssetStatus.OPERATIONAL, common_1.AssetStatus.ACTIVE] } } },
                    { $count: "n" },
                ],
                damaged: [
                    { $match: { status: { $in: [common_1.AssetStatus.DAMAGED, common_1.AssetStatus.OUT_OF_SERVICE, common_1.AssetStatus.INACTIVE, common_1.AssetStatus.RETIRED] } } },
                    { $count: "n" },
                ],
            },
        },
    ]);
    const r = rows[0] ?? {};
    const total = countFrom(r.total);
    const operational = countFrom(r.operational);
    const damaged = countFrom(r.damaged);
    return {
        total,
        byStatus: kvToValueCount(r.byStatus),
        byCategory: kvToValueCount(r.byCategory),
        byDepartment: kvToValueCount(r.byDepartment),
        operationalRate: total === 0 ? 0 : round1((operational / total) * 100),
        healthScore: total === 0 ? 100 : round1(100 - (damaged / total) * 100),
    };
}
async function slaFromAggs() {
    const rows = await runAgg("complaints", [
        {
            $facet: {
                total: [{ $count: "n" }],
                violated: [{ $match: { slaBreached: true } }, { $count: "n" }],
                atRisk: [
                    {
                        $match: {
                            status: { $in: OPEN_STATUSES },
                            slaBreached: { $ne: true },
                            slaDeadline: { $ne: null },
                            $expr: {
                                $and: [
                                    { $gt: [{ $subtract: [{ $toDate: "$slaDeadline" }, "$$NOW"] }, 0] },
                                    { $lt: [{ $subtract: [{ $toDate: "$slaDeadline" }, "$$NOW"] }, { $multiply: [{ $ifNull: ["$slaHours", 24] }, 900] }] },
                                ],
                            },
                        },
                    },
                    { $count: "n" },
                ],
                avgHours: [{ $group: { _id: null, avg: { $avg: "$slaHours" } } }],
                byPriority: [
                    { $match: { slaBreached: true } },
                    { $group: { _id: { $ifNull: ["$priority", "UNKNOWN"] }, count: { $sum: 1 } } },
                ],
            },
        },
    ]);
    const r = rows[0] ?? {};
    const total = countFrom(r.total);
    const violated = countFrom(r.violated);
    return {
        complianceRate: total === 0 ? 100 : round1(((total - violated) / total) * 100),
        violatedCount: violated,
        atRiskCount: countFrom(r.atRisk),
        averageHours: total === 0 ? 0 : round1(r.avgHours?.[0]?.avg ?? 0),
        byPriority: kvToValueCount(r.byPriority, "UNKNOWN"),
    };
}
async function satisfactionFromAggs() {
    const rows = await runAgg("feedback", [
        {
            $facet: {
                total: [{ $count: "n" }],
                avg: [{ $group: { _id: null, avg: { $avg: "$rating" } } }],
                distribution: [{ $group: { _id: "$rating", count: { $sum: 1 } } }],
            },
        },
    ]);
    const recent = await runAgg("feedback", [
        { $sort: { createdAt: -1 } },
        { $limit: 10 },
    ]);
    const r = rows[0] ?? {};
    const total = countFrom(r.total);
    const dist = new Map();
    ["1", "2", "3", "4", "5"].forEach((k) => dist.set(k, 0));
    (r.distribution ?? []).forEach((row) => dist.set(String(row._id), Number(row.count)));
    return {
        total,
        avgRating: total === 0 ? 0 : round1(Math.max(0, r.avg?.[0]?.avg ?? 0)),
        distribution: [...dist.entries()].map(([key, count]) => ({ key, count })).sort((a, b) => a.key.localeCompare(b.key)),
        recent,
    };
}
async function timeSeriesFromAggs(days) {
    const since = new Date(Date.now() - days * 86_400_000).toISOString();
    const [created, resolved] = await Promise.all([
        runAgg("complaints", [
            { $match: { createdAt: { $gte: since } } },
            { $project: { day: { $dateToString: { format: "%Y-%m-%d", date: { $toDate: "$createdAt" } } } } },
            { $group: { _id: "$day", count: { $sum: 1 } } },
        ]),
        runAgg("complaints", [
            { $match: { resolvedAt: { $gte: since, $ne: null } } },
            { $project: { day: { $dateToString: { format: "%Y-%m-%d", date: { $toDate: "$resolvedAt" } } } } },
            { $group: { _id: "$day", count: { $sum: 1 } } },
        ]),
    ]);
    const createdMap = new Map(created.map((r) => [r._id, r.count]));
    const resolvedMap = new Map(resolved.map((r) => [r._id, r.count]));
    const points = [];
    for (let i = days - 1; i >= 0; i -= 1) {
        const date = new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10);
        points.push({ date, created: createdMap.get(date) ?? 0, resolved: resolvedMap.get(date) ?? 0 });
    }
    return points;
}
// ---------------------------------------------------------------------------
// In-memory fallbacks (used when MongoDB is not connected).
// ---------------------------------------------------------------------------
function resolutionHours(createdAt, resolvedAt) {
    if (!resolvedAt)
        return null;
    const diff = new Date(resolvedAt).getTime() - new Date(createdAt).getTime();
    return round1(Math.max(0, diff / 3_600_000));
}
function averageResolutionHours(complaints) {
    const hours = complaints.map((c) => resolutionHours(c.createdAt, c.resolvedAt)).filter((h) => h !== null);
    if (hours.length === 0)
        return 0;
    return round1(hours.reduce((sum, h) => sum + h, 0) / hours.length);
}
function groupCount(items, keyOf) {
    const out = {};
    for (const item of items) {
        const key = keyOf(item) ?? "unknown";
        out[key] = (out[key] ?? 0) + 1;
    }
    return out;
}
function toValueCountFromRecord(record) {
    return Object.entries(record)
        .sort((a, b) => b[1] - a[1])
        .map(([key, count]) => ({ key, count }));
}
async function overviewFromMemory() {
    const users = repository_2.authRepository.users.all();
    const complaints = repository_4.complaintRepository.complaints.all();
    const assets = repository_5.assetRepository.assets.all();
    const emergencies = repository_6.emergencyRepository.emergencies.all();
    const feedback = repository_4.complaintRepository.feedback.all();
    const serviceRequestsAll = serviceRequests.all();
    const totalCitizens = users.filter((u) => u.role === common_1.UserRole.CITIZEN).length;
    const totalOfficers = users.filter((u) => u.role === common_1.UserRole.OFFICER || u.role === common_1.UserRole.DEPARTMENT_HEAD).length;
    const openComplaints = complaints.filter((c) => OPEN_STATUSES.includes(c.status)).length;
    const resolvedComplaints = complaints.filter((c) => RESOLVED_STATUSES.includes(c.status)).length;
    const pendingReview = complaints.filter((c) => REVIEW_STATUSES.includes(c.status)).length;
    const fieldInspections = complaints.filter((c) => INSPECTION_STATUSES.includes(c.status)).length;
    const slaViolations = complaints.filter((c) => c.slaBreached).length;
    const resolutionRate = complaints.length === 0 ? 0 : round1((resolvedComplaints / complaints.length) * 100);
    const avgResolutionHours = averageResolutionHours(complaints.map((c) => ({ createdAt: c.createdAt, resolvedAt: c.resolvedAt })));
    const slaComplianceRate = complaints.length === 0 ? 0 : round1(((complaints.length - slaViolations) / complaints.length) * 100);
    const activeAssets = assets.filter((a) => a.status !== "RETIRED" && a.status !== "INACTIVE").length;
    const assetsInMaintenance = assets.filter((a) => a.status === "MAINTENANCE" || a.status === "UNDER_MAINTENANCE" || a.status === "DAMAGED").length;
    const activeEmergencies = emergencies.filter((e) => e.status !== common_1.EmergencyStatus.RESOLVED && e.status !== common_1.EmergencyStatus.CLOSED).length;
    const pendingServiceRequests = serviceRequestsAll.filter((s) => s.status !== "COMPLETED" && s.status !== "REJECTED" && s.status !== "CANCELLED").length;
    const avgCitizenRating = feedback.length === 0 ? 0 : round1(feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length);
    return {
        totalCitizens,
        totalOfficers,
        totalDepartments: repository_3.departmentRepository.departments.count(),
        totalComplaints: complaints.length,
        openComplaints,
        resolvedComplaints,
        pendingReview,
        fieldInspections,
        slaViolations,
        slaComplianceRate,
        avgResolutionHours,
        resolutionRate,
        activeAssets,
        assetsInMaintenance,
        activeEmergencies,
        totalEmergencies: emergencies.length,
        pendingServiceRequests,
        totalFeedback: feedback.length,
        avgCitizenRating,
        generatedAt: new Date().toISOString(),
    };
}
async function complaintsFromMemory() {
    const complaints = repository_4.complaintRepository.complaints.all();
    return {
        total: complaints.length,
        byStatus: toValueCountFromRecord(groupCount(complaints, (c) => c.status)),
        byPriority: toValueCountFromRecord(groupCount(complaints, (c) => c.priority)),
        byCategory: toValueCountFromRecord(groupCount(complaints, (c) => c.category)),
        byDepartment: toValueCountFromRecord(groupCount(complaints, (c) => c.departmentName ?? c.departmentId ?? "unassigned")),
        byCitizen: toValueCountFromRecord(groupCount(complaints, (c) => c.citizenName ?? "citizen")),
    };
}
async function departmentsFromMemory() {
    const departments = repository_3.departmentRepository.departments.all();
    const complaints = repository_4.complaintRepository.complaints.all();
    const assets = repository_5.assetRepository.assets.all();
    const users = repository_2.authRepository.users.all();
    return departments
        .map((dept) => {
        const deptComplaints = complaints.filter((c) => c.departmentId === dept.id);
        const open = deptComplaints.filter((c) => OPEN_STATUSES.includes(c.status)).length;
        const resolved = deptComplaints.filter((c) => RESOLVED_STATUSES.includes(c.status)).length;
        return {
            departmentId: dept.id,
            departmentName: dept.name,
            total: deptComplaints.length,
            open,
            resolved,
            avgResolutionHours: averageResolutionHours(deptComplaints.map((c) => ({ createdAt: c.createdAt, resolvedAt: c.resolvedAt }))),
            slaViolations: deptComplaints.filter((c) => c.slaBreached).length,
            officerCount: users.filter((u) => (u.departmentId ?? null) === dept.id && (u.role === common_1.UserRole.OFFICER || u.role === common_1.UserRole.DEPARTMENT_HEAD)).length,
            assets: assets.filter((a) => a.department === dept.id || a.department === dept.name).length,
        };
    })
        .sort((a, b) => b.total - a.total);
}
async function assetsFromMemory() {
    const assets = repository_5.assetRepository.assets.all();
    const total = assets.length;
    const byStatus = toValueCountFromRecord(groupCount(assets, (a) => a.status ?? "UNKNOWN"));
    const byCategory = toValueCountFromRecord(groupCount(assets, (a) => a.category ?? "OTHER"));
    const byDepartment = toValueCountFromRecord(groupCount(assets, (a) => a.department ?? "unassigned"));
    const operational = assets.filter((a) => a.status === common_1.AssetStatus.OPERATIONAL || a.status === common_1.AssetStatus.ACTIVE).length;
    const damaged = assets.filter((a) => a.status === common_1.AssetStatus.DAMAGED || a.status === common_1.AssetStatus.OUT_OF_SERVICE || a.status === common_1.AssetStatus.INACTIVE || a.status === common_1.AssetStatus.RETIRED).length;
    const operationalRate = total === 0 ? 0 : round1((operational / total) * 100);
    const healthScore = total === 0 ? 100 : round1(100 - (damaged / total) * 100);
    return { total, byStatus, byCategory, byDepartment, operationalRate, healthScore };
}
async function slaFromMemory() {
    const complaints = repository_4.complaintRepository.complaints.all();
    const violated = complaints.filter((c) => c.slaBreached);
    const now = Date.now();
    let atRisk = 0;
    for (const c of complaints) {
        if (OPEN_STATUSES.includes(c.status) && c.slaDeadline && !c.slaBreached) {
            const remaining = new Date(c.slaDeadline).getTime() - now;
            if (remaining > 0 && remaining < (c.slaHours ?? 24) * 0.25 * 3_600_000)
                atRisk += 1;
        }
    }
    const complianceRate = complaints.length === 0 ? 100 : round1(((complaints.length - violated.length) / complaints.length) * 100);
    return {
        complianceRate,
        violatedCount: violated.length,
        atRiskCount: atRisk,
        averageHours: complaints.length === 0 ? 0 : round1(complaints.reduce((s, c) => s + (c.slaHours ?? 0), 0) / complaints.length),
        byPriority: toValueCountFromRecord(groupCount(violated, (c) => c.priority)),
    };
}
async function satisfactionFromMemory() {
    const feedback = repository_4.complaintRepository.feedback.all().slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const total = feedback.length;
    const avgRating = total === 0 ? 0 : round1(feedback.reduce((s, f) => s + f.rating, 0) / total);
    const distribution = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };
    feedback.forEach((f) => {
        if (distribution[String(f.rating)] !== undefined)
            distribution[String(f.rating)] += 1;
    });
    return {
        total,
        avgRating,
        distribution: toValueCountFromRecord(distribution),
        recent: feedback.slice(0, 10).map((f) => ({ complaintId: f.complaintId, rating: f.rating, comment: f.comment, createdAt: f.createdAt })),
    };
}
async function timeSeriesFromMemory(days) {
    const complaints = repository_4.complaintRepository.complaints.all();
    const since = new Date(Date.now() - days * 86_400_000).getTime();
    const points = new Map();
    for (let i = days - 1; i >= 0; i -= 1) {
        const date = new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10);
        points.set(date, { date, created: 0, resolved: 0 });
    }
    for (const c of complaints) {
        const created = new Date(c.createdAt).getTime();
        if (created < since)
            continue;
        const date = new Date(created).toISOString().slice(0, 10);
        const point = points.get(date);
        if (point)
            point.created += 1;
        if (c.resolvedAt) {
            const rDate = new Date(c.resolvedAt).toISOString().slice(0, 10);
            const rPoint = points.get(rDate);
            if (rPoint)
                rPoint.resolved += 1;
        }
    }
    return [...points.values()];
}
// ---------------------------------------------------------------------------
// Public service (aggregation when MongoDB is available, cache in Redis).
// ---------------------------------------------------------------------------
function cached(key, ttlSeconds, fn) {
    return redis_1.redis
        .get(key)
        .then((raw) => (raw ? JSON.parse(raw) : null))
        .then(async (hit) => {
        if (hit)
            return hit;
        const value = await fn();
        await redis_1.redis.set(key, JSON.stringify(value), ttlSeconds);
        return value;
    });
}
exports.analyticsService = {
    overview() {
        return cached("analytics:overview", 60, () => (isDb() ? overviewFromAggs() : overviewFromMemory()));
    },
    complaints() {
        return cached("analytics:complaints", 60, () => (isDb() ? complaintsFromAggs() : complaintsFromMemory()));
    },
    departments() {
        return cached("analytics:departments", 120, () => (isDb() ? departmentsFromAggs() : departmentsFromMemory()));
    },
    assets() {
        return cached("analytics:assets", 120, () => (isDb() ? assetsFromAggs() : assetsFromMemory()));
    },
    sla() {
        return cached("analytics:sla", 60, () => (isDb() ? slaFromAggs() : slaFromMemory()));
    },
    citizenSatisfaction() {
        return cached("analytics:satisfaction", 300, () => (isDb() ? satisfactionFromAggs() : satisfactionFromMemory()));
    },
    timeSeries(days = 30) {
        return cached(`analytics:time:${days}`, 300, () => (isDb() ? timeSeriesFromAggs(days) : timeSeriesFromMemory(days)));
    },
};
exports.default = exports.analyticsService;
//# sourceMappingURL=index.js.map