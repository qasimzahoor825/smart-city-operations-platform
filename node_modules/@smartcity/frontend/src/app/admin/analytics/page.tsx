"use client";

import React from "react";
import Link from "next/link";
import {
  Building2,
  LayoutDashboard,
  Building,
  FileText,
  PieChart,
  BarChart3,
  Users,
  Mail,
  Settings,
  Download,
  Star,
  Trash2,
  TrendingUp,
  CheckCircle2,
  Clock,
  ThumbsUp,
} from "lucide-react";
import { toast } from "sonner";
import { complaintsApi } from "@/services/complaints";
import type { ComplaintStats } from "@/services/complaints";
import { reportsApi } from "@/services/operations";
import type { ReportAnalytics } from "@/services/operations";

const STATUS_COLORS = [
  "bg-sky-500",
  "bg-teal-500",
  "bg-amber-500",
  "bg-red-500",
];

function labelize(key: string) {
  return key.replace(/_/g, " ");
}

function prettyRating(resolvedCount: number, totalCount: number) {
  const ratio = totalCount > 0 ? resolvedCount / totalCount : 0;
  if (ratio >= 0.8) return { label: "Excellent", cls: "bg-emerald-100 text-emerald-800" };
  if (ratio >= 0.6) return { label: "Good", cls: "bg-teal-100 text-teal-800" };
  if (ratio >= 0.4) return { label: "Average", cls: "bg-amber-100 text-amber-800" };
  return { label: "Poor", cls: "bg-red-100 text-red-800" };
}

function fmt(n: number) {
  return (n || 0).toLocaleString("en-US");
}

export default function CityOperationsAnalyticsPage() {
  const [activeTab, setActiveTab] = React.useState("Dashboard");
  const [dateRange, setDateRange] = React.useState("Last 30 Days");
  const [deptFilter, setDeptFilter] = React.useState("");
  const [volumeToggle, setVolumeToggle] = React.useState<"Daily" | "Weekly">("Daily");
  const [analytics, setAnalytics] = React.useState<ReportAnalytics | null>(null);
  const [stats, setStats] = React.useState<ComplaintStats | null>(null);

  const refresh = React.useCallback(async () => {
    try {
      const [a, s] = await Promise.all([reportsApi.analytics(), complaintsApi.stats()]);
      setAnalytics(a);
      setStats(s);
    } catch {
      toast.error("Failed to load analytics data");
    }
  }, []);

  React.useEffect(() => {
    refresh();
    const id = setInterval(refresh, 15000);
    return () => clearInterval(id);
  }, [refresh]);

  const totalComplaints = stats?.total ?? analytics?.totalComplaints ?? 0;
  const resolved = stats?.resolved ?? analytics?.resolvedComplaints ?? 0;
  const open = stats?.open ?? 0;
  const resolutionRate = analytics?.resolutionRate ?? 0;
  const avgDays = ((analytics?.avgResolutionHours ?? 0) / 24).toFixed(1);
  const resolvedShare = totalComplaints > 0 ? ((resolved / totalComplaints) * 100).toFixed(1) : "0.0";

  const byStatusEntries = Object.entries(stats?.byStatus ?? {}).sort((a, b) => b[1] - a[1]);
  const byCategoryEntries = Object.entries(stats?.byCategory ?? {}).sort((a, b) => b[1] - a[1]);

  const analyticsDeptRows = analytics?.byDepartment ?? [];
  const deptOptions = Array.from(
    new Set(analyticsDeptRows.map((d) => d.departmentName ?? "Unassigned")),
  );

  const deptRows = analyticsDeptRows.map((d) => {
    const rating = prettyRating(d.resolved ?? 0, d.total ?? 0);
    return {
      id: d.departmentId ?? d.departmentName ?? "",
      name: d.departmentName ?? "Unassigned",
      total: d.total ?? 0,
      resolved: d.resolved ?? 0,
      days: ((d.avgResolutionHours ?? 0) / 24).toFixed(1),
      rating,
    };
  });

  const filteredDeptRows = deptFilter
    ? deptRows.filter((r) => r.name.toLowerCase() === deptFilter.toLowerCase())
    : deptRows;

  const categoryBars = byCategoryEntries.slice(0, 6);
  const categoryMax = Math.max(1, ...categoryBars.map(([, v]) => v));

  const deptChartRows = filteredDeptRows.slice(0, 5);
  const deptChartMax = Math.max(1, ...deptChartRows.map((r) => r.total));

  const topCategory = byCategoryEntries[0];
  const topCategoryPct = topCategory && totalComplaints > 0
    ? Math.round((topCategory[1] / totalComplaints) * 100)
    : 0;

  const handleExportCSV = async () => {
    try {
      const res = await complaintsApi.list({ limit: 500 });
      const rows = res.data;
      const header = ["ID", "Title", "Category", "Status", "Priority", "Department", "Created At"];
      const esc = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;
      const lines = [header.join(",")];
      rows.forEach((c) => {
        lines.push(
          [c.id, c.title, c.category, c.status, c.priority, c.departmentName ?? "", c.createdAt]
            .map(esc)
            .join(","),
        );
      });
      const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "city-analytics-report.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Downloading City Operations Analytics Report (CSV)");
    } catch {
      toast.error("Failed to export CSV");
    }
  };

  const handleExportPDF = () => {
    try {
      window.print();
      toast.success("Generating Executive Analytics Summary (PDF)");
    } catch {
      toast.error("Failed to export PDF");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex">
      
      {/* Left Light Sidebar */}
      <aside className="w-64 bg-white text-slate-900 shrink-0 hidden lg:flex flex-col justify-between p-4 border-r border-slate-200">
        <div className="space-y-6">
          
          <Link href="/" className="flex items-center gap-3 px-2 py-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-teal-500 to-sky-600 text-white shadow-md shadow-teal-500/30">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-slate-900 block leading-none">
                Smart City
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Platform
              </span>
            </div>
          </Link>

          <nav className="space-y-1">
            {[
              { label: "Dashboard", icon: LayoutDashboard, href: "/admin/analytics" },
              { label: "Department", icon: Building, href: "/admin/departments" },
              { label: "Complaints", icon: FileText, href: "/admin/complaints" },
              { label: "Complaint Category", icon: PieChart, href: "/admin/categories" },
              { label: "Analytics", icon: BarChart3, href: "/admin/analytics" },
              { label: "Profiles", icon: Users, href: "/admin/users" },
              { label: "Contact", icon: Mail, href: "/admin/contact" },
              { label: "Custom Settings", icon: Settings, href: "/admin/settings" },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.label;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setActiveTab(item.label)}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-teal-50 text-teal-800 font-bold shadow-sm border-l-4 border-teal-500"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon className="w-4 h-4 text-teal-600" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-200 px-2 text-xs text-slate-500">
          Super Admin Intelligence Center
        </div>
      </aside>

      {/* Main Body Column matching Screenshot 10 */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header Title */}
        <header className="bg-white border-b border-slate-200 px-6 py-4">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            City Operations Analytics
          </h1>
        </header>

        {/* Content Area */}
        <main className="p-6 space-y-6 flex-1 overflow-y-auto">
          
          {/* Top Filter Bar matching Screenshot 10 */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="font-semibold text-slate-600">Date Range</span>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
              >
                <option value="Last 30 Days">Last 30 Days</option>
                <option value="Last 7 Days">Last 7 Days</option>
                <option value="This Quarter">This Quarter</option>
                <option value="This Year">This Year</option>
              </select>

              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
              >
                <option value="">Department</option>
                {deptOptions.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>

              <select className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 font-medium text-slate-900 focus:outline-none">
                <option value="">Complaint Category</option>
                {byCategoryEntries.slice(0, 10).map(([name]) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>

              <select className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 font-medium text-slate-900 focus:outline-none">
                <option value="">Status</option>
                {byStatusEntries.map(([status]) => (
                  <option key={status} value={status}>{labelize(status)}</option>
                ))}
              </select>
            </div>

            {/* Export Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCSV}
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={handleExportPDF}
                className="px-4 py-2 rounded-xl smart-btn-navy text-xs font-semibold shadow flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export PDF</span>
              </button>
            </div>
          </div>

          {/* Top 5 KPI Metric Cards Row matching Screenshot 10 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            
            {/* Total Complaints */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600"><Trash2 className="w-4 h-4" /></div>
                <span className="text-xs text-slate-400 font-medium">Total Complaints</span>
              </div>
              <div className="text-2xl font-black text-slate-900">{fmt(totalComplaints)}</div>
              <div className="h-6 w-full bg-blue-50/50 rounded flex items-end">
                <svg className="w-full h-full" viewBox="0 0 100 20">
                  <path d="M0,15 L20,8 L40,12 L60,5 L80,10 L100,2" fill="none" stroke="#2563eb" strokeWidth="2" />
                </svg>
              </div>
            </div>

            {/* Resolved Complaints */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600"><CheckCircle2 className="w-4 h-4" /></div>
                <span className="text-xs text-slate-400 font-medium">Resolved</span>
              </div>
              <div className="text-2xl font-black text-slate-900">{fmt(resolved)}</div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
                {resolvedShare}% resolved
              </span>
            </div>

            {/* Average Resolution Time */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-teal-50 text-teal-600"><Clock className="w-4 h-4" /></div>
                <span className="text-xs text-slate-400 font-medium">Avg Resolution Time</span>
              </div>
              <div className="text-2xl font-black text-slate-900">{avgDays} Days</div>
              <div className="h-6 w-full bg-teal-50/50 rounded flex items-end">
                <svg className="w-full h-full" viewBox="0 0 100 20">
                  <path d="M0,18 L30,14 L60,10 L100,2" fill="none" stroke="#0d9488" strokeWidth="2" />
                </svg>
              </div>
            </div>

            {/* Citizen Satisfaction */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-600"><ThumbsUp className="w-4 h-4" /></div>
                <span className="text-xs text-slate-400 font-medium">Satisfaction</span>
              </div>
              <div className="text-2xl font-black text-slate-900">{resolutionRate.toFixed(1)}%</div>
              <div className="flex items-center text-amber-400 gap-0.5">
                {[1, 2, 3, 4].map((s) => <Star key={s} className="w-3 h-3 fill-amber-400" />)}
                <Star className="w-3 h-3 text-amber-300" />
              </div>
            </div>

            {/* Active Cases */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-red-50 text-red-600"><TrendingUp className="w-4 h-4" /></div>
                <span className="text-xs text-slate-400 font-medium">Active Cases</span>
              </div>
              <div className="text-2xl font-black text-slate-900">{fmt(open)}</div>
              <div className="h-6 w-full bg-red-50/50 rounded flex items-end">
                <svg className="w-full h-full" viewBox="0 0 100 20">
                  <path d="M0,10 L30,15 L60,8 L100,12" fill="none" stroke="#dc2626" strokeWidth="2" />
                </svg>
              </div>
            </div>

          </div>

          {/* Middle Charts Grid matching Screenshot 10 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Chart 1: Complaint Volume Over Time */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900">Complaint Volume Over Time</h3>
                <div className="flex items-center gap-1 text-[10px]">
                  <button
                    onClick={() => setVolumeToggle("Daily")}
                    className={`px-2 py-0.5 rounded ${volumeToggle === "Daily" ? "bg-slate-900 text-white" : "text-slate-500"}`}
                  >
                    Daily
                  </button>
                  <button
                    onClick={() => setVolumeToggle("Weekly")}
                    className={`px-2 py-0.5 rounded ${volumeToggle === "Weekly" ? "bg-slate-900 text-white" : "text-slate-500"}`}
                  >
                    Weekly
                  </button>
                </div>
              </div>

              {/* Bar + Line Visual Canvas */}
              <div className="h-44 bg-slate-50 rounded-xl p-3 flex items-end justify-between gap-1.5 border border-slate-100 relative">
                <svg className="absolute inset-0 w-full h-full p-2" preserveAspectRatio="none" viewBox="0 0 100 50">
                  <path d="M0,35 L20,15 L40,25 L60,10 L80,20 L100,30" fill="none" stroke="#0d9488" strokeWidth="2" />
                </svg>
                {categoryBars.map(([name, count]) => (
                  <div
                    key={name}
                    className="w-full bg-slate-900 rounded-t"
                    style={{ height: `${(count / categoryMax) * 100}%` }}
                  />
                ))}
              </div>
              <div className="flex justify-between text-[9px] text-slate-400">
                {categoryBars.map(([name]) => (
                  <span key={name}>{name.slice(0, 6)}</span>
                ))}
              </div>
            </div>

            {/* Chart 2: Resolution Time Trend */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900">Resolution Time Trend</h3>
                <span className="text-[10px] text-slate-400">Ave / Day / Week</span>
              </div>

              <div className="h-44 bg-slate-50 rounded-xl p-3 flex items-end border border-slate-100 relative">
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 50">
                  <path d="M0,25 L15,35 L30,20 L45,28 L60,15 L75,32 L90,20 L100,25" fill="none" stroke="#0d9488" strokeWidth="2" />
                </svg>
              </div>
              <div className="flex justify-between text-[9px] text-slate-400">
                <span>Day 1</span><span>Day 2</span><span>Day 3</span><span>Week</span>
              </div>
            </div>

            {/* Chart 3: Complaints by Department */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-900">Complaints by Department</h3>
              <div className="h-44 bg-slate-50 rounded-xl p-3 flex items-end justify-between gap-3 border border-slate-100">
                {deptChartRows.map((r) => (
                  <div
                    key={r.id || r.name}
className="w-full bg-gradient-to-t from-teal-600 to-teal-400 rounded-t"
                  style={{ height: `${(r.total / deptChartMax) * 100}%` }}
                  />
                ))}
              </div>
              <div className="flex justify-between text-[9px] text-slate-400">
                {deptChartRows.map((r) => (
                  <span key={r.id || r.name}>{r.name.slice(0, 9)}</span>
                ))}
              </div>
            </div>

          </div>

          {/* Bottom Grid: Status Donut + Dept Performance Table + Category Donut matching Screenshot 10 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Resolution Status Distribution (Donut) */}
            <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
              <h3 className="text-xs font-bold text-slate-900">Resolution Status Distribution</h3>

              <div className="relative aspect-square max-w-[160px] mx-auto rounded-full border-8 border-teal-600 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-2xl font-black text-slate-900">{resolutionRate.toFixed(0)}%</span>
                  <span className="text-[10px] text-slate-400 block">Resolved</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px]">
                {byStatusEntries.slice(0, 4).map(([status, count], i) => {
                  const pct = totalComplaints > 0 ? ((count / totalComplaints) * 100).toFixed(0) : "0";
                  return (
                    <div key={status} className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${STATUS_COLORS[i % STATUS_COLORS.length]}`} />
                      {labelize(status)} ({pct}%)
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Department Performance Table */}
            <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-900">Department Performance</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="text-[11px] bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold">
                    <tr>
                      <th className="p-2.5">Department</th>
                      <th className="p-2.5">Complaints</th>
                      <th className="p-2.5">Resolved</th>
                      <th className="p-2.5">Average Resolution Time</th>
                      <th className="p-2.5 text-right">Performance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredDeptRows.map((row) => (
                      <tr key={row.id || row.name} className="hover:bg-slate-50">
                        <td className="p-2.5 font-bold text-slate-900">{row.name}</td>
                        <td className="p-2.5 text-slate-700">{fmt(row.total)}</td>
                        <td className="p-2.5 text-slate-700">{fmt(row.resolved)}</td>
                        <td className="p-2.5 text-slate-500">{row.days} Days</td>
                        <td className="p-2.5 text-right">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${row.rating.cls}`}>
                            {row.rating.label}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Complaints by Category (Donut) */}
            <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
              <h3 className="text-xs font-bold text-slate-900">Complaints by Category</h3>

              <div className="relative aspect-square max-w-[160px] mx-auto rounded-full border-8 border-slate-900 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-xl font-extrabold text-slate-900">
                    {topCategory ? topCategory[0].slice(0, 10) : "—"}
                  </span>
                  <span className="text-[10px] text-slate-400 block">{topCategoryPct}% Volume</span>
                </div>
              </div>

              <div className="space-y-1 text-[10px] text-slate-600">
                {byCategoryEntries.slice(0, 5).map(([name, count]) => {
                  const pct = totalComplaints > 0 ? Math.round((count / totalComplaints) * 100) : 0;
                  return (
                    <div key={name} className="flex justify-between">
                      <span>{name}</span>
                      <span className="font-bold">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </main>
      </div>

    </div>
  );
}