"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Phone,
  Mail,
  Clock,
  ClipboardList,
  CalendarClock,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { PageContainer, useAsync } from "@/components/shared/page-container";
import { departmentsApi } from "@/services/operations";
import { departmentMeta } from "@/lib/departments";
import type { Department } from "@/types";

interface DepartmentStats {
  departmentId: string;
  departmentName: string;
  departmentCode: string;
  officerCount: number;
  totalComplaints: number;
  openComplaints: number;
  inProgressComplaints: number;
  resolvedComplaints: number;
  citizenCount: number;
}

function resolveDepartment(departments: Department[], slug: string): Department | undefined {
  return departments.find((d) => d.id === `dept-${slug}`);
}

export default function CitizenDepartmentDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? "";

  const { data: departments, loading: deptLoading } = useAsync(
    () => departmentsApi.list(),
    [] as Department[],
  );

  const department = React.useMemo(
    () => resolveDepartment(departments, slug),
    [departments, slug],
  );

  const [stats, setStats] = React.useState<DepartmentStats | null>(null);
  const [statsLoading, setStatsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!department) return;
    setStatsLoading(true);
    departmentsApi
      .stats(department.id)
      .then((res) => setStats(res as DepartmentStats))
      .catch(() => setStats(null))
      .finally(() => setStatsLoading(false));
  }, [department?.id]);

  const meta = departmentMeta(slug);
  const Icon = meta.icon;

  const actions = [
    { icon: ClipboardList, label: "Lodge a Grievance", href: "/citizen/complaints/new", color: "text-blue-600 bg-blue-50 border-blue-100" },
    { icon: CalendarClock, label: "Book an Appointment", href: "/citizen/appointments", color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
    { icon: MapPin, label: "View on Map", href: "/department/gis", color: "text-cyan-600 bg-cyan-50 border-cyan-100" },
  ];

  return (
    <PageContainer title={department?.name ?? "Department"} description="Department details, services and contact.">
      <Link
        href="/citizen/services"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 mb-5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Resident Services
      </Link>

      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className={`p-4 rounded-2xl border w-fit ${meta.ringClass}`}>
            <Icon className={`w-10 h-10 ${meta.iconClass}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-extrabold text-slate-900">{department?.name ?? slug}</h2>
              {department?.code && (
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400 px-2 py-1 rounded-lg bg-slate-100">
                  {department.code}
                </span>
              )}
            </div>
            <p className="text-slate-500 mt-1 leading-relaxed">
              {department?.description || "Municipal service department."}
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-4">Live Status</h3>
          {statsLoading || deptLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-10 rounded-xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : stats ? (
            <dl className="space-y-3">
              <Row label="Total complaints" value={stats.totalComplaints} />
              <Row label="Open" value={stats.openComplaints} />
              <Row label="In progress" value={stats.inProgressComplaints} />
              <Row label="Resolved" value={stats.resolvedComplaints} tone="positive" />
              <Row label="Officers" value={stats.officerCount} />
            </dl>
          ) : (
            <p className="text-sm text-slate-500">Live stats unavailable.</p>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-4">Services</h3>
          <ul className="space-y-2.5">
            {meta.services.map((s) => (
              <li key={s} className="flex items-start gap-2.5 text-sm text-slate-600">
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-teal-600" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-4">Contact</h3>
          <ul className="space-y-3 text-sm text-slate-600">
            <li className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 shrink-0 text-slate-400" />
              {meta.contact.phone}
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 shrink-0 text-slate-400" />
              {meta.contact.email}
            </li>
            <li className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 shrink-0 text-slate-400" />
              {meta.contact.hours}
            </li>
          </ul>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-4">Actions</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          {actions.map((a) => {
            const Aicon = a.icon;
            return (
              <Link
                key={a.href}
                href={a.href}
                className={`flex items-center gap-3 rounded-2xl border p-4 font-medium text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${a.color}`}
              >
                <Aicon className="w-5 h-5" />
                {a.label}
              </Link>
            );
          })}
        </div>
      </div>
    </PageContainer>
  );
}

function Row({ label, value, tone }: { label: string; value: number; tone?: "positive" }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2.5">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className={`text-lg font-bold ${tone === "positive" ? "text-emerald-600" : "text-slate-900"}`}>
        {value}
      </dd>
    </div>
  );
}
