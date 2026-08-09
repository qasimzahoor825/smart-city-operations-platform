"use client";

import React from "react";
import { UserPlus, X } from "lucide-react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label, Badge } from "@/components/ui";
import { PageContainer, useAsync } from "@/components/shared/page-container";
import { usersApi, departmentsApi } from "@/services/operations";
import { toast } from "sonner";
import type { Department, Officer } from "@/types";

export default function AdminUsersPage() {
  const { data: users, loading } = useAsync(() => usersApi.list({ limit: 100 }).then((r) => r.data), [] as Officer[]);
  const { data: departments } = useAsync(() => departmentsApi.list(), [] as Department[]);
  const [showForm, setShowForm] = React.useState(false);

  const toggleActive = async (u: Officer) => {
    try {
      await usersApi.toggleActive(u.id, !u.active);
      toast.success(`${u.fullName} ${u.active ? "deactivated" : "activated"}`);
    } catch {
      toast.error("Could not update user");
    }
  };

  return (
    <PageContainer title="User & Identity Administration" description="Manage accounts for citizens, department officials, and system administrators.">
      <div className="flex justify-end">
        <Button variant="primary" leftIcon={<UserPlus className="w-4 h-4" />} onClick={() => setShowForm((s) => !s)}>
          Provision New User
        </Button>
      </div>

      {showForm && <CreateUserForm departments={departments} onCancel={() => setShowForm(false)} />}

      <Card glass>
        <CardHeader>
          <CardTitle>Accounts</CardTitle>
          <CardDescription>{loading ? "Loading…" : `${users.length} user(s)`}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="text-xs uppercase bg-slate-50 text-slate-500">
                <tr>
                  <th className="p-4 rounded-l-xl">User</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Department</th>
                  <th className="p-4 rounded-r-xl">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="p-4 font-semibold text-slate-900">{u.fullName}</td>
                    <td className="p-4 text-xs text-slate-500">{u.email}</td>
                    <td className="p-4">
                      <Badge variant={u.role === "SUPER_ADMIN" ? "destructive" : u.role === "CITIZEN" ? "info" : "warning"}>
                        {u.role}
                      </Badge>
                    </td>
                    <td className="p-4 text-xs text-slate-500">{u.departmentName ?? "—"}</td>
                    <td className="p-4">
                      <button onClick={() => void toggleActive(u)} className={`text-xs font-bold px-2.5 py-1 rounded-full ${u.active ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50"}`}>
                        {u.active ? "Active" : "Disabled"}
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

function CreateUserForm({ departments, onCancel }: { departments: Department[]; onCancel: () => void }) {
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState("OFFICER");
  const [departmentId, setDepartmentId] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const submit = async () => {
    if (!fullName.trim() || !email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    setBusy(true);
    try {
      await usersApi.provision({ fullName, email, role, departmentId, active: true });
      toast.success("User provisioned");
      onCancel();
    } catch {
      toast.error("Could not provision user");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card glass>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>Provision New User</CardTitle>
          <CardDescription>Create an officer or department head account.</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={onCancel} aria-label="Close">
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="nu-name">Full Name</Label>
          <Input id="nu-name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="nu-email">Email</Label>
          <Input id="nu-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="nu-role">Role</Label>
            <select id="nu-role" value={role} onChange={(e) => setRole(e.target.value)} className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20">
              {["OFFICER", "DEPARTMENT_HEAD", "CITIZEN", "SUPER_ADMIN"].map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="nu-dept">Department</Label>
            <select id="nu-dept" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20">
              <option value="">None</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="primary" isLoading={busy} onClick={() => void submit()}>
            Create User
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}