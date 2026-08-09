"use client";

import React from "react";
import Link from "next/link";
import { ClipboardList, CreditCard, CalendarClock, Bell, MapPin, ShieldAlert, Building2 } from "lucide-react";
import { PageContainer, useAsync } from "@/components/shared/page-container";
import { departmentsApi } from "@/services/operations";
import type { Department } from "@/types";

const QUICK_LINKS = [
  { icon: ClipboardList, title: "Lodge a Grievance", desc: "Report potholes, water leakage, street lights and more.", href: "/citizen/complaints", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  { icon: CreditCard, title: "Pay Utility Bills", desc: "Settle water, property and municipal dues securely.", href: "/citizen/payments", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
  { icon: CalendarClock, title: "Book Appointments", desc: "Schedule meetings with municipal departments.", href: "/citizen/appointments", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  { icon: Bell, title: "Advisories & Alerts", desc: "Stay up to date with city-wide notifications.", href: "/citizen/notifications", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
  { icon: ShieldAlert, title: "Report an Emergency", desc: "Raise an SOS for fire, medical or flood incidents.", href: "/emergency", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
  { icon: MapPin, title: "Track GIS Status", desc: "Visualize municipal assets and complaints on the map.", href: "/department/gis", color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20" },
] as const;

export default function CitizenServicesPage() {
  const { data: departments, loading } = useAsync(() => departmentsApi.list(), [] as Department[]);

  return (
    <PageContainer title="Resident Services" description="Everything you need, in one place — from grievances to emergency response.">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Departments ({departments.length})
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {loading && departments.length === 0
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 animate-pulse h-28" />
            ))
          : departments.map((d) => (
              <Link key={d.id} href="/citizen/appointments" className="group">
                <div className="rounded-3xl border p-6 bg-slate-900/60 hover:bg-slate-900 transition-all h-full bg-teal-500/10 border-teal-500/20">
                  <div className="p-3 rounded-xl border w-fit mb-4 bg-teal-500/10 border-teal-500/20">
                    <Building2 className="w-6 h-6 text-teal-400" />
                  </div>
                  <h3 className="text-base font-bold text-white">{d.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{d.description || "Municipal service department."}</p>
                </div>
              </Link>
            ))}
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
            <Link key={s.href} href={s.href} className="group">
              <div className={`rounded-3xl border p-6 bg-slate-900/60 hover:bg-slate-900 transition-all h-full ${s.bg}`}>
                <div className={`p-3 rounded-xl border w-fit mb-4 ${s.bg}`}>
                  <Icon className={`w-6 h-6 ${s.color}`} />
                </div>
                <h3 className="text-base font-bold text-white">{s.title}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{s.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </PageContainer>
  );
}