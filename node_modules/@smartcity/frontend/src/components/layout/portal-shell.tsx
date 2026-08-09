"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, LogOut, LayoutDashboard, ClipboardList, CalendarClock, CreditCard, Bell, User, Settings, Map, Siren, BarChart3, FileText, HardHat, Users, Building2, type LucideIcon } from "lucide-react";
import { useRequireRole, useLogout } from "@/hooks/auth";
import { NAVIGATION, ROLE_LABELS } from "@/constants/navigation";
import { useAppSelector } from "@/store";
import { selectUser } from "@/store/slices/auth-slice";
import type { Role } from "@/types";
import type { Route } from "next";

const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard,
  ClipboardList,
  CalendarClock,
  CreditCard,
  Bell,
  User,
  Settings,
  FileText,
  Map,
  Siren,
  BarChart3,
  HardHat,
  Users,
  Building2,
};

interface PortalShellProps {
  roles: Role[];
  children: React.ReactNode;
  section: string;
}

export function PortalShell({ roles, children, section }: PortalShellProps) {
  const pathname = usePathname();
  const { allowed } = useRequireRole(...roles);
  const logout = useLogout();
  const user = useAppSelector(selectUser);

  if (!allowed) return null;

  const items = NAVIGATION.filter(
    (item) => item.roles.some((r) => roles.includes(r)) && item.href.startsWith(`/${section}`),
  );

  const displayRole = user?.role && roles.includes(user.role) ? user.role : roles[0];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <div className="bg-white/85 border-b border-slate-200 backdrop-blur-md sticky top-20 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 overflow-x-auto">
            <div className="flex items-center space-x-1 sm:space-x-2">
              {items.map((item) => {
                const IconCmp = ICONS[item.icon] ?? LayoutDashboard;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href as Route}
                    className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
                      active
                        ? "text-white bg-gradient-to-r from-sky-600 to-blue-600 shadow-md shadow-blue-500/20"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <IconCmp className="w-4 h-4 text-sky-500" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified · {ROLE_LABELS[displayRole]}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-red-600 transition-colors px-2 py-1.5 rounded-lg hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1">{children}</div>
    </div>
  );
}