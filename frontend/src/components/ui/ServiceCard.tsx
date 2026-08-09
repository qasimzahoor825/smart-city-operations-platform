import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Route } from "next";

export interface ServiceCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  badge?: string;
  category?: string;
  iconBgColor?: string;
}

export function ServiceCard({
  title,
  description,
  icon: Icon,
  href,
  badge,
  category,
  iconBgColor = "bg-sky-100 text-sky-600 border-sky-200",
}: ServiceCardProps) {
  return (
    <Link href={href as Route} className="group block h-full">
      <div className="glass-card rounded-2xl p-6 h-full flex flex-col justify-between relative overflow-hidden">
        {/* Subtle hover accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div>
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className={`p-3 rounded-xl border ${iconBgColor} group-hover:scale-110 transition-transform duration-300`}>
              <Icon className="w-6 h-6" />
            </div>

            {badge && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                {badge}
              </span>
            )}
          </div>

          {category && (
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-1 block">
              {category}
            </span>
          )}

          <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-sky-600 transition-colors">
            {title}
          </h3>

          <p className="text-sm text-slate-500 leading-relaxed mb-6">
            {description}
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm font-semibold text-sky-600 group-hover:translate-x-1.5 transition-transform duration-300">
          <span>Access Portal</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </Link>
  );
}
