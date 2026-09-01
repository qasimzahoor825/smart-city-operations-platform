"use client";

import React from "react";
import Link from "next/link";
import {
  BarChart3,
  Bell,
  BriefcaseBusiness,
  Building2,
  ChevronDown,
  CircleGauge,
  FileClock,
  GitBranch,
  Globe2,
  Home,
  Landmark,
  MessageSquare,
  Search,
  Settings,
  ShieldCheck,
  Siren,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { usersApi, departmentsApi, assetsApi, emergenciesApi, notificationsApi, reportsApi, type AssetStats } from "@/services/operations";
import { complaintsApi } from "@/services/complaints";
import { analyticsApi } from "@/services/analytics";
import { iotApi } from "@/services/gis";
import type { AnomalyOverview, AppNotification, ForecastResult, Officer } from "@/types";

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: Home },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Roles & Permissions", href: "/admin/roles", icon: ShieldCheck },
  { label: "Departments", href: "/admin/departments", icon: Landmark },
  { label: "Complaints", href: "/admin/complaints", icon: MessageSquare },
  { label: "Assets", href: "/admin/assets", icon: BriefcaseBusiness },
  { label: "Emergency", href: "/admin/emergency", icon: Siren },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "GIS Portal", href: "/admin/gis", icon: Globe2 },
  { label: "Workflows", href: "/admin/reports", icon: GitBranch },
  { label: "Notifications", href: "/department/notifications", icon: Bell },
  { label: "Audit Logs", href: "/admin/reports", icon: FileClock },
  { label: "System Settings", href: "/admin/settings", icon: Settings },
];

const STATUS_COLORS: Record<string, string> = {
  SUBMITTED: "#0f172a",
  ASSIGNED: "#0e7490",
  IN_PROGRESS: "#0d9488",
  RESOLVED: "#22c55e",
  CLOSED: "#facc15",
  REJECTED: "#ef4444",
};

const DONUT_COLORS = ["#0f172a", "#0e7490", "#0d9488", "#22c55e", "#facc15", "#ef4444"];

const formatNumber = (value: number): string => value.toLocaleString("en-US");

export default function AdminDashboardPage() {
  const [range, setRange] = React.useState("Last 30 days");
  const [loading, setLoading] = React.useState(true);
  const firstLoad = React.useRef(true);
  const [kpis, setKpis] = React.useState({ citizens: 0, officers: 0, departments: 0, complaints: 0, assets: 0, emergenciesActive: 0 });
  const [complaintStats, setComplaintStats] = React.useState<Record<string, number>>({});
  const [resolutionRate, setResolutionRate] = React.useState(0);
  const [deptPerformance, setDeptPerformance] = React.useState<{ name: string; total: number; open: number; resolved: number }[]>([]);
  const [activityRows, setActivityRows] = React.useState<string[][]>([]);
  const [recentRows, setRecentRows] = React.useState<string[][]>([]);
  const [forecast, setForecast] = React.useState<ForecastResult | null>(null);
  const [anomalyOverview, setAnomalyOverview] = React.useState<AnomalyOverview | null>(null);
  const [healthRows, setHealthRows] = React.useState<string[][]>([
    ["API Status", "Loading…", "bg-slate-400"],
    ["Database Status", "Loading…", "bg-slate-400"],
    ["Notification Service", "Loading…", "bg-slate-400"],
    ["GIS Service", "Loading…", "bg-slate-400"],
    ["AI Services", "Loading…", "bg-slate-400"],
  ]);

  const refresh = React.useCallback(async () => {
    if (firstLoad.current) setLoading(true);
    const healthMap: Record<string, { ok: boolean }> = {
      api: { ok: false },
      database: { ok: false },
      notifications: { ok: false },
      gis: { ok: false },
      ai: { ok: false },
    };

    const fetchUsers = usersApi
      .list({ limit: 200 })
      .then((res) => {
        healthMap.api.ok = true;
        return res;
      })
      .catch(() => null);
    const fetchDepartments = departmentsApi
      .list()
      .then((res) => {
        healthMap.database.ok = true;
        return res;
      })
      .catch(() => null);
    const fetchComplaints = complaintsApi
      .list({ limit: 100 })
      .then((res) => {
        healthMap.api.ok = true;
        return res;
      })
      .catch(() => null);
    const fetchComplaintStats = complaintsApi
      .stats()
      .then((stats) => {
        healthMap.database.ok = true;
        return stats;
      })
      .catch(() => null);
    const fetchAssets = assetsApi
      .stats()
      .then((res) => {
        healthMap.gis.ok = true;
        return res;
      })
      .catch(() => null);
    const fetchEmergencies = emergenciesApi
      .list()
      .then((res) => {
        healthMap.gis.ok = true;
        return res;
      })
      .catch(() => null);
    const fetchNotifications = notificationsApi
      .list({})
      .then((res) => {
        healthMap.notifications.ok = true;
        return res;
      })
      .catch(() => null);
    const fetchOverview = reportsApi
      .overview()
      .then((res) => {
        healthMap.database.ok = true;
        return res;
      })
      .catch(() => null);
    const fetchAnalytics = reportsApi
      .analytics()
      .then((res) => {
        healthMap.database.ok = true;
        return res;
      })
      .catch(() => null);
    const fetchForecast = analyticsApi
      .forecast(14)
      .then((res) => {
        if (res) healthMap.ai.ok = true;
        return res;
      })
      .catch(() => null);
    const fetchAnomalies = iotApi
      .anomalyOverview()
      .then((res) => {
        if (res) healthMap.ai.ok = true;
        return res;
      })
      .catch(() => null);

    try {
      const [usersRes, deptRes, complaintsRes, complaintStatsRes, assetsRes, emergencies, notifications, overviewRes, analyticsRes, forecastRes, anomaliesRes] = await Promise.all([
        fetchUsers,
        fetchDepartments,
        fetchComplaints,
        fetchComplaintStats,
        fetchAssets,
        fetchEmergencies,
        fetchNotifications,
        fetchOverview,
        fetchAnalytics,
        fetchForecast,
        fetchAnomalies,
      ]);

      const citizens = usersRes?.data?.filter((u: Officer) => u.role === "CITIZEN").length ?? 0;
      const officers = usersRes?.data?.filter((u: Officer) => u.role === "OFFICER" || u.role === "DEPARTMENT_HEAD").length ?? 0;
      const complaintTotal = complaintsRes?.total ?? overviewRes?.complaints ?? 0;
      setKpis({
        citizens,
        officers,
        departments: deptRes?.length ?? overviewRes?.departments ?? 0,
        complaints: complaintTotal,
        assets: (assetsRes as AssetStats | null)?.total ?? overviewRes?.assets ?? 0,
        emergenciesActive: (emergencies ?? []).length,
      });

      setComplaintStats((complaintStatsRes?.byStatus ?? {}) as Record<string, number>);
      setResolutionRate(analyticsRes?.resolutionRate ?? 0);

      const deptBreakdown =
        analyticsRes?.byDepartment?.map((d) => ({
          name: d.departmentName ?? "Unassigned",
          total: d.total,
          open: d.open,
          resolved: d.resolved,
        })) ?? [];
      setDeptPerformance(deptBreakdown);
      setForecast(forecastRes ?? null);
      setAnomalyOverview(anomaliesRes ?? null);

      const notificationRows: string[][] = (notifications ?? []).map((n: AppNotification) => [
        new Date(n.createdAt).toLocaleString(),
        `${n.title}: ${n.message}`,
      ]);
      setActivityRows(notificationRows.length > 0 ? notificationRows : (complaintsRes?.data ?? []).map((c) => [c.createdAt ? new Date(c.createdAt).toLocaleString() : "", c.title]));

      const recent: string[][] = (complaintsRes?.data ?? []).slice(0, 5).map((c) => [
        c.createdAt ? new Date(c.createdAt).toLocaleString() : "",
        c.departmentName ?? "System",
        c.status,
        c.title,
      ]);
      setRecentRows(recent);

      const healthBuild: string[][] = [
        ["API Status", healthMap.api.ok ? "Green" : "Degraded", healthMap.api.ok ? "bg-emerald-500" : "bg-red-500"],
        ["Database Status", healthMap.database.ok ? "Green" : "Degraded", healthMap.database.ok ? "bg-emerald-500" : "bg-yellow-400"],
        ["Notification Service", healthMap.notifications.ok ? "Green" : "Degraded", healthMap.notifications.ok ? "bg-emerald-500" : "bg-lime-500"],
        ["GIS Service", healthMap.gis.ok ? "Green" : "Degraded", healthMap.gis.ok ? "bg-emerald-500" : "bg-red-500"],
        ["AI Services", healthMap.ai.ok ? "Green" : "Degraded", healthMap.ai.ok ? "bg-emerald-500" : "bg-yellow-400"],
      ];
      setHealthRows(healthBuild);
      if (!healthMap.api.ok && !healthMap.database.ok && !healthMap.notifications.ok && !healthMap.gis.ok && !healthMap.ai.ok) {
        toast.error("Dashboard data unavailable. Check the API server.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Could not load dashboard data");
    } finally {
      firstLoad.current = false;
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), 30000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-200 via-slate-100 to-teal-50 font-sans text-slate-950">
      <AdminSidebar active="Dashboard" />
      <div className="min-w-0 flex-1">
        <header className="flex h-14 items-center justify-end gap-5 border-b border-slate-200 bg-white px-5">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-200 text-xs">SA</span>
            System Admin
            <ChevronDown className="h-4 w-4" />
          </div>
          <div className="relative w-56">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input className="h-9 w-full rounded-lg border border-slate-300 bg-slate-50 pl-9 pr-3 text-sm outline-none" placeholder="Universal Search" />
          </div>
        </header>

        <main className="space-y-4 p-5">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black">Super Admin Dashboard</h1>
            <select className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold" defaultValue="High performance KPI">
              <option>High performance KPI</option>
              <option>Incident KPI</option>
              <option>Department KPI</option>
            </select>
          </div>

          {loading ? (
            <p className="py-10 text-sm font-semibold text-slate-400">Loading dashboard data…</p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
                <Kpi icon={<Users className="h-5 w-5" />} label="Total Citizens" value={formatNumber(kpis.citizens)} tone="teal" />
                <Kpi icon={<Users className="h-5 w-5" />} label="Government Officers" value={formatNumber(kpis.officers)} tone="blue" />
                <Kpi icon={<Building2 className="h-5 w-5" />} label="Departments" value={formatNumber(kpis.departments)} tone="sky" />
                <Kpi icon={<MessageSquare className="h-5 w-5" />} label="Active Complaints" value={formatNumber(kpis.complaints)} tone="red" />
                <Kpi icon={<Landmark className="h-5 w-5" />} label="Public Assets" value={formatNumber(kpis.assets)} tone="emerald" />
                <Kpi icon={<Siren className="h-5 w-5" />} label="Emergency Cases" value={`${formatNumber(kpis.emergenciesActive)} active`} tone="rose" />
              </div>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.4fr_.45fr_.45fr]">
                <Panel title="City-wide Activity Chart" action={<RangeSelect value={range} onChange={setRange} />}>
                  <LineChart data={deptPerformance} />
                </Panel>
                <Panel title="Complaint Status Distribution">
                  <Donut data={complaintStats} resolutionRate={resolutionRate} />
                </Panel>
                <Panel title="System Health">
                  <div className="space-y-3 pt-2 text-sm">
                    {healthRows.map(([label, status, dot]) => (
                      <div key={label} className="flex items-center justify-between">
                        <span>{label}</span>
                        <span className="flex items-center gap-2 font-semibold text-emerald-700">
                          {status} <span className={`h-3 w-3 rounded-full ${dot}`} />
                        </span>
                      </div>
                    ))}
                  </div>
                </Panel>
              </div>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_.9fr]">
                <Panel title="Department Performance Chart" action={<RangeSelect value={range} onChange={setRange} />}>
                  {deptPerformance.length === 0 ? (
                    <p className="py-10 text-xs font-semibold text-slate-400">No department data available.</p>
                  ) : (
                    <BarPairChart data={deptPerformance} />
                  )}
                </Panel>
                <Panel title="System Activity Timeline">
                  {activityRows.length === 0 ? (
                    <p className="py-10 text-xs font-semibold text-slate-400">No recent activity.</p>
                  ) : (
                    <SimpleTable headers={["Time", "Log"]} rows={activityRows} />
                  )}
                </Panel>
              </div>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_.9fr]">
                <Panel title={`AI Complaint Forecast${forecast ? ` · next ${forecast.days} days` : ""}`} action={forecast ? <span className="rounded bg-teal-50 px-2 py-0.5 text-[10px] font-black text-teal-700 uppercase">{forecast.trend}</span> : undefined}>
                  <ForecastChart result={forecast} />
                </Panel>
                <Panel title={`IoT Anomaly Feed${anomalyOverview ? ` (${anomalyOverview.total})` : ""}`}>
                  <AnomalyFeed overview={anomalyOverview} />
                </Panel>
              </div>

              <Panel title="Recent Admin Activity">
                {recentRows.length === 0 ? (
                  <p className="py-10 text-xs font-semibold text-slate-400">No recent admin activity.</p>
                ) : (
                  <SimpleTable headers={["Timestamp", "Department", "Action", "Target"]} rows={recentRows} />
                )}
              </Panel>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function AdminSidebar({ active }: { active: string }) {
  return (
    <aside className="hidden min-h-screen w-52 shrink-0 border-r border-slate-800 bg-gradient-to-b from-slate-900 via-slate-800 to-teal-950 p-3 text-white lg:block">
      <Link href="/" className="mb-5 flex items-center gap-3 px-2 py-2">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-tr from-teal-400 to-sky-500 text-white shadow-md shadow-teal-500/40">
          <CircleGauge className="h-5 w-5" />
        </span>
        <span className="text-sm font-black leading-tight text-white">Smart City<br />Operations Platform</span>
      </Link>
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const selected = item.label === active;
          return (
            <Link key={item.label} href={item.href} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold ${selected ? "bg-teal-500 text-white shadow-lg shadow-teal-500/30 border-l-4 border-sky-400" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}>
              <Icon className={`h-4 w-4 ${selected ? "text-white" : "text-slate-400"}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

function Kpi({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: string }) {
  const tones: Record<string, string> = {
    teal: "bg-gradient-to-br from-teal-500 to-teal-700 shadow-teal-500/25",
    blue: "bg-gradient-to-br from-blue-500 to-blue-700 shadow-blue-500/25",
    sky: "bg-gradient-to-br from-sky-500 to-sky-700 shadow-sky-500/25",
    red: "bg-gradient-to-br from-rose-500 to-rose-700 shadow-rose-500/25",
    emerald: "bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-emerald-500/25",
    rose: "bg-gradient-to-br from-purple-500 to-purple-700 shadow-purple-500/25",
  };
  return (
    <div className={`flex items-center gap-3 rounded-lg p-4 shadow-lg ${tones[tone]}`}>
      <span className="grid h-10 w-10 place-items-center rounded-lg bg-white/20 text-white">{icon}</span>
      <div>
        <p className="text-xs font-semibold text-white/80">{label}</p>
        <p className="text-xl font-black text-white">{value}</p>
      </div>
    </div>
  );
}

function Panel({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <h2 className="text-sm font-black">{title}</h2>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function RangeSelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs">
      <option>Last 30 days</option>
      <option>Last 7 days</option>
      <option>This year</option>
    </select>
  );
}

function LineChart({ data }: { data: { name: string; total: number }[] }) {
  const points = data.slice(0, 8);
  const max = Math.max(1, ...points.map((d) => d.total));
  const xStep = points.length > 1 ? 620 / (points.length - 1) : 0;
  const yValue = (v: number) => 165 - (v / max) * 130;
  const poly = points.map((d, i) => `${i * xStep},${yValue(d.total)}`).join(" ");
  const polyOpen = points.map((d, i) => `${i * xStep},${yValue(Math.max(0, (d.total ?? 0) * 0.6))}`).join(" ");
  return (
    <div className="h-44">
      <svg viewBox="0 0 620 190" className="h-full w-full">
        {[40, 80, 120, 160].map((y) => <line key={y} x1="0" x2="620" y1={y} y2={y} stroke="#e2e8f0" />)}
        {points.length === 0 ? (
          <text x="310" y="95" textAnchor="middle" className="fill-slate-400 text-xs">No activity data</text>
        ) : (
          <>
            <polyline points={poly} fill="none" stroke="#0284c7" strokeWidth="3" />
            <polyline points={polyOpen} fill="none" stroke="#14b8a6" strokeWidth="3" />
          </>
        )}
      </svg>
    </div>
  );
}

function BarPairChart({ data }: { data: { name: string; total: number; resolved: number }[] }) {
  const rows = data.slice(0, 8);
  const max = Math.max(1, ...rows.map((d) => d.total));
  return (
    <div className="flex h-44 items-end justify-between gap-4 px-3">
      {rows.length === 0 && <p className="w-full text-center text-xs font-semibold text-slate-400">No department data.</p>}
      {rows.map((d, index) => (
        <div key={index} className="flex flex-1 items-end justify-center gap-1" title={d.name}>
          <div className="w-4 rounded-t bg-gradient-to-t from-sky-600 to-sky-400" style={{ height: `${Math.max(4, (d.total / max) * 100)}%` }} />
          <div className="w-4 rounded-t bg-gradient-to-t from-teal-600 to-teal-400" style={{ height: `${Math.max(4, (d.resolved / max) * 100)}%` }} />
        </div>
      ))}
    </div>
  );
}

function Donut({ data, resolutionRate }: { data: Record<string, number>; resolutionRate: number }) {
  const entries = Object.entries(data);
  const total = entries.reduce((sum, [, value]) => sum + (value ?? 0), 0);
  if (entries.length === 0 || total === 0) {
    return (
      <div className="flex h-28 items-center justify-center text-xs font-semibold text-slate-400">
        No complaint data
      </div>
    );
  }
  let acc = 0;
  const segments = entries.map(([label, value], index) => {
    const from = total > 0 ? (acc / total) * 360 : 0;
    acc += (value ?? 0);
    const to = total > 0 ? (acc / total) * 360 : 360;
    const color = STATUS_COLORS[label] ?? DONUT_COLORS[index % DONUT_COLORS.length];
    return { label, from, to, color };
  });
  const gradient = segments.map((s) => `${s.color} ${s.from}% ${s.to}%`).join(", ");
  return (
    <div className="flex items-center justify-center gap-5">
      <div className="h-28 w-28 rounded-full" style={{ background: `conic-gradient(${gradient})` }}>
        <div className="m-8 grid h-12 w-12 place-items-center rounded-full bg-white text-xs font-black">{Math.round(resolutionRate)}%</div>
      </div>
      <div className="space-y-1 text-xs">
        {segments.map((s) => (
          <p key={s.label} className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
            {s.label} ({Math.round((s.to - s.from) / 360 * 100)}%)
          </p>
        ))}
      </div>
    </div>
  );
}

function SimpleTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50 text-slate-700">
          <tr>{headers.map((header) => <th key={header} className="p-2 font-black">{header}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, index) => (
            <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex} className="p-2">{cell}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ForecastChart({ result }: { result: ForecastResult | null }) {
  if (!result || result.forecast.length === 0) {
    return <p className="py-10 text-xs font-semibold text-slate-400">No forecast data available.</p>;
  }
  const points = result.forecast.slice(0, 14);
  const width = 600;
  const height = 180;
  const pad = 20;
  const allValues = points.flatMap((p) => [p.predicted, p.lower, p.upper]);
  const max = Math.max(1, ...allValues);
  const xStep = points.length > 1 ? (width - pad * 2) / (points.length - 1) : 0;
  const y = (value: number) => height - pad - (Math.max(0, value) / max) * (height - pad * 2);
  const line = points.map((point, i) => `${pad + i * xStep},${y(point.predicted)}`).join(" ");
  const band = [
    ...points.map((point, i) => `${pad + i * xStep},${y(point.upper)}`),
    ...[...points]
      .reverse()
      .map((point, i) => `${pad + (points.length - 1 - i) * xStep},${y(point.lower)}`),
  ].join(" ");
  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-3 text-[10px] text-slate-500">
        <span>Method: <strong>{result.method}</strong></span>
        <span>Avg: <strong>{result.avgDaily}/day</strong></span>
        <span>Slope: <strong>{result.slope}</strong></span>
        <span>Fit (R²): <strong>{result.meta.rSquared}</strong></span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-40 w-full">
        {[0, 1, 2, 3].map((gridLine) => (
          <line key={gridLine} x1={pad} x2={width - pad} y1={pad + gridLine * ((height - pad * 2) / 3)} y2={pad + gridLine * ((height - pad * 2) / 3)} stroke="#e2e8f0" />
        ))}
        <polygon points={band} fill="#0ea5e9" opacity="0.18" />
        <polyline points={line} fill="none" stroke="#0284c7" strokeWidth="3" />
      </svg>
      <div className="mt-1 flex justify-between text-[10px] text-slate-400">
        <span>{points[0]?.date ?? ""}</span>
        <span>{points[points.length - 1]?.date ?? ""}</span>
      </div>
      <div className="mt-2 flex items-center gap-4 text-[10px] text-slate-500">
        <span className="flex items-center gap-1.5"><span className="h-1.5 w-4 rounded bg-sky-600" /> Predicted volume</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-4 rounded bg-sky-300/40" /> 95% confidence band</span>
      </div>
    </div>
  );
}

function AnomalyFeed({ overview }: { overview: AnomalyOverview | null }) {
  if (!overview) return <p className="py-8 text-xs font-semibold text-slate-400">No anomaly data available.</p>;
  const anomalies = overview.latest.slice(0, 6);
  if (anomalies.length === 0) {
    return <p className="py-8 text-xs font-semibold text-slate-400">All sensors operating normally.</p>;
  }
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 pb-1">
        <span className="rounded bg-slate-900 px-2 py-0.5 text-[10px] font-black text-white">{overview.total} total</span>
        <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] font-black text-red-700">{overview.critical} critical</span>
        <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-700">{overview.warning} warnings</span>
        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-600">{overview.activeSensors} sensors</span>
      </div>
      {anomalies.map((anomaly) => (
        <div key={anomaly.id} className="flex items-start justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 p-2.5">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <span className={`h-2 w-2 shrink-0 rounded-full ${anomaly.severity === "CRITICAL" ? "bg-red-500" : "bg-amber-400"}`} />
              <span className="truncate">{anomaly.sensorName}</span>
            </p>
            <p className="mt-0.5 truncate text-[11px] text-slate-500">{anomaly.reason}</p>
          </div>
          <span className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-black ${anomaly.severity === "CRITICAL" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
            {anomaly.metricValue}{anomaly.unit} · {anomaly.zScore}σ
          </span>
        </div>
      ))}
    </div>
  );
}