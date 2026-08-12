"use client";

import { AlertTriangle, Boxes, Building2, MessageSquare } from "lucide-react";

export interface StatCounts {
  complaints: number;
  assets: number;
  emergencies: number;
  facilities: number;
  total: number;
}

interface StatBarProps {
  counts: StatCounts;
}

export default function StatBar({ counts }: StatBarProps) {
  const items = [
    { label: "Active Complaints", value: counts.complaints, icon: MessageSquare, color: "bg-teal-500" },
    { label: "Public Assets", value: counts.assets, icon: Boxes, color: "bg-cyan-600" },
    { label: "Emergency Cases", value: counts.emergencies, icon: AlertTriangle, color: "bg-rose-500" },
    { label: "Gov. Facilities", value: counts.facilities, icon: Building2, color: "bg-slate-600" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 border-t border-slate-200 bg-white p-3 lg:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.label} className="flex items-center gap-3 rounded-lg px-3 py-2">
            <span className={`grid h-8 w-8 place-items-center rounded-lg text-white ${item.color}`}>
              <Icon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-lg font-black leading-none text-slate-900">{counts.total > 0 ? item.value : "—"}</p>
              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">{item.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}