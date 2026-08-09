"use client";

import React from "react";
import { FileText, Download } from "lucide-react";
import { Card, CardTitle, CardDescription, Button, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui";
import { PageContainer, useAsync } from "@/components/shared/page-container";
import { complaintsApi } from "@/services/complaints";
import { departmentsApi, reportsApi, type ReportOverview } from "@/services/operations";
import type { Complaint, Department } from "@/types";

export default function AdminReportsPage() {
  const overview = useAsync(() => reportsApi.overview(), null as ReportOverview | null);
  const complaints = useAsync(() => complaintsApi.list({ limit: 100 }), null as { data: Complaint[] } | null);
  const departments = useAsync(() => departmentsApi.list(), null as Department[] | null);

  const onExport = () => window.print();

  const exportCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const rows = complaints.data?.data ?? [];

  return (
    <PageContainer title="Reports" description="Generate and export operational reports.">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { name: "Complaint Report", desc: `${overview.data ? `${rows.length} complaints logged` : "Volume, resolution and SLA by department."}` },
          { name: "Asset Report", desc: overview.data ? `${overview.data.assets} infrastructure assets tracked` : "Infrastructure health and maintenance status." },
          { name: "Department Report", desc: overview.data ? `${overview.data.departments} departments, ${overview.data.officers} officers` : "Performance, workload and staffing." },
          { name: "Emergency Report", desc: overview.data ? `${overview.data.emergencies} incidents on record` : "Incidents, dispatch times and outcomes." },
        ].map((r) => (
          <Card key={r.name} className="p-5 flex flex-col gap-3">
            <div className="p-2 w-fit rounded-lg border border-slate-200 bg-slate-50 text-blue-600">
              <FileText className="w-5 h-5" />
            </div>
            <CardTitle className="text-base">{r.name}</CardTitle>
            <CardDescription className="text-xs">{r.desc}</CardDescription>
            <div className="flex gap-2 mt-auto">
              <Button size="sm" onClick={onExport} className="flex-1">Print</Button>
              {r.name === "Complaint Report" && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="flex-1"
                  leftIcon={<Download className="w-3.5 h-3.5" />}
                  onClick={() => exportCSV("complaints.csv", ["id", "title", "category", "status", "priority", "createdAt"], rows.map((c) => [c.id, c.title, c.category, c.status, c.priority, c.createdAt]))}
                >
                  CSV
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <CardTitle className="mb-4">Complaint Register</CardTitle>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.slice(0, 8).map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-sky-600 text-xs">{c.id}</TableCell>
                  <TableCell className="text-slate-800">{c.title}</TableCell>
                  <TableCell className="text-slate-600">{c.status}</TableCell>
                  <TableCell className="text-slate-600">{c.priority}</TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-slate-500 text-sm py-6 text-center">No complaints yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>

        <Card className="p-6">
          <CardTitle className="mb-4">Departments</CardTitle>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(departments.data ?? []).map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="text-slate-800">{d.name}</TableCell>
                  <TableCell className="font-mono text-slate-500 text-xs">{d.code}</TableCell>
                  <TableCell className="text-slate-600 text-sm">{d.description}</TableCell>
                </TableRow>
              ))}
              {(departments.data ?? []).length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-slate-500 text-sm py-6 text-center">No departments yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </PageContainer>
  );
}
