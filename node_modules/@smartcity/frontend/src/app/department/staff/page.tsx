"use client";

import React from "react";
import { Search, HardHat, Phone } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Badge } from "@/components/ui";
import { PageContainer, useAsync } from "@/components/shared/page-container";
import { usersApi } from "@/services/operations";
import { toast } from "sonner";
import type { Officer } from "@/types";

export default function DepartmentStaffPage() {
  const { data: staff, loading } = useAsync(
    () =>
      usersApi
        .list({ role: "OFFICER", limit: 100 })
        .then((r) => r.data)
        .catch(() => [] as Officer[]),
    [] as Officer[],
  );
  const [search, setSearch] = React.useState("");

  const filtered = staff.filter(
    (s) => !search || s.fullName.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()),
  );

  const contact = (s: Officer) => {
    toast.success(`Contacting ${s.fullName}…`);
  };

  return (
    <PageContainer title="Field Staff Directory" description="Dispatch-ready municipal staff and their current assignment status.">
      <Card glass>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Field Staff</CardTitle>
              <CardDescription>{loading ? "Loading…" : `${staff.length} staff member(s)`}</CardDescription>
            </div>
            <div className="relative">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search staff"
                className="pl-9 w-full sm:w-64"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((s) => (
              <div key={s.id} className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center">
                    <HardHat className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">{s.fullName}</div>
                    <div className="text-xs text-slate-500">{s.email}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant={s.active ? "success" : "destructive"}>{s.active ? "On Duty" : "Off Duty"}</Badge>
                  <button
                    onClick={() => contact(s)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-600 hover:text-cyan-800"
                  >
                    <Phone className="w-3.5 h-3.5" /> Contact
                  </button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full p-8 text-center text-sm text-slate-500">No staff found.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}