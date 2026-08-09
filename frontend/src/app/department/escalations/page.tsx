"use client";

import React from "react";
import { Search, Flag, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Badge } from "@/components/ui";
import { PageContainer, useAsync } from "@/components/shared/page-container";
import { complaintsApi } from "@/services/complaints";
import { toast } from "sonner";
import type { Complaint } from "@/types";

function timeDelta(iso: string): string {
  const created = new Date(iso).getTime();
  const hours = Math.max(0, Math.floor((Date.now() - created) / 3600000));
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ${hours % 24}h ago`;
  if (hours > 0) return `${hours}h ago`;
  return "just now";
}

export default function DepartmentEscalationsPage() {
  const { data: complaints, loading } = useAsync(
    () => complaintsApi.list({ limit: 200, priority: "CRITICAL" }).then((r) => r.data).catch(() => [] as Complaint[]),
    [] as Complaint[],
  );
  const [search, setSearch] = React.useState("");

  const escalated = complaints.filter((c) => ["SUBMITTED", "ASSIGNED", "IN_PROGRESS"].includes(c.status));
  const filtered = escalated.filter(
    (c) =>
      !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase()),
  );

  const resolve = async (c: Complaint) => {
    try {
      await complaintsApi.updateStatus(c.id, "RESOLVED", "Resolved from escalation queue");
      toast.success(`${c.id} marked resolved`);
    } catch {
      toast.error("Could not resolve complaint");
    }
  };

  return (
    <PageContainer title="Escalation Queue" description="Critical, high-priority complaints that need immediate department-level attention.">
      <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-800">
        <Flag className="w-5 h-5 mt-0.5 text-red-600" />
        <p>
          Complaints in this view are unresolved and flagged at <Badge variant="destructive">CRITICAL</Badge> priority.
          {loading ? " Loading…" : ` ${filtered.length} item(s) requiring action.`}
        </p>
      </div>

      <Card glass>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Critical Complaints</CardTitle>
              <CardDescription>Escalated tickets awaiting resolution</CardDescription>
            </div>
            <div className="relative">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search escalated tickets"
                className="pl-9 w-full sm:w-64"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filtered.map((c) => (
              <div key={c.id} className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{c.title}</span>
                    <Badge variant="destructive">{c.priority}</Badge>
                  </div>
                  <div className="text-xs text-slate-500">
                    {c.id} · {c.category} · {c.address || "No address"}
                  </div>
                </div>
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-red-400" />
                    <span className="text-red-700">{timeDelta(c.createdAt)}</span>
                  </div>
                  <button
                    onClick={() => resolve(c)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                  >
                    Resolve
                  </button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="p-8 text-center text-sm text-slate-500">No critical escalations right now.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}