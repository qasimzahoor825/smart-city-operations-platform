import React from "react";
import { Mail, MapPin } from "lucide-react";
import { publicGet } from "@/services/public-api";
import type { Department } from "@/types";

// Render on the server per request so live department contacts are always fresh.
export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const departments = (await publicGet<Department[]>("/departments")) ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="max-w-2xl mx-auto space-y-4 text-center">
        <h1 className="text-4xl font-extrabold text-slate-900">Contact City Hall</h1>
        <p className="text-slate-500 text-sm">
          Reach out to municipal departments directly or visit counter offices in person.
        </p>
      </div>

      <div className="glass-card rounded-3xl p-8 max-w-xl mx-auto space-y-4 text-sm text-slate-600">
        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-sky-600" /> Municipal Plaza, 100 Civic Center Way
        </div>
        <div className="flex items-center gap-3">
          <Mail className="w-5 h-5 text-sky-600" /> support@smartcity.gov
        </div>
      </div>

      {departments.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Department Contacts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((department) => (
              <div key={department.id} className="glass-card rounded-2xl p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">{department.name}</h3>
                  <span className="text-xs font-bold text-sky-600">{department.code}</span>
                </div>
                <p className="text-xs text-slate-500">{department.description}</p>
                <p className="text-[11px] text-slate-500">
                  Enquiries desk: <span className="text-slate-700">contact@{department.code.toLowerCase()}.city</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}