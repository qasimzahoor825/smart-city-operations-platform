"use client";

import React from "react";
import Link from "next/link";
import {
  Building2,
  LayoutDashboard,
  FileText,
  UserCheck,
  AlertTriangle,
  BarChart3,
  Calendar,
  Settings,
  Bell,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import { complaintsApi, type ComplaintStats } from "@/services/complaints";
import { usersApi, reportsApi, type ReportOverview } from "@/services/operations";
import type { Complaint, Officer } from "@/types";

const deptPriorityColor = (priority: string) => {
  if (priority === "HIGH" || priority === "CRITICAL") return "bg-red-100 text-red-700";
  if (priority === "MEDIUM") return "bg-amber-100 text-amber-700";
  return "bg-emerald-100 text-emerald-700";
};

export default function DepartmentHeadDashboardPage() {
  const [activeTab, setActiveTab] = React.useState("Overview");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedOfficers, setSelectedOfficers] = React.useState<Record<string, string>>({});
  const [officers, setOfficers] = React.useState<Officer[]>([]);
  const [unassignedList, setUnassignedList] = React.useState<Complaint[]>([]);
  const [stats, setStats] = React.useState<ComplaintStats | null>(null);
  const [overview, setOverview] = React.useState<ReportOverview | null>(null);
  const [allComplaints, setAllComplaints] = React.useState<Complaint[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchData = React.useCallback(async () => {
    try {
      const [submittedRes, officersRes, statsRes, overviewRes, allRes] = await Promise.all([
        complaintsApi.list({ status: "SUBMITTED", limit: 100 }).catch(() => null),
        usersApi.list({ role: "OFFICER", limit: 100 }).catch(() => null),
        complaintsApi.stats().catch(() => null),
        reportsApi.overview().catch(() => null),
        complaintsApi.list({ limit: 100 }).catch(() => null),
      ]);
      if (submittedRes) setUnassignedList(submittedRes.data);
      if (officersRes) setOfficers(officersRes.data);
      if (statsRes) setStats(statsRes);
      if (overviewRes) setOverview(overviewRes);
      if (allRes) setAllComplaints(allRes.data);
    } catch {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const isSlaBreached = (c: Complaint) =>
    !!c.slaDeadline && c.status !== "RESOLVED" && c.status !== "CLOSED" && new Date(c.slaDeadline).getTime() < Date.now();

  const escalations = allComplaints.filter(isSlaBreached).slice(0, 3);

  const handleOfficerChange = (complaintId: string, officerId: string) => {
    setSelectedOfficers((prev) => ({ ...prev, [complaintId]: officerId }));
  };

  const handleAssign = async (complaintId: string) => {
    const officerId = selectedOfficers[complaintId];
    if (!officerId) {
      toast.error("Please select an officer first");
      return;
    }
    try {
      await complaintsApi.assign(complaintId, { officerId });
      toast.success(`Assigned ticket ${complaintId} to officer`);
      await fetchData();
    } catch {
      toast.error("Could not assign complaint");
    }
  };

  const handleEscalate = async (complaintId: string) => {
    try {
      await complaintsApi.updateStatus(complaintId, "ASSIGNED", "Escalated to department head queue");
      toast.warning(`Ticket ${complaintId} escalated to Super Admin emergency queue`);
      await fetchData();
    } catch {
      toast.error("Could not escalate complaint");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-200 via-slate-100 to-teal-50 text-slate-900 font-sans flex">
      
      {/* Left Dark Sidebar matching Screenshot 07 */}
      <aside className="w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-teal-950 shrink-0 hidden lg:flex flex-col justify-between p-4 border-r border-slate-800 shadow-xl">
        <div className="space-y-6">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 px-2 py-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-teal-400 to-sky-500 text-white shadow-md shadow-teal-500/40">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white block leading-none">
                SmartCity
              </span>
              <span className="text-xs text-teal-300 font-medium">
                Dept Command
              </span>
            </div>
          </Link>

          {/* Navigation links */}
          <nav className="space-y-1">
            {[
              { label: "Overview", icon: LayoutDashboard, href: "/department/dashboard" },
              { label: "Complaints", icon: FileText, href: "/department/complaints" },
              { label: "Task Assignment", icon: UserCheck, href: "/department/tasks" },
              { label: "Officers", icon: UserCheck, href: "/department/officers" },
              { label: "Escalations", icon: AlertTriangle, href: "/department/escalations" },
              { label: "Department Analytics", icon: BarChart3, href: "/admin/analytics" },
              { label: "Reports", icon: FileText, href: "/department/reports" },
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
                      ? "bg-teal-500 text-white font-bold shadow-lg shadow-teal-500/30"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-700 px-2 text-xs text-slate-400 font-medium">
          Department Head Portal
        </div>
      </aside>

      {/* Main Body Column matching Screenshot 07 */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header Top Bar */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Dashboard
          </h1>

          <div className="flex items-center gap-3 text-slate-600 text-xs">
            <button className="p-2 rounded-lg hover:bg-slate-100" aria-label="Calendar">
              <Calendar className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg hover:bg-slate-100" aria-label="Settings">
              <Settings className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg hover:bg-slate-100 relative" aria-label="Notifications">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-500 to-sky-600 text-white font-bold text-xs flex items-center justify-center">
              HD
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="p-6 space-y-6 flex-1 overflow-y-auto">
          
          {/* Top 5 Summary Cards matching Screenshot 07 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            
            <div className="bg-gradient-to-br from-teal-500 to-teal-700 rounded-2xl p-4 shadow-lg shadow-teal-500/25 space-y-1">
              <span className="text-xs font-semibold text-teal-50 block">Total Complaints</span>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black text-white">{loading ? "…" : (overview?.complaints ?? stats?.total ?? 0)}</span>
                <span className="text-[10px] font-bold text-white bg-white/20 px-2 py-0.5 rounded-full border border-white/40">+5%</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl p-4 shadow-lg shadow-amber-500/25 space-y-1">
              <span className="text-xs font-semibold text-amber-50 block">Pending</span>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black text-white">{loading ? "…" : unassignedList.length}</span>
                <span className="text-[10px] font-bold text-white bg-white/20 px-2 py-0.5 rounded-full border border-white/40">+12%</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-sky-500 to-sky-700 rounded-2xl p-4 shadow-lg shadow-sky-500/25 space-y-1">
              <span className="text-xs font-semibold text-sky-50 block">In Progress</span>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black text-white">{loading ? "…" : (stats?.byStatus?.["IN_PROGRESS"] ?? 0)}</span>
                <span className="text-[10px] font-bold text-white bg-white/20 px-2 py-0.5 rounded-full border border-white/40">-3%</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-4 shadow-lg shadow-emerald-500/25 space-y-1">
              <span className="text-xs font-semibold text-emerald-50 block">Resolved</span>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black text-white">{loading ? "…" : (stats?.resolved ?? 0)}</span>
                <span className="text-[10px] font-bold text-white bg-white/20 px-2 py-0.5 rounded-full border border-white/40">+8%</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-rose-500 to-rose-700 rounded-2xl p-4 shadow-lg shadow-rose-500/25 space-y-1">
              <span className="text-xs font-semibold text-rose-50 block">Overdue</span>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black text-white">{loading ? "…" : (stats?.overdue ?? 0)}</span>
                <span className="text-[10px] font-bold text-white bg-white/20 px-2 py-0.5 rounded-full border border-white/40">+15%</span>
              </div>
            </div>

          </div>

          {/* Department Performance Charts + Escalation Alerts matching Screenshot 07 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Left 3 Charts Box */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-slate-900">
                Department Performance Chart
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                
                {/* Chart 1: Complaint Volume */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm bg-teal-600" />
                      Complaint Volume
                    </span>
                  </div>
                  <div className="h-36 bg-slate-50 rounded-xl p-2 flex items-end justify-between gap-1 border border-slate-100 relative">
                    <svg className="absolute inset-0 w-full h-full p-2" preserveAspectRatio="none" viewBox="0 0 100 50">
                      <path d="M0,40 Q25,10 50,25 T100,10" fill="none" stroke="#0d9488" strokeWidth="2" />
                    </svg>
                    <div className="w-full bg-teal-500/20 h-2/3 rounded-t" />
                    <div className="w-full bg-teal-500/30 h-4/5 rounded-t" />
                    <div className="w-full bg-teal-500/20 h-1/2 rounded-t" />
                    <div className="w-full bg-teal-500/40 h-full rounded-t" />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                  </div>
                </div>

                {/* Chart 2: Avg. Resolution Time */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm bg-sky-500" />
                      Avg. Resolution Time
                    </span>
                  </div>
                  <div className="h-36 bg-slate-50 rounded-xl p-2 flex items-end justify-between gap-1 border border-slate-100 relative">
                    <div className="w-full bg-gradient-to-t from-sky-600 to-sky-400 h-1/3 rounded-t" />
                    <div className="w-full bg-gradient-to-t from-sky-600 to-sky-400 h-1/2 rounded-t" />
                    <div className="w-full bg-gradient-to-t from-sky-600 to-sky-400 h-4/5 rounded-t" />
                    <div className="w-full bg-gradient-to-t from-sky-600 to-sky-400 h-2/3 rounded-t" />
                    <div className="w-full bg-gradient-to-t from-sky-600 to-sky-400 h-3/4 rounded-t" />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span>
                  </div>
                </div>

                {/* Chart 3: Officer Performance */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
                      Officer Performance
                    </span>
                  </div>
                  <div className="h-36 bg-slate-50 rounded-xl p-2 flex items-end justify-between gap-1.5 border border-slate-100">
                    <div className="w-full flex flex-col gap-0.5 justify-end h-full">
                      <div className="bg-amber-400 h-1/4 rounded-t" />
                      <div className="bg-purple-500 h-1/4" />
                      <div className="bg-teal-600 h-1/2 rounded-b" />
                    </div>
                    <div className="w-full flex flex-col gap-0.5 justify-end h-full">
                      <div className="bg-amber-400 h-1/3 rounded-t" />
                      <div className="bg-purple-500 h-1/3" />
                      <div className="bg-teal-600 h-1/3 rounded-b" />
                    </div>
                    <div className="w-full flex flex-col gap-0.5 justify-end h-full">
                      <div className="bg-amber-400 h-1/5 rounded-t" />
                      <div className="bg-purple-500 h-2/5" />
                      <div className="bg-teal-600 h-2/5 rounded-b" />
                    </div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Jan</span><span>Feb</span><span>Mar</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Right Escalation Alerts Column matching Screenshot 07 */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>Escalation Alerts</span>
              </h2>

              <div className="space-y-3">
                {escalations.length > 0 ? (
                  escalations.map((item) => (
                    <div key={item.id} className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-red-900">
                        <span>{item.id}</span>
                        <span className="text-[10px] text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                          Overdue {Math.ceil((Date.now() - new Date(item.slaDeadline!).getTime()) / 86400000)} days
                        </span>
                      </div>
                      <p className="text-red-700 text-[11px]">{item.title}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-red-900">
                      <span>No Escalations</span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">All clear</span>
                    </div>
                    <p className="text-red-700 text-[11px]">All complaints are within SLA</p>
                  </div>
                )}
              </div>

              <div className="pt-2 text-center text-xs">
                <Link href="/department/escalations" className="text-red-600 font-semibold hover:underline">
                  View All Critical Escalations
                </Link>
              </div>
            </div>

          </div>

          {/* Bottom Table: Unassigned Complaints matching Screenshot 07 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">
                Unassigned Complaints
              </h2>

              <div className="flex items-center gap-2">
                <div className="relative w-48 sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>
                <button className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600">
                  <Filter className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="text-[11px] bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold">
                  <tr>
                    <th className="p-3 w-8"><input type="checkbox" className="rounded" /></th>
                    <th className="p-3">Complaint ID ↕</th>
                    <th className="p-3">Category ↕</th>
                    <th className="p-3">Priority ↕</th>
                    <th className="p-3">Location</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Assign Officer</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {unassignedList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3"><input type="checkbox" className="rounded" /></td>
                      <td className="p-3 font-semibold text-slate-900">{item.id}</td>
                      <td className="p-3 text-slate-800">{item.category}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${deptPriorityColor(item.priority)}`}>
                          {item.priority}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600">{item.address ?? "—"}</td>
                      <td className="p-3 text-slate-500">{item.createdAt.slice(0, 10)}</td>
                      <td className="p-3">
                        <select
                          value={selectedOfficers[item.id] || ""}
                          onChange={(e) => handleOfficerChange(item.id, e.target.value)}
                          className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-900 focus:outline-none"
                        >
                          <option value="">Select Officer</option>
                          {officers.map((off) => (
                            <option key={off.id} value={off.id}>
                              {off.fullName}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3 text-right space-x-1.5">
                        <button
                          onClick={() => handleAssign(item.id)}
                          className="px-3 py-1 rounded-lg smart-btn-teal text-[11px] font-semibold"
                        >
                          Assign
                        </button>
                        <button
                          onClick={() => handleAssign(item.id)}
                          className="px-2.5 py-1 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold"
                        >
                          Reassign
                        </button>
                        <button
                          onClick={() => handleEscalate(item.id)}
                          className="px-2.5 py-1 rounded-lg border border-red-300 text-red-700 hover:bg-red-50 text-[11px] font-semibold"
                        >
                          Escalate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls matching Screenshot 07 */}
            <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span>Page size:</span>
                <select className="border border-slate-300 rounded px-2 py-0.5 text-xs">
                  <option value="10">10</option>
                  <option value="25">25</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button className="p-1 rounded hover:bg-slate-100"><ChevronLeft className="w-4 h-4" /></button>
                <span className="font-semibold text-slate-900">1</span>
                <span>2</span>
                <button className="p-1 rounded hover:bg-slate-100"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>

          </div>

        </main>
      </div>

    </div>
  );
}
