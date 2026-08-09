"use client";

import React from "react";
import { ShieldCheck, Check, Minus } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui";
import { PageContainer, useAsync } from "@/components/shared/page-container";
import { rolesApi, type RoleInfo } from "@/services/operations";

const MODULE_LABELS: Record<string, string> = {
  complaints: "Complaints",
  payments: "Payments & Bills",
  appointments: "Appointments",
  emergencies: "Emergency Response",
  assets: "Assets",
  gis: "GIS Spatial Map",
  news: "Public Advisories",
  events: "Events",
  members: "Members",
  users: "User Admin",
  departments: "Department Admin",
  roles: "Roles",
  reports: "Analytics & Reports",
  statistics: "Statistics",
  profile: "Profile",
  notifications: "Notifications",
  system: "Platform Settings",
};

export default function AdminPermissionsPage() {
  const { data: roles, loading } = useAsync(() => rolesApi.list(), [] as RoleInfo[]);

  const roleNames = roles.map((r) => r.role);
  const modules = [...new Set(roles.flatMap((r) => r.claims.map((c) => c.resource)))]
    .filter((m) => m !== "*")
    .sort();

  const hasAccess = (role: string, module: string): boolean => {
    const info = roles.find((r) => r.role === role);
    if (!info) return false;
    if (info.permissions.includes("*")) return true;
    return info.claims.some((c) => c.resource === module);
  };

  return (
    <PageContainer title="Role & Permission Matrix" description="Matrix of access rights per role across the SmartCity platform.">
      <Card glass>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            Access Control Matrix
          </CardTitle>
          <CardDescription>
            {loading
              ? "Loading permission claims from the RBAC registry…"
              : "RBAC claims are served live from the roles registry. Enforcement is applied by the gateway (JWT roles) and portal shells."}
          </CardDescription>
        </CardHeader>
        <div className="p-6 overflow-x-auto">
          {modules.length === 0 ? (
            <div className="text-center text-slate-500 text-sm py-6">
              No permission claims available yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Module</TableHead>
                  {roleNames.map((r) => (
                    <TableHead key={r} className="text-center">{r.replace("_", " ")}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {modules.map((module) => (
                  <TableRow key={module}>
                    <TableCell className="text-slate-800">{MODULE_LABELS[module] ?? module}</TableCell>
                    {roleNames.map((r) => (
                      <TableCell key={r} className="text-center">
                        {hasAccess(r, module) ? (
                          <Check className="w-4 h-4 text-emerald-500 inline" />
                        ) : (
                          <Minus className="w-4 h-4 text-slate-600 inline" />
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>
    </PageContainer>
  );
}