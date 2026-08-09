"use client";

import React from "react";
import { Search, ClipboardCheck, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Badge } from "@/components/ui";
import { PageContainer, useAsync } from "@/components/shared/page-container";
import { assetsApi } from "@/services/operations";
import { toast } from "sonner";
import type { Asset } from "@/types";

export default function DepartmentInspectionsPage() {
  const { data: assets, loading } = useAsync(() => assetsApi.list({ limit: 200 }).catch(() => [] as Asset[]), [] as Asset[]);
  const [search, setSearch] = React.useState("");

  const filtered = assets.filter(
    (a) => !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.category.toLowerCase().includes(search.toLowerCase()),
  );

  const scheduleInspection = (a: Asset) => {
    toast.success(`Inspection scheduled for ${a.name}`);
  };

  return (
    <PageContainer title="Asset Inspections" description="Track inspection history and schedule maintenance checks for public assets.">
      <Card glass>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Inspection Registry</CardTitle>
              <CardDescription>{loading ? "Loading…" : `${assets.length} assets in registry`}</CardDescription>
            </div>
            <div className="relative">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search assets"
                className="pl-9 w-full sm:w-64"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="text-xs uppercase bg-slate-50 text-slate-500">
                <tr>
                  <th className="p-4 rounded-l-xl">Asset</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Last Inspection</th>
                  <th className="p-4">Next Due</th>
                  <th className="p-4 rounded-r-xl text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="p-4 font-semibold text-slate-900">
                      <span className="inline-flex items-center gap-2">
                        <ClipboardCheck className="w-4 h-4 text-blue-600" />
                        {a.name}
                      </span>
                    </td>
                    <td className="p-4 text-xs">{a.category.replace("_", " ")}</td>
                    <td className="p-4">
                      <Badge variant={a.status === "OPERATIONAL" ? "success" : a.status === "UNDER_MAINTENANCE" ? "warning" : "destructive"}>
                        {a.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="p-4 text-xs text-slate-500">
                      {a.lastInspection ? new Date(a.lastInspection).toLocaleDateString() : "Never"}
                    </td>
                    <td className="p-4 text-xs text-slate-500">
                      {a.nextInspection ? new Date(a.nextInspection).toLocaleDateString() : "—"}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => scheduleInspection(a)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100"
                      >
                        <Plus className="w-3.5 h-3.5" /> Schedule
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}