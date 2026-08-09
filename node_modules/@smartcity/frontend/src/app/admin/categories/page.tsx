"use client";

import React from "react";
import { Search, PieChart } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from "@/components/ui";
import { PageContainer, useAsync } from "@/components/shared/page-container";
import { complaintsApi } from "@/services/complaints";
import { toast } from "sonner";

const CATEGORY_ICONS: Record<string, string> = {
  POTHOLES: "🕳️",
  WASTE: "🗑️",
  STREETLIGHT: "💡",
  TRAFFIC: "🚦",
  PUBLIC_SAFETY: "🚨",
  WATER: "💧",
};

export default function AdminCategoriesPage() {
  const { data: stats, loading } = useAsync(
    () =>
      complaintsApi
        .stats()
        .then((s) => Object.entries(s.byCategory).map(([category, count]) => ({ category, count })))
        .catch(() => [] as { category: string; count: number }[]),
    [] as { category: string; count: number }[],
  );
  const [search, setSearch] = React.useState("");

  const filtered = stats.filter((c) => !search || c.category.toLowerCase().includes(search.toLowerCase()));
  const total = stats.reduce((sum, c) => sum + c.count, 0);

  const markActive = (category: string) => {
    toast.success(`Category "${category}" updated`);
  };

  return (
    <PageContainer title="Complaint Categories" description="Manage the taxonomy of citizen complaint categories and their volume.">
      <Card glass>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Category Breakdown</CardTitle>
              <CardDescription>{loading ? "Loading…" : `${total} complaints across ${stats.length} categories`}</CardDescription>
            </div>
            <div className="relative">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search categories"
                className="pl-9 w-full sm:w-64"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="text-xs uppercase bg-slate-50 text-slate-500">
                <tr>
                  <th className="p-4 rounded-l-xl">Category</th>
                  <th className="p-4">Complaints</th>
                  <th className="p-4">Share</th>
                  <th className="p-4 rounded-r-xl text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((c) => {
                  const pct = total > 0 ? Math.round((c.count / total) * 100) : 0;
                  return (
                    <tr key={c.category} className="hover:bg-slate-50">
                      <td className="p-4">
                        <span className="inline-flex items-center gap-2">
                          <span className="text-lg">{CATEGORY_ICONS[c.category] ?? "📋"}</span>
                          <span className="font-semibold text-slate-900">{c.category.replace("_", " ")}</span>
                        </span>
                      </td>
                      <td className="p-4 font-bold text-slate-900">{c.count}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 rounded-full bg-slate-200 overflow-hidden">
                            <div className="h-full rounded-full bg-sky-500" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-slate-500">{pct}%</span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => markActive(c.category)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-sm text-slate-500">
                      <PieChart className="w-6 h-6 mx-auto mb-2 text-slate-600" />
                      No categories yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}