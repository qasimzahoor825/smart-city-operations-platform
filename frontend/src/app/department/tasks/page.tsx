"use client";

import React from "react";
import { Search, UserPlus, ListTodo, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Badge } from "@/components/ui";
import { PageContainer, useAsync } from "@/components/shared/page-container";
import { complaintsApi } from "@/services/complaints";
import { usersApi } from "@/services/operations";
import { toast } from "sonner";
import type { Complaint, Officer } from "@/types";

const PRIORITY_VARIANT: Record<string, "default" | "warning" | "destructive" | "info"> = {
  LOW: "info",
  MEDIUM: "warning",
  HIGH: "destructive",
  CRITICAL: "destructive",
};

export default function DepartmentTasksPage() {
  const { data: complaints, loading } = useAsync(
    () => complaintsApi.list({ limit: 100 }).then((r) => r.data),
    [] as Complaint[],
  );
  const { data: officers } = useAsync(
    () =>
      usersApi
        .list({ role: "OFFICER", limit: 100 })
        .then((r) => r.data)
        .catch(() => [] as Officer[]),
    [] as Officer[],
  );

  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");
  const [assignment, setAssignment] = React.useState<Record<string, string>>({});

  const open = complaints.filter((c) => ["SUBMITTED", "ASSIGNED", "IN_PROGRESS"].includes(c.status));
  const done = complaints.filter((c) => ["RESOLVED", "CLOSED"].includes(c.status));

  const filteredOpen = open.filter(
    (c) =>
      (!statusFilter || c.status === statusFilter) &&
      (!search || c.title.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase())),
  );

  const assign = async (c: Complaint) => {
    const officerId = assignment[c.id];
    const officer = officers.find((o) => o.id === officerId);
    if (!officerId || !officer) {
      toast.error("Please select an officer first");
      return;
    }
    try {
      await complaintsApi.assign(c.id, { officerId });
      await complaintsApi.updateStatus(c.id, "ASSIGNED", `Assigned to ${officer.fullName}`);
      toast.success(`Assigned ${c.id} to ${officer.fullName}`);
    } catch {
      toast.error("Could not assign complaint");
    }
  };

  const escalate = async (c: Complaint) => {
    try {
      await complaintsApi.updateStatus(c.id, "IN_PROGRESS", "Escalated to department head queue");
      toast.warning(`${c.id} escalated to department head`);
    } catch {
      toast.error("Could not escalate complaint");
    }
  };

  const clearFilter = () => setStatusFilter("");

  return (
    <PageContainer title="Task Assignment & Field Work Queue" description="Route newly submitted complaints to field officers and track task-level progress.">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card glass>
          <CardHeader>
            <CardTitle>Open Tasks</CardTitle>
            <CardDescription>Needs officer assignment or action</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">{loading ? "…" : open.length}</div>
          </CardContent>
        </Card>
        <Card glass>
          <CardHeader>
            <CardTitle>Resolved Today</CardTitle>
            <CardDescription>Completed tasks in current window</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-emerald-600">{loading ? "…" : done.length}</div>
          </CardContent>
        </Card>
        <Card glass>
          <CardHeader>
            <CardTitle>Field Officers</CardTitle>
            <CardDescription>Available for dispatch</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-cyan-600">{officers.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card glass>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Open Complaints Queue</CardTitle>
              <CardDescription>Assign officers or escalate high-priority tickets</CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by title or ID"
                  className="pl-9 w-full sm:w-56"
                />
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none"
                >
                  <option value="">All statuses</option>
                  <option value="SUBMITTED">Submitted</option>
                  <option value="ASSIGNED">Assigned</option>
                  <option value="IN_PROGRESS">In Progress</option>
                </select>
                {statusFilter && (
                  <button onClick={clearFilter} className="text-xs text-slate-500 hover:text-slate-900 px-2 py-1">
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="text-xs uppercase bg-slate-50 text-slate-500">
                <tr>
                  <th className="p-4 rounded-l-xl">Complaint</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Assign Officer</th>
                  <th className="p-4 rounded-r-xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOpen.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="p-4">
                      <div className="font-semibold text-slate-900">{c.title}</div>
                      <div className="text-xs text-slate-500">{c.id}</div>
                    </td>
                    <td className="p-4 text-xs">{c.category}</td>
                    <td className="p-4">
                      <Badge variant={PRIORITY_VARIANT[c.priority] ?? "default"}>{c.priority}</Badge>
                    </td>
                    <td className="p-4">
                      <Badge variant="info">{c.status.replace("_", " ")}</Badge>
                    </td>
                    <td className="p-4">
                      <select
                        value={assignment[c.id] ?? ""}
                        onChange={(e) => setAssignment((prev) => ({ ...prev, [c.id]: e.target.value }))}
                        className="bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-900 focus:outline-none"
                      >
                        <option value="">Select officer</option>
                        {officers.map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.fullName}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => assign(c)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                      >
                        <UserPlus className="w-3.5 h-3.5" /> Assign
                      </button>
                      <button
                        onClick={() => escalate(c)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700"
                      >
                        <ListTodo className="w-3.5 h-3.5" /> Escalate
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredOpen.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-sm text-slate-500">
                      <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-emerald-600" />
                      No open complaints need assignment. All caught up!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card glass>
        <CardHeader>
          <CardTitle>Filter Queue</CardTitle>
          <CardDescription>Quick status filter chips</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {["SUBMITTED", "ASSIGNED", "IN_PROGRESS"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(statusFilter === s ? "" : s)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                  statusFilter === s ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-white text-slate-600 border-slate-300"
                }`}
              >
                {s.replace("_", " ")}
              </button>
            ))}
            <button
              onClick={() => setStatusFilter("")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                statusFilter === "" ? "bg-white text-slate-700 border-slate-300" : "bg-white text-slate-600 border-slate-300"
              }`}
            >
              All
            </button>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}