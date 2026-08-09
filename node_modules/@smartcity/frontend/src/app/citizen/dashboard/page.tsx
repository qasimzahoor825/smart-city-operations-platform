"use client";

import React from "react";
import Link from "next/link";
import {
  Building2,
  Search,
  Bell,
  User,
  ChevronDown,
  MapPin,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  LayoutDashboard,
  FileText,
  PlusCircle,
  Wrench,
  ChevronLeft,
  ChevronRight,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/hooks/auth";
import { complaintsApi } from "@/services/complaints";
import { notificationsApi } from "@/services/operations";
import { toast } from "sonner";
import type { Complaint, AppNotification } from "@/types";

const STATUS_STYLE: Record<string, { label: string; color: string }> = {
  SUBMITTED: { label: "Submitted", color: "bg-blue-100 text-blue-700 border-blue-200" },
  ASSIGNED: { label: "Assigned", color: "bg-violet-100 text-violet-700 border-violet-200" },
  IN_PROGRESS: { label: "In Progress", color: "bg-teal-100 text-teal-700 border-teal-200" },
  RESOLVED: { label: "Resolved", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  CLOSED: { label: "Closed", color: "bg-slate-200 text-slate-700 border-slate-300" },
  REJECTED: { label: "Rejected", color: "bg-red-100 text-red-700 border-red-200" },
};

export default function CitizenDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = React.useState("Dashboard");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [complaints, setComplaints] = React.useState<Complaint[]>([]);
  const [notifications, setNotifications] = React.useState<AppNotification[]>([]);
  const [unread, setUnread] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(() => {
    if (!user?.id) return;
    Promise.all([
      complaintsApi.list({ citizenId: user.id, limit: 10 }).then((res) => res.data),
      notificationsApi.list({ userId: user.id }),
      notificationsApi.unreadCount(user.id),
    ])
      .then(([list, notes, unreadCount]) => {
        setComplaints(list);
        setNotifications(notes.slice(0, 5));
        setUnread(unreadCount);
      })
      .catch(() => toast.error("Could not refresh dashboard data"))
      .finally(() => setLoading(false));
  }, [user?.id]);

  React.useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 10000);
    return () => clearInterval(interval);
  }, [refresh]);

  const total = complaints.length;
  const inProgress = complaints.filter((c) =>
    ["IN_PROGRESS", "ASSIGNED", "SUBMITTED"].includes(c.status),
  ).length;
  const resolved = complaints.filter((c) => ["RESOLVED", "CLOSED"].includes(c.status)).length;
  const pending = total - inProgress - resolved;
  const fullName = user?.fullName ?? "Citizen";

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col">
      
      {/* Top Bar matching Screenshot 03 */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700 border border-teal-200">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-lg text-slate-900 tracking-tight">
              Metropolis <span className="text-teal-700">SmartCity</span>
            </span>
          </Link>

          {/* Header Search Bar */}
          <div className="relative hidden md:block w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search complaints, services, or locations"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>
        </div>

        {/* Right User Bar */}
        <div className="flex items-center space-x-5 text-xs font-semibold">
          {/* Notification Bell */}
          <div className="relative">
            <button className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors" aria-label="Notifications">
              <Bell className="w-4 h-4" />
            </button>
            {unread > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
                {unread}
              </span>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-900">
            <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold border border-slate-300">
              <User className="w-4 h-4" />
            </div>
            <span>{fullName}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>

          {/* City Selector */}
          <div className="flex items-center gap-1.5 text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-200">
            <MapPin className="w-3.5 h-3.5 text-teal-700" />
            <span>Metropolis City Centre</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>
      </header>

      {/* Main Layout Body */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto p-4 sm:p-6 lg:p-8 gap-6">
        
        {/* Left Navigation Sidebar matching Screenshot 03 */}
        <aside className="w-60 shrink-0 hidden lg:block space-y-2">
          <nav className="space-y-1">
            {[
              { label: "Dashboard", icon: LayoutDashboard, href: "/citizen/dashboard" },
              { label: "My Complaints", icon: FileText, href: "/citizen/complaints" },
              { label: "Submit Complaint", icon: PlusCircle, href: "/citizen/complaints/new" },
              { label: "Service Requests", icon: Wrench, href: "/citizen/services" },
              { label: "Notifications", icon: Bell, href: "/citizen/notifications", badge: unread },
              { label: "Profile", icon: User, href: "/citizen/profile" },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.label;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setActiveTab(item.label)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-teal-100/80 text-teal-900 font-bold shadow-sm"
                      : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? "text-teal-700" : "text-slate-500"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge ? (
                    <span className="px-1.5 py-0.5 rounded-full bg-slate-300 text-slate-700 text-[10px]">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content Grid matching Screenshot 03 */}
        <main className="flex-1 space-y-6">
          
          {/* Greeting Banner */}
          <div className="bg-gradient-to-r from-teal-600 via-sky-600 to-indigo-600 rounded-2xl px-6 py-5 shadow-lg shadow-teal-500/25">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Good Morning, {fullName}
            </h1>
            <p className="text-xs sm:text-sm text-teal-50">
              Welcome to your Metropolis SmartCity Dashboard. Track your complaints and requests.
            </p>
          </div>

          {/* Metric Cards Row matching Screenshot 03 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            
            {/* Total Complaints */}
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl p-4 shadow-lg shadow-indigo-500/25 space-y-2">
              <div className="p-2 rounded-lg bg-white/20 w-fit">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-2xl font-black text-white">{total}</div>
                <div className="text-xs text-indigo-50 font-medium">Total Complaints</div>
              </div>
            </div>

            {/* In Progress */}
            <div className="bg-gradient-to-br from-teal-500 to-teal-700 rounded-2xl p-4 shadow-lg shadow-teal-500/25 space-y-2">
              <div className="p-2 rounded-lg bg-white/20 w-fit">
                <Clock className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-2xl font-black text-white">{inProgress}</div>
                <div className="text-xs text-teal-50 font-medium">In Progress</div>
              </div>
            </div>

            {/* Resolved */}
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-4 shadow-lg shadow-emerald-500/25 space-y-2">
              <div className="p-2 rounded-lg bg-white/20 w-fit">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-2xl font-black text-white">{resolved}</div>
                <div className="text-xs font-medium text-emerald-50">Resolved</div>
              </div>
            </div>

            {/* Pending */}
            <div className="bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl p-4 shadow-lg shadow-amber-500/25 space-y-2">
              <div className="p-2 rounded-lg bg-white/20 w-fit">
                <AlertCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-2xl font-black text-white">{pending}</div>
                <div className="text-xs font-medium text-amber-100">Pending</div>
              </div>
            </div>

            {/* Submit New Complaint Action Tile */}
            <Link
                  href="/citizen/complaints/new"
              className="bg-teal-600 hover:bg-teal-700 text-white rounded-2xl p-4 shadow-md flex flex-col justify-between transition-all group col-span-2 sm:col-span-1"
            >
              <div className="p-1.5 rounded-lg bg-white/20 w-fit group-hover:scale-110 transition-transform">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <div className="font-bold text-sm leading-tight">
                Submit New Complaint
              </div>
            </Link>
          </div>

          {/* Recent Complaints Table matching Screenshot 03 */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden space-y-4 p-6">
            <h2 className="text-base font-bold text-slate-900">
              Recent Complaints
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="text-[11px] uppercase bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold">
                  <tr>
                    <th className="p-3">Complaint ID</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Location</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {loading && complaints.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-400">
                        Loading recent complaints...
                      </td>
                    </tr>
                  ) : complaints.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-400">
                        No complaints found. Submit one to get started.
                      </td>
                    </tr>
                  ) : (
                    complaints.map((item) => {
                      const st = STATUS_STYLE[item.status] ?? {
                        label: item.status,
                        color: "bg-slate-200 text-slate-700 border-slate-300",
                      };
                      return (
                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 font-semibold text-slate-900">{item.id}</td>
                          <td className="p-3 text-slate-800">{item.category.replace("_", " ")}</td>
                          <td className="p-3 text-slate-600">{item.address || "Location provided"}</td>
                          <td className="p-3 text-slate-500">
                            {new Date(item.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </td>
                          <td className="p-3">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${st.color}`}>
                              {st.label}
                            </span>
                          </td>
                          <td className="p-3 text-right space-x-2">
                            <Link
                              href={`/citizen/complaints/${item.id}`}
                              className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold transition-colors inline-block"
                            >
                              View Details
                            </Link>
                            <button className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 text-[11px] font-medium transition-colors">
                              Edit
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls matching Screenshot 03 */}
            <div className="flex items-center justify-center gap-2 pt-2 text-xs font-semibold text-slate-600">
              <button className="p-1 rounded hover:bg-slate-100 disabled:opacity-40" aria-label="Previous Page">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(1)}
                className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                  currentPage === 1 ? "bg-slate-900 text-white" : "hover:bg-slate-100"
                }`}
              >
                1
              </button>
              <button
                onClick={() => setCurrentPage(2)}
                className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                  currentPage === 2 ? "bg-slate-900 text-white" : "hover:bg-slate-100"
                }`}
              >
                2
              </button>
              <button className="flex items-center gap-1 hover:text-slate-900">
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </main>

        {/* Right Sidebar Panel matching Screenshot 03 */}
        <aside className="w-80 shrink-0 hidden xl:block space-y-6">
          
          {/* Notifications Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Notifications</h3>

            {notifications.length === 0 ? (
              <p className="text-[11px] text-slate-400">No notifications yet.</p>
            ) : (
              <div className="space-y-3.5 text-xs">
                {notifications.map((n) => (
                  <div key={n.id} className="space-y-1 border-b border-slate-100 pb-3">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${n.isRead ? "bg-slate-300" : "bg-blue-600"}`} />
                      {n.title}
                    </div>
                    <div className="text-[11px] text-slate-400 pl-3.5">
                      {new Date(n.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Service Overview Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Service Overview</h3>
              <p className="text-[11px] text-slate-500">Overview cards for quick access.</p>
            </div>

            <div className="space-y-3">
              {/* Track Waste Collection */}
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <Trash2 className="w-4 h-4 text-slate-600" />
                  <span>Track Waste Collection</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Status: Active Service</span>
                </div>
              </div>

              {/* Report Traffic Light */}
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Report Traffic Light</span>
                </div>
                <Link
              href="/citizen/complaints/new"
                  className="px-3 py-1.5 rounded-lg smart-btn-navy text-[11px] font-semibold"
                >
                  Report
                </Link>
              </div>
            </div>
          </div>

        </aside>
      </div>

    </div>
  );
}