"use client";

import React from "react";
import { Search, Wrench } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Badge } from "@/components/ui";
import { PageContainer, useAsync } from "@/components/shared/page-container";
import { assetsApi } from "@/services/operations";
import { toast } from "sonner";
import type { Asset } from "@/types";

export default function DepartmentMaintenancePage() {
  const { data: assets, loading } = useAsync(() => assetsApi.list({ limit: 200 }).catch(() => [] as Asset[]), [] as Asset[]);
  const [search, setSearch] = React.useState("");

  const maintenance = assets.filter((a) => a.status !== "OPERATIONAL");
  const filtered = maintenance.filter(
    (a) => !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.category.toLowerCase().includes(search.toLowerCase()),
  );

  const markOperational = async (a: Asset) => {
    try {
      await assetsApi.updateStatus(a.id, "OPERATIONAL");
      toast.success(`${a.name} marked operational`);
    } catch {
      toast.error("Could not update asset");
    }
  };

  return (
    <PageContainer title="Asset Maintenance & Repair Board" description="Public assets currently under maintenance or out of service, with repair status.">
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
        <Wrench className="w-5 h-5 mt-0.5 text-amber-600" />
        <p>{loading ? "Loading asset maintenance queue…" : `${maintenance.length} asset(s) require maintenance attention.`}</p>
      </div>

      <Card glass>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Assets Under Maintenance</CardTitle>
              <CardDescription>Non-operational assets and their repair status</CardDescription>
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
                  <th className="p-4">Next Inspection</th>
                  <th className="p-4 rounded-r-xl text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="p-4 font-semibold text-slate-900">{a.name}</td>
                    <td className="p-4 text-xs">{a.category.replace("_", " ")}</td>
                    <td className="p-4">
                      <Badge variant={a.status === "UNDER_MAINTENANCE" ? "warning" : "destructive"}>
                        {a.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="p-4 text-xs text-slate-500">
                      {a.nextInspection ? new Date(a.nextInspection).toLocaleDateString() : "—"}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => markOperational(a)}
                        disabled={loading}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                      >
                        Mark Operational
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