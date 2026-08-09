"use client";

import React from "react";
import { Download, FileText } from "lucide-react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import { PageContainer, useAsync } from "@/components/shared/page-container";
import { complaintsApi } from "@/services/complaints";
import { assetsApi, departmentsApi, reportsApi } from "@/services/operations";
import type { ComplaintStats } from "@/services/complaints";
import { toast } from "sonner";
import type { Asset, Department } from "@/types";

export default function DepartmentReportsPage() {
  const overview = useAsync(() => reportsApi.overview(), {
    departments: 0,
    officers: 0,
    assets: 0,
    complaints: 0,
    emergencies: 0,
    appointments: 0,
    generatedAt: "",
  });
  const { data: complaints } = useAsync(() => complaintsApi.list({ limit: 200 }).then((r) => r.data), []);
  const { data: assets } = useAsync(() => assetsApi.list(), [] as Asset[]);
  const { data: departments } = useAsync(() => departmentsApi.list(), [] as Department[]);
  const [stats, setStats] = React.useState<ComplaintStats | null>(null);

  React.useEffect(() => {
    complaintsApi.stats().then(setStats).catch(() => undefined);
  }, []);

  const exportComplaints = () => {
    if (!complaints.length) {
      toast.error("No complaint data to export");
      return;
    }
    const headers = ["ID", "Title", "Category", "Status", "Priority", "Department", "Created"];
    const rows = complaints.map((c) =>
      [c.id, `"${c.title.replace(/"/g, '""')}"`, c.category, c.status, c.priority, c.departmentName ?? "", c.createdAt]
        .join(","),
    );
    downloadCsv("complaints-report.csv", [headers.join(","), ...rows].join("\n"));
  };

  const exportAssets = () => {
    if (!assets.length) {
      toast.error("No assets to export");
      return;
    }
    const headers = ["ID", "Name", "Category", "Status", "Department", "Address"];
    const rows = assets.map((a) =>
      [a.id, `"${a.name.replace(/"/g, '""')}"`, a.category, a.status, a.department, a.address].join(","),
    );
    downloadCsv("assets-report.csv", [headers.join(","), ...rows].join("\n"));
  };

  const printPdf = () => {
    window.print();
  };

  return (
    <PageContainer title="Department Audit & Reports" description="Export official municipal reports and operational metrics.">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Jump label="Departments" value={overview.data.departments} />
        <Jump label="Officers" value={overview.data.officers} />
        <Jump label="Assets" value={overview.data.assets} />
        <Jump label="Emergencies" value={overview.data.emergencies} />
        <Jump label="Appointments" value={overview.data.appointments} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card glass>
          <CardHeader>
            <CardTitle>Complaint Volume Report</CardTitle>
            <CardDescription>
              {stats ? `${stats.total} total · ${stats.resolved} resolved · ${stats.open} open` : "Loading…"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats && (
              <div className="space-y-2 text-sm">
                {Object.entries(stats.byStatus).map(([status, count]) => (
                  <div key={status} className="flex justify-between text-slate-600">
                    <span>{status}</span>
                    <span className="font-bold text-slate-900">{count}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2 mt-4">
              <Button variant="primary" size="sm" leftIcon={<Download className="w-4 h-4" />} onClick={exportComplaints}>
                Export Complaints CSV
              </Button>
              <Button variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />} onClick={exportAssets}>
                Export Assets CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card glass>
          <CardHeader>
            <CardTitle>Generate Report</CardTitle>
            <CardDescription>Produce a printable PDF snapshot of current operations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <FileText className="w-5 h-5 text-indigo-600 mt-0.5" />
              <div>
                <div className="font-semibold text-slate-900 text-sm">
                  City Operations Summary · {new Date().toLocaleDateString()}
                </div>
                <p className="text-xs text-slate-500">
                  {departments.length} departments · {assets.length} assets · {complaints.length} complaints on file
                </p>
              </div>
            </div>
            <Button variant="primary" className="w-full" onClick={printPdf}>
              <Download className="w-4 h-4" /> Print / Save as PDF
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}

function Jump({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass-card rounded-2xl p-4">
      <p className="text-2xl font-black text-slate-900">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>
  );
}

function downloadCsv(filename: string, content: string) {
  const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}