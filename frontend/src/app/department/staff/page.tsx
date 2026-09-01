"use client";

import React from "react";
import { Search, HardHat, Phone, UserPlus, X, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Badge, Button } from "@/components/ui";
import { PageContainer, useAsync } from "@/components/shared/page-container";
import { usersApi, departmentsApi } from "@/services/operations";
import { toast } from "sonner";
import type { Officer, Department } from "@/types";

export default function DepartmentStaffPage() {
  const { data: staff, loading, refresh: reload } = useAsync(
    () =>
      usersApi
        .list({ role: "OFFICER", limit: 100 })
        .then((r) => r.data)
        .catch(() => [] as Officer[]),
    [] as Officer[],
  );
  const [search, setSearch] = React.useState("");

  const [showAdd, setShowAdd] = React.useState(false);
  const [adding, setAdding] = React.useState(false);
  const [departments, setDepartments] = React.useState<Department[]>([]);
  const [form, setForm] = React.useState({ fullName: "", email: "", departmentId: "" });

  React.useEffect(() => {
    if (showAdd) {
      departmentsApi.list().then(setDepartments).catch(() => setDepartments([]));
    }
  }, [showAdd]);

  const filtered = staff.filter(
    (s) => !search || s.fullName.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()),
  );

  const contact = (s: Officer) => {
    toast.success(`Contacting ${s.fullName}…`);
  };

  const handleAdd = async () => {
    if (!form.fullName.trim() || !form.email.trim()) {
      toast.error("Full name and email are required");
      return;
    }
    setAdding(true);
    try {
      await usersApi.provision({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        role: "OFFICER",
        departmentId: form.departmentId || undefined,
        active: true,
      });
      toast.success("Field staff added");
      setShowAdd(false);
      setForm({ fullName: "", email: "", departmentId: "" });
      reload();
    } catch {
      toast.error("Could not add staff");
    } finally {
      setAdding(false);
    }
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
            <div className="flex items-center gap-2">
              <div className="relative">
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search staff"
                  className="pl-9 w-full sm:w-64"
                />
                <Search className="w-5 h-5 text-slate-500 absolute left-3 top-3" />
              </div>
              <Button onClick={() => setShowAdd(true)} className="shrink-0 gap-2">
                <UserPlus className="w-4 h-4" /> Add Staff
              </Button>
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

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Add Field Staff</h3>
              <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name</label>
                <Input
                  value={form.fullName}
                  onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                  placeholder="e.g. Ali Raza"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Email</label>
                <Input
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="e.g. ali.raza@smartcity.gov"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Department</label>
                <select
                  value={form.departmentId}
                  onChange={(e) => setForm((f) => ({ ...f, departmentId: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900"
                >
                  <option value="">Select department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setShowAdd(false)}>
                Cancel
              </Button>
              <Button onClick={handleAdd} disabled={adding}>
                {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />} Add Staff
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}