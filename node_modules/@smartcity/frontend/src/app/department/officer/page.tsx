"use client";

import React from "react";
import Link from "next/link";
import {
  Building2,
  LayoutDashboard,
  ClipboardList,
  CheckSquare,
  Users,
  Bell,
  FileText,
  Search,
  Filter,
  ChevronDown,
  Edit,
  TrendingUp,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/auth";
import { complaintsApi } from "@/services/complaints";
import type { Complaint } from "@/types";

const taskPriorityColor = (priority: string) => {
  if (priority === "HIGH" || priority === "CRITICAL") return "bg-red-100 text-red-800 border-red-200";
  if (priority === "MEDIUM") return "bg-amber-100 text-amber-800 border-amber-200";
  return "bg-blue-100 text-blue-800 border-blue-200";
};

const queuePriorityColor = (priority: string) => {
  if (priority === "CRITICAL") return "bg-red-600 text-white";
  if (priority === "HIGH") return "bg-red-500 text-white";
  if (priority === "MEDIUM") return "bg-amber-500 text-white";
  return "bg-blue-500 text-white";
};

export default function OfficerDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = React.useState("Dashboard");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusModalOpen, setStatusModalOpen] = React.useState(false);
  const [selectedComplaint, setSelectedComplaint] = React.useState<Complaint | null>(null);
  const [newStatus, setNewStatus] = React.useState("In Progress");
  const [complaints, setComplaints] = React.useState<Complaint[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [taskToggles, setTaskToggles] = React.useState<Record<string, boolean>>({});

  const STATUS_LABEL: Record<string, string> = {
    SUBMITTED: "Received",
    ASSIGNED: "Investigating",
    IN_PROGRESS: "In Progress",
    RESOLVED: "Resolved",
    CLOSED: "Closed",
    REJECTED: "Rejected",
  };

  const STATUS_VALUE: Record<string, Complaint["status"]> = {
    Received: "SUBMITTED",
    Investigating: "ASSIGNED",
    "In Progress": "IN_PROGRESS",
    Resolved: "RESOLVED",
    Closed: "CLOSED",
    Rejected: "REJECTED",
  };

  const fetchComplaints = React.useCallback(async () => {
    try {
      const res = await complaintsApi.list({ limit: 100 });
      setComplaints(res.data);
    } catch {
      toast.error("Failed to load complaints");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchComplaints();
    const interval = setInterval(fetchComplaints, 10000);
    return () => clearInterval(interval);
  }, [fetchComplaints]);

  const assignedQueue = complaints.filter((c) => c.assignedToId === user?.id);

  const filteredQueue = assignedQueue.filter(
    (c) =>
      !searchQuery ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const inProgressCount = complaints.filter((c) => c.status === "IN_PROGRESS").length;
  const resolvedCount = complaints.filter((c) => c.status === "RESOLVED" || c.status === "CLOSED").length;
  const slaBreachCount = complaints.filter((c) => {
    if (c.status === "RESOLVED" || c.status === "CLOSED" || !c.slaDeadline) return false;
    return new Date(c.slaDeadline).getTime() < Date.now();
  }).length;

  const staffTasks = complaints
    .filter((c) => c.assignedToId === user?.id && c.status !== "RESOLVED" && c.status !== "CLOSED")
    .slice(0, 8)
    .map((c) => ({
      id: c.id,
      text: c.title,
      priority: c.priority,
      priorityColor: taskPriorityColor(c.priority),
      done: !!taskToggles[c.id],
    }));

  const toggleTask = (id: string) => {
    setTaskToggles((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const openStatusModal = (c: Complaint) => {
    setSelectedComplaint(c);
    setNewStatus(STATUS_LABEL[c.status] ?? "In Progress");
    setStatusModalOpen(true);
  };

  const handleUpdateStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    try {
      await complaintsApi.updateStatus(selectedComplaint.id, STATUS_VALUE[newStatus] ?? newStatus, "Updated by field officer");
      toast.success(`Ticket ${selectedComplaint.id} status updated to ${newStatus}`);
      setStatusModalOpen(false);
      setSelectedComplaint(null);
      fetchComplaints();
    } catch {
      toast.error("Could not update complaint status");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-200 via-slate-100 to-teal-50 text-slate-900 font-sans flex">
      
      {/* Left Dark Navy Sidebar matching Screenshot 06 */}
      <aside className="w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-teal-950 text-white shrink-0 hidden lg:flex flex-col justify-between p-4 border-r border-slate-800 shadow-xl">
        <div className="space-y-6">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 px-2 py-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-teal-400 to-sky-500 text-white shadow-md shadow-teal-500/40">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white block leading-none">
                Smart City Ops
              </span>
              <span className="text-xs text-teal-300 font-medium">
                Platform
              </span>
            </div>
          </Link>

          {/* Navigation items */}
          <nav className="space-y-1">
            {[
              { label: "Dashboard", icon: LayoutDashboard, href: "/department/officer" },
              { label: "Assigned Complaints", icon: ClipboardList, href: "/department/complaints" },
              { label: "Tasks", icon: CheckSquare, href: "/department/tasks" },
              { label: "Field Staff", icon: Users, href: "/department/staff" },
              { label: "Notifications", icon: Bell, href: "/department/notifications" },
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
                      ? "bg-teal-500 text-white shadow-lg shadow-teal-500/30 font-bold"
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

        <div className="pt-4 border-t border-slate-700 px-2 text-xs text-slate-400">
          Field Officer Mode - Active
        </div>
      </aside>

      {/* Main Content Area matching Screenshot 06 */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header Top Bar */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Dashboard
          </h1>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <button className="p-2 rounded-full text-slate-500 hover:bg-slate-100 relative" aria-label="Notifications">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
            </button>

            <div className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-900">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 overflow-hidden border border-slate-300">
                <UserCheck className="w-4 h-4 text-teal-700" />
              </div>
              <span>Officer Sarah Khan</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>
        </header>

        {/* Main Body */}
        <main className="p-6 space-y-6 flex-1 overflow-y-auto">
          
          {/* Top 5 Metric Cards Row matching Screenshot 06 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            
            {/* Card 1: Assigned Complaints */}
            <div className="bg-gradient-to-br from-sky-500 to-sky-700 rounded-2xl p-4 shadow-lg shadow-sky-500/25 space-y-2">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-white/20 text-white">
                  <Users className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-white bg-white/20 px-2 py-0.5 rounded-full">
                  <TrendingUp className="w-3 h-3" />
                  <span>42%</span>
                </div>
              </div>
              <div>
                <div className="text-3xl font-black text-white">{loading ? "…" : assignedQueue.length}</div>
                <div className="text-xs text-sky-100 font-medium">Assigned Complaints</div>
              </div>
            </div>

            {/* Card 2: New Today */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-4 shadow-lg shadow-blue-500/25 space-y-2">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-white/20 text-white">
                  <FileText className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-white bg-white/20 px-2 py-0.5 rounded-full border border-white/40">
                  Up 88
                </span>
              </div>
              <div>
                <div className="text-3xl font-black text-white">{loading ? "…" : complaints.length}</div>
                <div className="text-xs text-blue-100 font-medium">New Today</div>
              </div>
            </div>

            {/* Card 3: In Progress */}
            <div className="bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl p-4 shadow-lg shadow-amber-500/25 space-y-2">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-white/20 text-white">
                  <ClipboardList className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-white bg-white/20 px-2 py-0.5 rounded-full border border-white/40">
                  Up 155
                </span>
              </div>
              <div>
                <div className="text-3xl font-black text-white">{loading ? "…" : inProgressCount}</div>
                <div className="text-xs text-amber-100 font-medium">In Progress</div>
              </div>
            </div>

            {/* Card 4: Overdue */}
            <div className="bg-gradient-to-br from-rose-500 to-rose-700 rounded-2xl p-4 shadow-lg shadow-rose-500/25 space-y-2">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-white/20 text-white">
                  <Bell className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-white bg-white/20 px-2 py-0.5 rounded-full border border-white/40">
                  Down 13
                </span>
              </div>
              <div>
                <div className="text-3xl font-black text-white">{loading ? "…" : slaBreachCount}</div>
                <div className="text-xs text-rose-100 font-medium">Overdue</div>
              </div>
            </div>

            {/* Card 5: Resolved Today */}
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-4 shadow-lg shadow-emerald-500/25 space-y-2">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-white/20 text-white">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-white bg-white/20 px-2 py-0.5 rounded-full border border-white/40">
                  Up 125
                </span>
              </div>
              <div>
                <div className="text-3xl font-black text-white">{loading ? "…" : resolvedCount}</div>
                <div className="text-xs text-emerald-100 font-medium">Resolved Today</div>
              </div>
            </div>

          </div>

          {/* Main Split Grid matching Screenshot 06 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Queue Table Column */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900">
                  Assigned Complaint Queue
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
                      <th className="p-3">ID ↕</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Location</th>
                      <th className="p-3">Citizen</th>
                      <th className="p-3">Priority ↕</th>
                      <th className="p-3">Assigned Date</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredQueue.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-semibold text-slate-900">{item.id}</td>
                        <td className="p-3 text-slate-800">{item.category}</td>
                        <td className="p-3 text-slate-600">{item.address ?? "—"}</td>
                        <td className="p-3 text-slate-700 font-medium">{item.citizenId}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${queuePriorityColor(item.priority)}`}>
                            {item.priority}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500">{item.createdAt.slice(0, 10)}</td>
                        <td className="p-3 text-slate-700 font-semibold">{STATUS_LABEL[item.status] ?? item.status}</td>
                        <td className="p-3 text-right space-x-2">
                          <Link
                            href={`/citizen/complaints/${item.id}`}
                            className="text-teal-700 hover:underline font-semibold text-[11px]"
                          >
                            View Details
                          </Link>
                          <button
                            onClick={() => openStatusModal(item)}
                            className="p-1 rounded text-slate-400 hover:text-slate-700"
                            aria-label="Edit status"
                          >
                            <Edit className="w-3.5 h-3.5 inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Side Column matching Screenshot 06 */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Today's Tasks Checklist */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-slate-900">Today&apos;s Tasks</h2>
                  <button className="text-slate-400 hover:text-slate-600 text-xs">...</button>
                </div>

                <div className="space-y-3 text-xs">
                  {staffTasks.map((task) => (
                    <label key={task.id} className="flex items-start gap-2.5 cursor-pointer p-2 rounded-xl hover:bg-slate-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={task.done}
                        onChange={() => toggleTask(task.id)}
                        className="mt-0.5 accent-teal-600 h-4 w-4 rounded border-slate-300"
                      />
                      <div className="space-y-1">
                        <span className={`block font-medium ${task.done ? "line-through text-slate-400" : "text-slate-800"}`}>
                          {task.text}
                        </span>
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${task.priorityColor}`}>
                          {task.priority}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Quick Action Button Card matching Screenshot 06 */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Quick action button
                </h3>
                <button
                  onClick={() => {
                    const target = assignedQueue[0] ?? complaints[0];
                    if (target) openStatusModal(target);
                  }}
                  className="w-full py-3 rounded-xl smart-btn-teal font-semibold text-xs shadow-md flex items-center justify-center gap-2"
                >
                  <span>Update Complaint Status</span>
                </button>
              </div>

            </div>

          </div>

        </main>
      </div>

      {/* Update Status Modal */}
      {statusModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Update Status - {selectedComplaint?.id}</h3>
            <form onSubmit={handleUpdateStatusSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
                >
                  <option value="Received">Received</option>
                  <option value="Investigating">Investigating</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStatusModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg smart-btn-teal text-xs font-semibold"
                >
                  Save Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
