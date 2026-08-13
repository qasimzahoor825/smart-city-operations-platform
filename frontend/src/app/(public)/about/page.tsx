import React from "react";
import { publicGet, type PublicOverview } from "@/services/public-api";
import type { Department } from "@/types";

const STAT_META: { key: keyof PublicOverview; label: string }[] = [
  { key: "departments", label: "Departments" },
  { key: "officers", label: "Officers & Staff" },
  { key: "complaints", label: "Complaints Handled" },
  { key: "emergencies", label: "Emergencies Dispatched" },
  { key: "appointments", label: "Citizen Appointments" },
  { key: "assets", label: "City Assets Registered" },
];

// Render on the server with 60s ISR revalidation so live stats stay fresh but pages are cached.
export const revalidate = 60;

export default async function AboutPage() {
  const [overview, departments] = await Promise.all([
    publicGet<PublicOverview>("/reports/public/overview"),
    publicGet<Department[]>("/departments/public"),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-4xl font-extrabold text-slate-900">About SmartCity OS</h1>
        <p className="text-slate-600 text-lg">
          The Enterprise Smart City Platform is an open, resilient digital framework empowering municipal
          governments to automate governance, streamline public safety, and connect citizens seamlessly.
        </p>
      </div>

      {overview ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {STAT_META.map((metric) => (
            <div key={metric.label} className="glass-card rounded-2xl p-5 text-center space-y-1">
              <div className="text-3xl font-black text-slate-900">{overview[metric.key] ?? 0}</div>
              <div className="text-[11px] text-slate-500 font-medium">{metric.label}</div>
            </div>
          ))}
        </div>
      ) : null}

      {departments && departments.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Municipal Departments</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {departments.map((department) => (
              <div key={department.id} className="glass-card rounded-2xl p-6 space-y-2">
                <div className="text-xs font-bold text-sky-600 uppercase tracking-wide">{department.code}</div>
                <h3 className="text-lg font-bold text-slate-900">{department.name}</h3>
                <p className="text-xs text-slate-500">{department.description}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}