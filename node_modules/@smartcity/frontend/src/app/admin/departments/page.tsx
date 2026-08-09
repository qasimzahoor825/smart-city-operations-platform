"use client";

import React from "react";
import { Building2, Plus, X } from "lucide-react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from "@/components/ui";
import { PageContainer, useAsync } from "@/components/shared/page-container";
import { departmentsApi } from "@/services/operations";
import { toast } from "sonner";
import type { Department } from "@/types";

export default function AdminDepartmentsPage() {
  const { data: departments, loading } = useAsync(() => departmentsApi.list(), [] as Department[]);
  const [showForm, setShowForm] = React.useState(false);

  return (
    <PageContainer title="Municipal Department Configuration" description="Configure directorates, category routing rules, and department SLAs.">
      <div className="flex justify-end">
        <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowForm((s) => !s)}>
          Add Department
        </Button>
      </div>

      {showForm && <CreateDepartmentForm onCancel={() => setShowForm(false)} />}

      <Card glass>
        <CardHeader>
          <CardTitle>Departments</CardTitle>
          <CardDescription>{loading ? "Loading…" : `${departments.length} department(s)`}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {departments.map((d, i) => (
              <div key={d.id} className="glass-card rounded-2xl p-6">
                <Building2 className={`w-6 h-6 mb-2 ${i % 3 === 0 ? "text-indigo-500" : i % 3 === 1 ? "text-amber-500" : "text-red-500"}`} />
                <h3 className="text-lg font-bold text-slate-900">{d.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{d.description}</p>
                <p className="text-xs text-slate-500 mt-2">Code: {d.code}</p>
              </div>
            ))}
            {!loading && departments.length === 0 && (
              <p className="text-sm text-slate-500">No departments configured.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}

function CreateDepartmentForm({ onCancel }: { onCancel: () => void }) {
  const [name, setName] = React.useState("");
  const [code, setCode] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const submit = async () => {
    if (!name.trim() || !code.trim()) {
      toast.error("Name and code are required");
      return;
    }
    setBusy(true);
    try {
      await departmentsApi.create({ name: name.trim(), code: code.trim(), description: description.trim() });
      toast.success("Department created");
      onCancel();
    } catch {
      toast.error("Could not create department");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card glass>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>Add Department</CardTitle>
          <CardDescription>Register a new municipal directorate.</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={onCancel} aria-label="Close">
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="dept-name">Name</Label>
          <Input id="dept-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Transport Authority" />
        </div>
        <div>
          <Label htmlFor="dept-code">Code</Label>
          <Input id="dept-code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. TA" />
        </div>
        <div>
          <Label htmlFor="dept-desc">Description</Label>
          <Input id="dept-desc" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="primary" isLoading={busy} onClick={() => void submit()}>
            Create Department
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}