"use client";

import { HandHeart, Landmark, MessageSquare, Siren, type LucideIcon } from "lucide-react";

export type ServiceKey = "citizen" | "complaint" | "emergency" | "asset";

interface ServiceDef {
  key: ServiceKey;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  accent: string;
  badge: string | number;
}

export interface ServiceStats {
  complaints: number;
  assets: number;
  emergencies: number;
  citizens: number;
}

interface ServiceCardsProps {
  stats: ServiceStats;
  onOpen: (key: ServiceKey) => void;
}

export default function ServiceCards({ stats, onOpen }: ServiceCardsProps) {
  const services: ServiceDef[] = [
    {
      key: "citizen",
      title: "Citizen Services",
      subtitle: "Portals, bills & appointments",
      icon: HandHeart,
      accent: "from-sky-500 to-blue-700",
      badge: stats.citizens,
    },
    {
      key: "complaint",
      title: "Complaint Management",
      subtitle: "Submit, track & resolve issues",
      icon: MessageSquare,
      accent: "from-teal-500 to-teal-700",
      badge: stats.complaints,
    },
    {
      key: "emergency",
      title: "Emergency Response",
      subtitle: "Dispatch rescue & fire units",
      icon: Siren,
      accent: "from-rose-500 to-red-700",
      badge: stats.emergencies,
    },
    {
      key: "asset",
      title: "Public Asset Management",
      subtitle: "Water, parks, infrastructure",
      icon: Landmark,
      accent: "from-emerald-500 to-emerald-700",
      badge: stats.assets,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {services.map((service) => {
        const Icon = service.icon;
        return (
          <button
            key={service.key}
            onClick={() => onOpen(service.key)}
            className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md"
          >
            <span
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-to-tr ${service.accent} text-white shadow-md`}
            >
              <Icon className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-xs font-black text-slate-900">{service.title}</span>
              <span className="block truncate text-[10px] font-medium text-slate-500">{service.subtitle}</span>
            </span>
            <span className="ml-auto grid h-6 min-w-[24px] place-items-center rounded-full bg-slate-100 px-1.5 text-[11px] font-black text-slate-700 group-hover:bg-teal-50 group-hover:text-teal-700">
              {service.badge}
            </span>
          </button>
        );
      })}
    </div>
  );
}