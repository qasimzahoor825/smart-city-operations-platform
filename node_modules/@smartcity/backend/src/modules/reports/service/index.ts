import { UserRole } from "@smartcity/common";
import { authRepository } from "../../auth/repository";
import { assetRepository } from "../../assets/repository";
import { departmentRepository } from "../../departments/repository";
import { complaintRepository } from "../../complaints/repository";
import { reportRepository } from "../repository";
import type {
  DepartmentBreakdown,
  ReportAnalytics,
  ReportExport,
  ReportOverview,
} from "../dto";

const OPEN_STATUSES = ["SUBMITTED", "ASSIGNED", "IN_PROGRESS"];
const RESOLVED_STATUSES = ["RESOLVED", "CLOSED"];

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function resolutionHours(createdAt: string, resolvedAt: string | null): number | null {
  if (!resolvedAt) return null;
  const diff = new Date(resolvedAt).getTime() - new Date(createdAt).getTime();
  return round1(Math.max(0, diff / 3_600_000));
}

function averageHours(pairs: { createdAt: string; resolvedAt: string | null }[]): number {
  const hours = pairs
    .map((p) => resolutionHours(p.createdAt, p.resolvedAt))
    .filter((h): h is number => h !== null);
  if (hours.length === 0) return 0;
  return round1(hours.reduce((sum, h) => sum + h, 0) / hours.length);
}

function csvEscape(value: string | number): string {
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function csvSection(title: string, headers: string[], rows: (string | number)[][]): string {
  const lines = [title, headers.map(csvEscape).join(","), ...rows.map((row) => row.map(csvEscape).join(","))];
  return lines.join("\n");
}

export const reportService = {
  async overview(): Promise<ReportOverview> {
    const users = authRepository.users.all();
    const officers = users.filter(
      (u) => u.role === UserRole.OFFICER || u.role === UserRole.DEPARTMENT_HEAD,
    ).length;

    return {
      departments: departmentRepository.departments.count(),
      officers,
      assets: assetRepository.assets.count(),
      complaints: complaintRepository.complaints.count(),
      emergencies: reportRepository.emergencies.count(),
      appointments: reportRepository.appointments.count(),
      generatedAt: new Date().toISOString(),
    };
  },

  async analytics(): Promise<ReportAnalytics> {
    const complaints = complaintRepository.complaints.all();
    const total = complaints.length;
    const resolvedComplaints = complaints.filter((c) => (RESOLVED_STATUSES as string[]).includes(c.status));
    const resolutionRate = total === 0 ? 0 : round1((resolvedComplaints.length / total) * 100);
    const avgResolutionHours = averageHours(
      resolvedComplaints.map((c) => ({ createdAt: c.createdAt, resolvedAt: c.resolvedAt })),
    );
    const slaBreachCount = complaints.filter((c) => c.slaBreached).length;

    const groups = new Map<string, DepartmentBreakdown>();
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
      if ((OPEN_STATUSES as string[]).includes(c.status)) entry.open += 1;
      if ((RESOLVED_STATUSES as string[]).includes(c.status)) entry.resolved += 1;
      groups.set(key, entry);
    });

    const byDepartment: DepartmentBreakdown[] = [];
    groups.forEach((entry, key) => {
      const deptComplaints = complaints.filter((c) => (c.departmentId ?? "unassigned") === key);
      byDepartment.push({
        ...entry,
        avgResolutionHours: averageHours(
          deptComplaints.map((c) => ({ createdAt: c.createdAt, resolvedAt: c.resolvedAt })),
        ),
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

  async exportReport(format: "json" | "csv"): Promise<ReportExport> {
    const overview = await this.overview();
    const analytics = await this.analytics();
    const generatedAt = new Date().toISOString();

    if (format === "csv") {
      const overviewRows: (string | number)[][] = [
        ["departments", overview.departments],
        ["officers", overview.officers],
        ["assets", overview.assets],
        ["complaints", overview.complaints],
        ["emergencies", overview.emergencies],
        ["appointments", overview.appointments],
      ];
      const analyticsRows: (string | number)[][] = [
        ["totalComplaints", analytics.totalComplaints],
        ["resolvedComplaints", analytics.resolvedComplaints],
        ["resolutionRate", analytics.resolutionRate],
        ["avgResolutionHours", analytics.avgResolutionHours],
        ["slaBreachCount", analytics.slaBreachCount],
      ];
      const departmentRows: (string | number)[][] = analytics.byDepartment.map((d) => [
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
        csvSection(
          "BY_DEPARTMENT",
          ["departmentId", "departmentName", "total", "open", "resolved", "avgResolutionHours"],
          departmentRows,
        ),
      ].join("\n\n");
      return { format, generatedAt, data: csv };
    }

    return { format, generatedAt, data: { overview, analytics } };
  },
};

export default reportService;