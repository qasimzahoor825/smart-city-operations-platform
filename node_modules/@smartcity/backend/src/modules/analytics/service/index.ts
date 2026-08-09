import { AssetStatus, ComplaintStatus, EmergencyStatus, UserRole } from "@smartcity/common";
import type { PipelineStage } from "mongoose";
import { mongoState } from "../../../core/database/mongo";
import { collection } from "../../../core/database/repository";
import { redis } from "../../../core/redis";
import { authRepository } from "../../auth/repository";
import { departmentRepository } from "../../departments/repository";
import { complaintRepository } from "../../complaints/repository";
import { assetRepository } from "../../assets/repository";
import { emergencyRepository } from "../../emergency/repository";
import type {
  AnalyticsOverview,
  AssetAnalytics,
  DepartmentAnalytics,
  SlaAnalytics,
  TimeSeriesPoint,
  ValueCount,
} from "../dto";

const OPEN_STATUSES: string[] = [
  ComplaintStatus.SUBMITTED,
  ComplaintStatus.RECEIVED,
  ComplaintStatus.ASSIGNED,
  ComplaintStatus.UNDER_REVIEW,
  ComplaintStatus.FIELD_INSPECTION,
  ComplaintStatus.IN_PROGRESS,
  ComplaintStatus.ESCALATED,
];
const RESOLVED_STATUSES: string[] = [
  ComplaintStatus.RESOLVED,
  ComplaintStatus.CITIZEN_FEEDBACK,
  ComplaintStatus.CLOSED,
];
const REVIEW_STATUSES: string[] = [ComplaintStatus.RECEIVED, ComplaintStatus.UNDER_REVIEW];
const INSPECTION_STATUSES: string[] = [ComplaintStatus.FIELD_INSPECTION];

interface PlainComplaint {
  id: string;
  status: string;
  priority: string;
  category: string;
  departmentId?: string | null;
  departmentName?: string | null;
  citizenName?: string | null;
  slaBreached?: boolean;
  slaHours?: number;
  slaDeadline?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
}
interface PlainAsset {
  id: string;
  status?: string;
  category?: string;
  department?: string | null;
}
interface PlainFeedback {
  id: string;
  complaintId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}
interface PlainServiceRequest {
  id: string;
  status: string;
}

const serviceRequests = collection<PlainServiceRequest>("service_requests");
const feedbackColl = collection<PlainFeedback>("feedback");

function isDb(): boolean {
  return mongoState() === "connected";
}

/** Run a pipeline against a collection; empty when MongoDB is unavailable. */
function runAgg<T = Record<string, unknown>>(collectionName: string, pipeline: PipelineStage[]): Promise<T[]> {
  return collection(collectionName).aggregate<T>(pipeline);
}

/** First element of a `$count` result, coerced to a number. */
function countFrom(rows: { n?: number }[]): number {
  return rows[0]?.n ?? 0;
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

/** MongoDB `$group` output row: `{ _id, count }`. */
interface Kvp {
  _id: unknown;
  count: number;
}

function kvToValueCount(rows: Kvp[] | undefined, fallbackKey = "unknown"): ValueCount[] {
  return (rows ?? [])
    .map((row) => ({ key: String(row._id ?? fallbackKey), count: Number(row.count) }))
    .sort((a, b) => b.count - a.count);
}

// ---------------------------------------------------------------------------
// Aggregation pipelines (real MongoDB $group / $facet / $count queries).
// ---------------------------------------------------------------------------

async function overviewFromAggs(): Promise<AnalyticsOverview> {
  const users = await runAgg<{ citizens: { n?: number }[]; officers: { n?: number }[] }>("users", [
    {
      $facet: {
        citizens: [{ $match: { role: UserRole.CITIZEN } }, { $count: "n" }],
        officers: [{ $match: { role: { $in: [UserRole.OFFICER, UserRole.DEPARTMENT_HEAD] } } }, { $count: "n" }],
      },
    },
  ]);

  const complaints = await runAgg<{
    total: { n?: number }[];
    open: { n?: number }[];
    resolved: { n?: number }[];
    pendingReview: { n?: number }[];
    fieldInspections: { n?: number }[];
    slaViolations: { n?: number }[];
    avgResolutionHours: { avg?: number }[];
  }>("complaints", [
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

  const assets = await runAgg<{
    total: { n?: number }[];
    active: { n?: number }[];
    maintenance: { n?: number }[];
  }>("assets", [
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

  const emergencies = await runAgg<{
    total: { n?: number }[];
    active: { n?: number }[];
  }>("emergencies", [
    {
      $facet: {
        total: [{ $count: "n" }],
        active: [{ $match: { status: { $nin: [EmergencyStatus.RESOLVED, EmergencyStatus.CLOSED] } } }, { $count: "n" }],
      },
    },
  ]);

  const serviceRequestsAgg = await runAgg<{ pending: { n?: number }[] }>("service_requests", [
    {
      $facet: {
        pending: [{ $match: { status: { $nin: ["COMPLETED", "REJECTED", "CANCELLED"] } } }, { $count: "n" }],
      },
    },
  ]);

  const feedback = await runAgg<{ total: { n?: number }[]; avg: { avg?: number }[] }>("feedback", [
    {
      $facet: {
        total: [{ $count: "n" }],
        avg: [{ $group: { _id: null, avg: { $avg: "$rating" } } }],
      },
    },
  ]);

  const departmentsCount = await runAgg<{ total: { n?: number }[] }>("departments", [{ $count: "total" }]);

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

async function complaintsFromAggs(): Promise<{
  total: number;
  byStatus: ValueCount[];
  byPriority: ValueCount[];
  byCategory: ValueCount[];
  byDepartment: ValueCount[];
  byCitizen: ValueCount[];
}> {
  const rows = await runAgg<{ byStatus: Kvp[]; byPriority: Kvp[]; byCategory: Kvp[]; byDepartment: Kvp[]; byCitizen: Kvp[] }>("complaints", [
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
  const total = await runAgg<{ total: { n?: number }[] }>("complaints", [{ $count: "total" }]);
  return {
    total: countFrom(total[0]?.total ?? []),
    byStatus: kvToValueCount(r.byStatus),
    byPriority: kvToValueCount(r.byPriority),
    byCategory: kvToValueCount(r.byCategory),
    byDepartment: kvToValueCount(r.byDepartment),
    byCitizen: kvToValueCount(r.byCitizen),
  };
}

async function departmentsFromAggs(): Promise<DepartmentAnalytics[]> {
  const complaintStats = await runAgg<{
    departmentId: string | null;
    total: number;
    open: number;
    resolved: number;
    slaViolations: number;
    avgHours: number;
  }>("complaints", [
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

  const officerStats = await runAgg<{ _id: string | null; count: number }>("users", [
    {
      $match: { role: { $in: [UserRole.OFFICER, UserRole.DEPARTMENT_HEAD] } },
    },
    { $group: { _id: { $ifNull: ["$departmentId", null] }, count: { $sum: 1 } } },
  ]);

  const assetStats = await runAgg<{ _id: string | null; count: number }>("assets", [
    { $group: { _id: "$department", count: { $sum: 1 } } },
  ]);

  const officerByDept = new Map<string, number>();
  officerStats.forEach((o) => officerByDept.set(String(o._id ?? "null"), o.count));
  const assetByDept = new Map<string, number>();
  assetStats.forEach((o) => assetByDept.set(String(o._id ?? "null"), o.count));

  const departments = departmentRepository.departments.all();
  if (departments.length === 0) return [];

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

async function assetsFromAggs(): Promise<AssetAnalytics> {
  const rows = await runAgg<{ total: { n?: number }[]; byStatus: Kvp[]; byCategory: Kvp[]; byDepartment: Kvp[]; operational: { n?: number }[]; damaged: { n?: number }[] }>("assets", [
    {
      $facet: {
        total: [{ $count: "n" }],
        byStatus: [{ $group: { _id: { $ifNull: ["$status", "UNKNOWN"] }, count: { $sum: 1 } } }],
        byCategory: [{ $group: { _id: { $ifNull: ["$category", "OTHER"] }, count: { $sum: 1 } } }],
        byDepartment: [{ $group: { _id: { $ifNull: ["$department", "unassigned"] }, count: { $sum: 1 } } }],
        operational: [
          { $match: { status: { $in: [AssetStatus.OPERATIONAL, AssetStatus.ACTIVE] } } },
          { $count: "n" },
        ],
        damaged: [
          { $match: { status: { $in: [AssetStatus.DAMAGED, AssetStatus.OUT_OF_SERVICE, AssetStatus.INACTIVE, AssetStatus.RETIRED] } } },
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

async function slaFromAggs(): Promise<SlaAnalytics> {
  const rows = await runAgg<{ total: { n?: number }[]; violated: { n?: number }[]; atRisk: { n?: number }[]; avgHours: { avg?: number }[]; byPriority: Kvp[] }>("complaints", [
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

async function satisfactionFromAggs(): Promise<{
  total: number;
  avgRating: number;
  distribution: ValueCount[];
  recent: { complaintId: string; rating: number; comment: string | null; createdAt: string }[];
}> {
  const rows = await runAgg<{ total: { n?: number }[]; avg: { avg?: number }[]; distribution: Kvp[] }>("feedback", [
    {
      $facet: {
        total: [{ $count: "n" }],
        avg: [{ $group: { _id: null, avg: { $avg: "$rating" } } }],
        distribution: [{ $group: { _id: "$rating", count: { $sum: 1 } } }],
      },
    },
  ]);
  const recent = await runAgg<{ complaintId: string; rating: number; comment: string | null; createdAt: string }>("feedback", [
    { $sort: { createdAt: -1 } },
    { $limit: 10 },
  ]);
  const r = rows[0] ?? {};
  const total = countFrom(r.total);
  const dist = new Map<string, number>();
  (["1", "2", "3", "4", "5"] as const).forEach((k) => dist.set(k, 0));
  (r.distribution ?? []).forEach((row) => dist.set(String(row._id), Number(row.count)));
  return {
    total,
    avgRating: total === 0 ? 0 : round1(Math.max(0, r.avg?.[0]?.avg ?? 0)),
    distribution: [...dist.entries()].map(([key, count]) => ({ key, count })).sort((a, b) => a.key.localeCompare(b.key)),
    recent,
  };
}

async function timeSeriesFromAggs(days: number): Promise<TimeSeriesPoint[]> {
  const since = new Date(Date.now() - days * 86_400_000).toISOString();
  const [created, resolved] = await Promise.all([
    runAgg<{ _id: string; count: number }>("complaints", [
      { $match: { createdAt: { $gte: since } } },
      { $project: { day: { $dateToString: { format: "%Y-%m-%d", date: { $toDate: "$createdAt" } } } } },
      { $group: { _id: "$day", count: { $sum: 1 } } },
    ]),
    runAgg<{ _id: string; count: number }>("complaints", [
      { $match: { resolvedAt: { $gte: since, $ne: null } } },
      { $project: { day: { $dateToString: { format: "%Y-%m-%d", date: { $toDate: "$resolvedAt" } } } } },
      { $group: { _id: "$day", count: { $sum: 1 } } },
    ]),
  ]);
  const createdMap = new Map(created.map((r) => [r._id, r.count]));
  const resolvedMap = new Map(resolved.map((r) => [r._id, r.count]));
  const points: TimeSeriesPoint[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10);
    points.push({ date, created: createdMap.get(date) ?? 0, resolved: resolvedMap.get(date) ?? 0 });
  }
  return points;
}

// ---------------------------------------------------------------------------
// In-memory fallbacks (used when MongoDB is not connected).
// ---------------------------------------------------------------------------

function resolutionHours(createdAt: string, resolvedAt: string | null): number | null {
  if (!resolvedAt) return null;
  const diff = new Date(resolvedAt).getTime() - new Date(createdAt).getTime();
  return round1(Math.max(0, diff / 3_600_000));
}

function averageResolutionHours(complaints: { createdAt: string; resolvedAt: string | null }[]): number {
  const hours = complaints.map((c) => resolutionHours(c.createdAt, c.resolvedAt)).filter((h): h is number => h !== null);
  if (hours.length === 0) return 0;
  return round1(hours.reduce((sum, h) => sum + h, 0) / hours.length);
}

function groupCount<T>(items: T[], keyOf: (item: T) => string | null | undefined): Record<string, number> {
  const out: Record<string, number> = {};
  for (const item of items) {
    const key = keyOf(item) ?? "unknown";
    out[key] = (out[key] ?? 0) + 1;
  }
  return out;
}

function toValueCountFromRecord(record: Record<string, number>): ValueCount[] {
  return Object.entries(record)
    .sort((a, b) => b[1] - a[1])
    .map(([key, count]) => ({ key, count }));
}

async function overviewFromMemory(): Promise<AnalyticsOverview> {
  const users = authRepository.users.all();
  const complaints = complaintRepository.complaints.all();
  const assets = assetRepository.assets.all();
  const emergencies = emergencyRepository.emergencies.all();
  const feedback = complaintRepository.feedback.all();
  const serviceRequestsAll = serviceRequests.all();

  const totalCitizens = users.filter((u) => u.role === UserRole.CITIZEN).length;
  const totalOfficers = users.filter((u) => u.role === UserRole.OFFICER || u.role === UserRole.DEPARTMENT_HEAD).length;
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
  const activeEmergencies = emergencies.filter((e) => e.status !== EmergencyStatus.RESOLVED && e.status !== EmergencyStatus.CLOSED).length;
  const pendingServiceRequests = serviceRequestsAll.filter((s) => s.status !== "COMPLETED" && s.status !== "REJECTED" && s.status !== "CANCELLED").length;
  const avgCitizenRating = feedback.length === 0 ? 0 : round1(feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length);

  return {
    totalCitizens,
    totalOfficers,
    totalDepartments: departmentRepository.departments.count(),
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

async function complaintsFromMemory(): Promise<{
  total: number;
  byStatus: ValueCount[];
  byPriority: ValueCount[];
  byCategory: ValueCount[];
  byDepartment: ValueCount[];
  byCitizen: ValueCount[];
}> {
  const complaints = complaintRepository.complaints.all();
  return {
    total: complaints.length,
    byStatus: toValueCountFromRecord(groupCount(complaints, (c) => c.status)),
    byPriority: toValueCountFromRecord(groupCount(complaints, (c) => c.priority)),
    byCategory: toValueCountFromRecord(groupCount(complaints, (c) => c.category)),
    byDepartment: toValueCountFromRecord(groupCount(complaints, (c) => c.departmentName ?? c.departmentId ?? "unassigned")),
    byCitizen: toValueCountFromRecord(groupCount(complaints, (c) => c.citizenName ?? "citizen")),
  };
}

async function departmentsFromMemory(): Promise<DepartmentAnalytics[]> {
  const departments = departmentRepository.departments.all();
  const complaints = complaintRepository.complaints.all();
  const assets = assetRepository.assets.all();
  const users = authRepository.users.all();

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
        officerCount: users.filter((u) => (u.departmentId ?? null) === dept.id && (u.role === UserRole.OFFICER || u.role === UserRole.DEPARTMENT_HEAD)).length,
        assets: assets.filter((a) => a.department === dept.id || a.department === dept.name).length,
      };
    })
    .sort((a, b) => b.total - a.total);
}

async function assetsFromMemory(): Promise<AssetAnalytics> {
  const assets = assetRepository.assets.all();
  const total = assets.length;
  const byStatus = toValueCountFromRecord(groupCount(assets, (a) => a.status ?? "UNKNOWN"));
  const byCategory = toValueCountFromRecord(groupCount(assets, (a) => a.category ?? "OTHER"));
  const byDepartment = toValueCountFromRecord(groupCount(assets, (a) => a.department ?? "unassigned"));
  const operational = assets.filter((a) => a.status === AssetStatus.OPERATIONAL || a.status === AssetStatus.ACTIVE).length;
  const damaged = assets.filter((a) => a.status === AssetStatus.DAMAGED || a.status === AssetStatus.OUT_OF_SERVICE || a.status === AssetStatus.INACTIVE || a.status === AssetStatus.RETIRED).length;
  const operationalRate = total === 0 ? 0 : round1((operational / total) * 100);
  const healthScore = total === 0 ? 100 : round1(100 - (damaged / total) * 100);
  return { total, byStatus, byCategory, byDepartment, operationalRate, healthScore };
}

async function slaFromMemory(): Promise<SlaAnalytics> {
  const complaints = complaintRepository.complaints.all();
  const violated = complaints.filter((c) => c.slaBreached);
  const now = Date.now();
  let atRisk = 0;
  for (const c of complaints) {
    if (OPEN_STATUSES.includes(c.status) && c.slaDeadline && !c.slaBreached) {
      const remaining = new Date(c.slaDeadline).getTime() - now;
      if (remaining > 0 && remaining < (c.slaHours ?? 24) * 0.25 * 3_600_000) atRisk += 1;
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

async function satisfactionFromMemory(): Promise<{
  total: number;
  avgRating: number;
  distribution: ValueCount[];
  recent: { complaintId: string; rating: number; comment: string | null; createdAt: string }[];
}> {
  const feedback = complaintRepository.feedback.all().slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const total = feedback.length;
  const avgRating = total === 0 ? 0 : round1(feedback.reduce((s, f) => s + f.rating, 0) / total);
  const distribution: Record<string, number> = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };
  feedback.forEach((f) => {
    if (distribution[String(f.rating)] !== undefined) distribution[String(f.rating)] += 1;
  });
  return {
    total,
    avgRating,
    distribution: toValueCountFromRecord(distribution),
    recent: feedback.slice(0, 10).map((f) => ({ complaintId: f.complaintId, rating: f.rating, comment: f.comment, createdAt: f.createdAt })),
  };
}

async function timeSeriesFromMemory(days: number): Promise<TimeSeriesPoint[]> {
  const complaints = complaintRepository.complaints.all();
  const since = new Date(Date.now() - days * 86_400_000).getTime();
  const points = new Map<string, TimeSeriesPoint>();
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10);
    points.set(date, { date, created: 0, resolved: 0 });
  }
  for (const c of complaints) {
    const created = new Date(c.createdAt).getTime();
    if (created < since) continue;
    const date = new Date(created).toISOString().slice(0, 10);
    const point = points.get(date);
    if (point) point.created += 1;
    if (c.resolvedAt) {
      const rDate = new Date(c.resolvedAt).toISOString().slice(0, 10);
      const rPoint = points.get(rDate);
      if (rPoint) rPoint.resolved += 1;
    }
  }
  return [...points.values()];
}

// ---------------------------------------------------------------------------
// Public service (aggregation when MongoDB is available, cache in Redis).
// ---------------------------------------------------------------------------

function cached<T>(key: string, ttlSeconds: number, fn: () => Promise<T>): Promise<T> {
  return redis
    .get(key)
    .then((raw) => (raw ? (JSON.parse(raw) as T) : null))
    .then(async (hit) => {
      if (hit) return hit;
      const value = await fn();
      await redis.set(key, JSON.stringify(value), ttlSeconds);
      return value;
    });
}

export const analyticsService = {
  overview(): Promise<AnalyticsOverview> {
    return cached("analytics:overview", 60, () => (isDb() ? overviewFromAggs() : overviewFromMemory()));
  },

  complaints(): Promise<{
    total: number;
    byStatus: ValueCount[];
    byPriority: ValueCount[];
    byCategory: ValueCount[];
    byDepartment: ValueCount[];
    byCitizen: ValueCount[];
  }> {
    return cached("analytics:complaints", 60, () => (isDb() ? complaintsFromAggs() : complaintsFromMemory()));
  },

  departments(): Promise<DepartmentAnalytics[]> {
    return cached("analytics:departments", 120, () => (isDb() ? departmentsFromAggs() : departmentsFromMemory()));
  },

  assets(): Promise<AssetAnalytics> {
    return cached("analytics:assets", 120, () => (isDb() ? assetsFromAggs() : assetsFromMemory()));
  },

  sla(): Promise<SlaAnalytics> {
    return cached("analytics:sla", 60, () => (isDb() ? slaFromAggs() : slaFromMemory()));
  },

  citizenSatisfaction(): Promise<{
    total: number;
    avgRating: number;
    distribution: ValueCount[];
    recent: { complaintId: string; rating: number; comment: string | null; createdAt: string }[];
  }> {
    return cached("analytics:satisfaction", 300, () => (isDb() ? satisfactionFromAggs() : satisfactionFromMemory()));
  },

  timeSeries(days = 30): Promise<TimeSeriesPoint[]> {
    return cached(`analytics:time:${days}`, 300, () => (isDb() ? timeSeriesFromAggs(days) : timeSeriesFromMemory(days)));
  },
};

export default analyticsService;