"use client";

import React from "react";
import Link from "next/link";
import {
  ClipboardList,
  CreditCard,
  CalendarClock,
  Bell,
  MapPin,
  ShieldAlert,
} from "lucide-react";
import { PageContainer, useAsync } from "@/components/shared/page-container";
import { departmentsApi } from "@/services/operations";
import { departmentSlug, departmentMeta } from "@/lib/departments";
import type { Department } from "@/types";

const QUICK_LINKS = [
  { icon: ClipboardList, title: "Lodge a Grievance", desc: "Report potholes, water leakage, street lights and more.", href: "/citizen/complaints/new", iconColor: "text-blue-600", ring: "bg-blue-50 text-blue-600 border-blue-100" },
  { icon: CreditCard, title: "Pay Utility Bills", desc: "Settle water, property and municipal dues securely.", href: "/citizen/payments", iconColor: "text-amber-600", ring: "bg-amber-50 text-amber-600 border-amber-100" },
  { icon: CalendarClock, title: "Book Appointments", desc: "Schedule meetings with municipal departments.", href: "/citizen/appointments", iconColor: "text-emerald-600", ring: "bg-emerald-50 text-emerald-600 border-emerald-100" },
  { icon: Bell, title: "Advisories & Alerts", desc: "Stay up to date with city-wide notifications.", href: "/citizen/notifications", iconColor: "text-purple-600", ring: "bg-purple-50 text-purple-600 border-purple-100" },
  { icon: ShieldAlert, title: "Report an Emergency", desc: "Raise an SOS for fire, medical or flood incidents.", href: "/emergency", iconColor: "text-red-600", ring: "bg-red-50 text-red-600 border-red-100" },
  { icon: MapPin, title: "Track GIS Status", desc: "Visualize municipal assets and complaints on the map.", href: "/department/gis", iconColor: "text-cyan-600", ring: "bg-cyan-50 text-cyan-600 border-cyan-100" },
] as const;

export default function CitizenServicesPage() {
  const { data: departments, loading } = useAsync(() => departmentsApi.list(), [] as Department[]);

  return (
    <PageContainer title="Resident Services" description="Everything you need, in one place — from grievances to emergency response.">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Departments ({departments.length})
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {loading && departments.length === 0
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-3xl border border-slate-200 bg-white p-7 animate-pulse h-32" />
            ))
          : departments.map((d) => {
              const meta = departmentMeta(departmentSlug(d));
              const Icon = meta.icon;
              return (
                <Link
                  key={d.id}
                  href={`/citizen/departments/${departmentSlug(d)}`}
                  className="group rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-900/5 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  <div className={`p-3 rounded-xl border w-fit mb-4 ${meta.ringClass}`}>
                    <Icon className={`w-6 h-6 ${meta.iconClass}`} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{d.name}</h3>
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed">{d.description || "Municipal service department."}</p>
                </Link>
              );
            })}
        {!loading && departments.length === 0 && (
          <div className="col-span-full text-center text-slate-500 text-sm py-10">
            No departments have been registered yet.
          </div>
        )}
      </div>

      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Quick Actions
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {QUICK_LINKS.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.href}
              href={s.href}
              className="group rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-900/5 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              <div className={`p-3 rounded-xl border w-fit mb-4 ${s.ring}`}>
                <Icon className={`w-6 h-6 ${s.iconColor}`} />
              </div>
              <h3 className="text-base font-bold text-slate-900">{s.title}</h3>
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">{s.desc}</p>
            </Link>
          );
        })}
      </div>
    </PageContainer>
  );
}
