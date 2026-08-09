"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui";
import { PageContainer } from "@/components/shared/page-container";
import { complaintsApi } from "@/services/complaints";
import type { Complaint } from "@/types";

export default function AdminComplaintsPage() {
  const [items, setItems] = React.useState<Complaint[]>([]);

  React.useEffect(() => {
    complaintsApi.list({ limit: 50 }).then((res) => setItems(res.data)).catch(() => undefined);
  }, []);

  return (
    <PageContainer title="Complaints" description="Citywide grievance oversight, SLA and resolution tracking.">
      <Card glass={false}>
        <CardHeader>
          <CardTitle>All Complaints</CardTitle>
          <CardDescription>{items.length} total across departments</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-sky-600 text-xs">{c.id}</TableCell>
                  <TableCell className="font-semibold text-slate-900 text-sm">{c.title}</TableCell>
                  <TableCell className="text-slate-600">{c.category}</TableCell>
                  <TableCell>
                    <Badge variant={c.priority === "CRITICAL" ? "destructive" : c.priority === "HIGH" ? "warning" : "secondary"}>
                      {c.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={c.status === "RESOLVED" ? "success" : c.status === "IN_PROGRESS" ? "warning" : "default"}>
                      {c.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-slate-500 text-sm text-center py-6">
                    Connect the API services to load real complaint data.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageContainer>
  );
}