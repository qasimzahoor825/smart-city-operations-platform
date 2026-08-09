"use client";

import React from "react";
import { Search, Filter } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Badge } from "@/components/ui";
import { PageContainer, useAsync } from "@/components/shared/page-container";
import { complaintsApi } from "@/services/complaints";
import { usersApi } from "@/services/operations";
import { useRealtimeComplaints } from "@/hooks/use-realtime";
import { toast } from "sonner";
import type { Complaint, ComplaintStatus, Officer } from "@/types";

const STATUS_LABEL: Record<ComplaintStatus, string> = {
  SUBMITTED: "Submitted",
  RECEIVED: "Received",
  ASSIGNED: "Assigned",
  UNDER_REVIEW: "Under Review",
  FIELD_INSPECTION: "Field Inspection",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CITIZEN_FEEDBACK: "Awaiting Feedback",
  CLOSED: "Closed",
  REJECTED: "Rejected",
  ESCALATED: "Escalated",
  CANCELLED: "Cancelled",
};

export default function DepartmentComplaintsPage() {
  const [reloadKey, setReloadKey] = React.useState(0);
  const { data: complaints, loading } = useAsync(() => complaintsApi.list({ limit: 100 }).then((r) => r.data), [], [reloadKey]);
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

  // Live refresh on socket events (or polling fallback ticks).
  const refresh = React.useCallback(() => setReloadKey((k) => k + 1), []);
  useRealtimeComplaints(refresh);

  const filtered = complaints.filter(
    (c) =>
      (!statusFilter || c.status === statusFilter) &&
      (!search || c.title.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase())),
  );

  const setStatus = async (c: Complaint, status: string) => {
    try {
      await complaintsApi.updateStatus(c.id, status, "Updated by department officer");
      toast.success(`Marked as ${STATUS_LABEL[status as ComplaintStatus]}`);
    } catch {
      toast.error("Could not update status");
    }
  };

  const assign = async (c: Complaint, officer: Officer) => {
    try {
      await complaintsApi.assign(c.id, { officerId: officer.id });
      toast.success(`Assigned to ${officer.fullName}`);
    } catch {
      toast.error("Could not assign");
    }
  };

  return (
    <PageContainer title="Department Work Queue & Tickets" description="Review assigned complaints, assign field crews, and update SLA resolution status.">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <Input placeholder="Search by title or ticket id…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <Filter className="w-4 h-4 text-slate-400" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-xs">
            <option value="">All Statuses</option>
            {Object.keys(STATUS_LABEL).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s as ComplaintStatus]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Card glass>
        <CardHeader>
          <CardTitle>Assigned Complaints</CardTitle>
          <CardDescription>{loading ? "Loading…" : `${filtered.length} ticket(s)`}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-slate-500 py-6">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-slate-500 py-6">No tickets match this filter.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="text-xs uppercase bg-slate-50 text-slate-500">
                  <tr>
                    <th className="p-4 rounded-l-xl">Ticket</th>
                    <th className="p-4">Issue</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Assign Officer</th>
                    <th className="p-4 rounded-r-xl">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-mono text-indigo-600">#{c.id.slice(-6).toUpperCase()}</td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-900">{c.title}</div>
                        <div className="text-xs text-slate-500">{c.address || "No location"}</div>
                      </td>
                      <td className="p-4 text-xs">{c.category.replace("_", " ")}</td>
                      <td className="p-4">
                        <Badge
                          variant={
                            c.status === "RESOLVED" || c.status === "CLOSED"
                              ? "success"
                              : c.status === "IN_PROGRESS"
                                ? "warning"
                                : "info"
                          }
                        >
                          {STATUS_LABEL[c.status]}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <select
                          value={c.assignedToId ?? ""}
                          onChange={(e) => void assign(c, officers.find((o) => o.id === e.target.value)!)}
                          className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-900"
                        >
                          <option value="">Unassigned</option>
                          {officers.map((o) => (
                            <option key={o.id} value={o.id}>
                              {o.fullName}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-4">
                        <select
                          value={c.status}
                          onChange={(e) => void setStatus(c, e.target.value)}
                          className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-900"
                        >
                          {Object.keys(STATUS_LABEL).map((s) => (
                            <option key={s} value={s}>
                              {STATUS_LABEL[s as ComplaintStatus]}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}