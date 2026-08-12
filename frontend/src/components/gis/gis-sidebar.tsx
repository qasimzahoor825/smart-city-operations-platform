"use client";

import Link from "next/link";
import {
  BarChart3,
  BriefcaseBusiness,
  Building2,
  CircleGauge,
  FileClock,
  Globe2,
  Landmark,
  LogOut,
  MessageSquare,
  Settings,
  ShieldCheck,
  Siren,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const ADMIN_NAV: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: CircleGauge },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Roles & Permissions", href: "/admin/roles", icon: ShieldCheck },
  { label: "Departments", href: "/admin/departments", icon: Landmark },
  { label: "Complaints", href: "/admin/complaints", icon: MessageSquare },
  { label: "Assets", href: "/admin/assets", icon: BriefcaseBusiness },
  { label: "Emergency", href: "/admin/emergency", icon: Siren },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "GIS Portal", href: "/admin/gis", icon: Globe2 },
  { label: "Audit Logs", href: "/admin/reports", icon: FileClock },
  { label: "System Settings", href: "/admin/settings", icon: Settings },
];

export default function GisSidebar({ active }: { active: string }) {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-800 bg-[#0A192F] text-white lg:flex">
      <Link href="/" className="flex items-center gap-3 border-b border-white/10 px-4 py-4">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-tr from-teal-400 to-sky-500 shadow-lg shadow-teal-500/30">
          <Building2 className="h-5 w-5" />
        </span>
        <span className="text-sm font-black leading-tight">
          Digital Pakistan
          <span className="block text-[10px] font-semibold text-teal-300">Government Operations</span>
        </span>
      </Link>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {ADMIN_NAV.map((item) => {
          const Icon = item.icon;
          const selected = item.label === active;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                selected
                  ? "border-l-4 border-sky-400 bg-teal-500 text-white shadow-lg shadow-teal-500/20"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className={`h-4 w-4 ${selected ? "text-white" : "text-slate-400"}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-white/10 p-4">
        <div className="rounded-lg bg-white/5 p-3 text-[11px] leading-relaxed text-slate-300">
          <p className="font-bold text-teal-300">GIS Service Status</p>
          <p className="mt-1 flex items-center gap-1.5">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            Connected · Live tiles
          </p>
        </div>
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-slate-300 transition-colors hover:bg-white/10 hover:text-white">
          <LogOut className="h-4 w-4 text-slate-400" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
