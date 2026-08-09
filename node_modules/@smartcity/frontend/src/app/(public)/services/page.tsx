import React from "react";
import { Building2 } from "lucide-react";
import { ServiceCard } from "@/components/ui/ServiceCard";
import { publicGet } from "@/services/public-api";
import type { Department } from "@/types";

// Render on the server per request so live department counts are always fresh.
export const dynamic = "force-dynamic";

export default async function PublicServicesCatalogPage() {
  const departments = (await publicGet<Department[]>("/departments")) ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Municipal Services</h1>
        <p className="text-slate-500 text-sm mt-1">
          City services organised by the live municipal departments registered on SmartCity OS.
        </p>
      </div>

      {departments.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center text-slate-500 text-sm">
          No departments have been registered yet. Services will appear here as departments are onboarded.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {departments.map((department) => (
            <ServiceCard
              key={department.id}
              icon={Building2}
              title={department.name}
              description={department.description || "Municipal service department."}
              href="/department/dashboard"
              category={department.code}
            />
          ))}
        </div>
      )}
    </div>
  );
}