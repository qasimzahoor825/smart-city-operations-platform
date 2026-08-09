"use client";

import React from "react";
import { ShieldCheck, Lock, User, Building2, Siren } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge } from "@/components/ui";
import { PageContainer, useAsync } from "@/components/shared/page-container";
import { usersApi } from "@/services/operations";
import { authApi } from "@/services/auth";
import type { Officer } from "@/types";

const ROLE_INFO: { role: string; icon: React.ReactNode; description: string; accent: string }[] = [
  { role: "CITIZEN", icon: <User className="w-5 h-5" />, description: "Submit complaints, track status, receive notifications.", accent: "text-blue-400" },
  { role: "OFFICER", icon: <Siren className="w-5 h-5" />, description: "Review and resolve assigned complaints and tasks.", accent: "text-amber-400" },
  { role: "DEPARTMENT_HEAD", icon: <Building2 className="w-5 h-5" />, description: "Assign tasks, monitor performance, escalate cases.", accent: "text-indigo-400" },
  { role: "SUPER_ADMIN", icon: <ShieldCheck className="w-5 h-5" />, description: "Full access to users, departments, analytics, settings.", accent: "text-purple-400" },
];

export default function AdminRolesPage() {
  const { data: users, loading } = useAsync(() => usersApi.list({ limit: 100 }).then((r) => r.data), [] as Officer[]);
  const { data: roles } = useAsync(
    () => authApi.getRoles().catch(() => [] as string[]),
    [] as string[],
  );

  const countByRole = (role: string) => users.filter((u) => u.role === role).length;

  return (
    <PageContainer title="Roles & Permissions" description="Review role-based access control and user distribution.">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ROLE_INFO.map((r) => (
          <Card key={r.role} glass>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className={r.accent}>{r.icon}</span> {r.role}
              </CardTitle>
              <CardDescription>{r.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <Badge variant={r.role === "SUPER_ADMIN" ? "destructive" : "info"}>{countByRole(r.role)} user(s)</Badge>
              <Lock className="w-4 h-4 text-slate-500" />
            </CardContent>
          </Card>
        ))}
      </div>

      {!loading && roles.length > 0 && (
        <div className="text-xs text-slate-500">
          Verified role registry via RBAC: {roles.join(", ")}
        </div>
      )}
    </PageContainer>
  );
}