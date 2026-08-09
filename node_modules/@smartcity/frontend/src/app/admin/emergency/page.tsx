"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Button } from "@/components/ui";
import { PageContainer } from "@/components/shared/page-container";
import { emergenciesApi } from "@/services/operations";
import { toast } from "sonner";
import type { Emergency } from "@/types";

export default function AdminEmergencyPage() {
  const [items, setItems] = React.useState<Emergency[]>([]);

  const load = () => {
    emergenciesApi.list().then(setItems).catch(() => undefined);
  };
  React.useEffect(load, []);

  const advance = async (emg: Emergency) => {
    const nextFlow = { REPORTED: "DISPATCHED", DISPATCHED: "ON_SCENE", ON_SCENE: "RESOLVED", RESOLVED: "RESOLVED" } as Record<string, string>;
    const target = nextFlow[emg.status];
    try {
      const updated = await emergenciesApi.dispatch(emg.id, { status: target });
      setItems((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      toast.success(`Dispatch → ${target.replace("_", " ")}`);
    } catch {
      toast.error("Could not update dispatch");
    }
  };

  return (
    <PageContainer title="Emergency Command" description="City-wide emergency incidents and dispatch status.">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {["REPORTED", "DISPATCHED", "ON_SCENE"].map((s) => (
          <div key={s} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs text-slate-500">{s.replace("_", " ")}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{items.filter((e) => e.status === s).length}</p>
          </div>
        ))}
      </div>

      <Card glass={false}>
        <CardHeader>
          <CardTitle>Active Incidents</CardTitle>
          <CardDescription>Advance an incident through its dispatch lifecycle.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Incident</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>
                    <Badge variant={e.type === "FIRE" ? "destructive" : e.type === "MEDICAL" ? "info" : "warning"}>{e.type}</Badge>
                  </TableCell>
                  <TableCell className="font-semibold text-slate-900">{e.title}</TableCell>
                  <TableCell>
                    <Badge variant={e.severity === "CRITICAL" ? "destructive" : "warning"}>{e.severity}</Badge>
                  </TableCell>
                  <TableCell className="text-slate-600">{e.status.replace("_", " ")}</TableCell>
                  <TableCell>
                    {e.status !== "RESOLVED" && (
                      <Button variant="ghost" size="sm" onClick={() => void advance(e)}>Advance</Button>
                    )}
                    {e.status === "RESOLVED" && <Badge variant="success">Resolved</Badge>}
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-slate-500 text-center py-6">No incidents.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageContainer>
  );
}