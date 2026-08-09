"use client";

import React from "react";
import { Search, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Badge } from "@/components/ui";
import { PageContainer, useAsync } from "@/components/shared/page-container";
import { usersApi } from "@/services/operations";
import type { Officer } from "@/types";

export default function DepartmentOfficersPage() {
  const { data: officers, loading } = useAsync(
    () =>
      usersApi
        .list({ role: "OFFICER", limit: 100 })
        .then((r) => r.data)
        .catch(() => [] as Officer[]),
    [] as Officer[],
  );
  const [search, setSearch] = React.useState("");

  const filtered = officers.filter(
    (o) =>
      !search ||
      o.fullName.toLowerCase().includes(search.toLowerCase()) ||
      o.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <PageContainer title="Field Officers Roster" description="Active municipal officers assigned to complaint and maintenance duties.">
      <Card glass>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Officers</CardTitle>
              <CardDescription>{loading ? "Loading…" : `${officers.length} officer(s)`}</CardDescription>
            </div>
            <div className="relative">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search officer or email"
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
                  <th className="p-4 rounded-l-xl">Officer</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Department</th>
                  <th className="p-4 rounded-r-xl">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
                          {o.fullName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">
                            {o.fullName}
                            <span className="ml-2 inline-flex items-center gap-1 text-[10px] text-blue-600">
                              <ShieldCheck className="w-3 h-3" /> Verified
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-xs text-slate-500">{o.email}</td>
                    <td className="p-4 text-xs">{o.departmentName ?? o.departmentId ?? "General"}</td>
                    <td className="p-4">
                      <Badge variant={o.active ? "success" : "destructive"}>{o.active ? "Active" : "Inactive"}</Badge>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-sm text-slate-500">
                      No officers found.
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