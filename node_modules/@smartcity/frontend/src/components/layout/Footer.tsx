"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cpu, ShieldCheck, Heart, Radio } from "lucide-react";

const SELF_CHROME_ROUTES = ["/login", "/register", "/citizen", "/department", "/admin", "/officer"];

export function Footer() {
  const pathname = usePathname();
  const [year, setYear] = React.useState(2026);

  React.useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  if (SELF_CHROME_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
    return null;
  }

  return (
    <footer className="border-t border-slate-200 bg-white/80 backdrop-blur-md text-slate-500 py-12 mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-gradient-to-tr from-sky-500 to-blue-600 text-white shadow-md shadow-blue-500/30">
                <Cpu className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-slate-900">SmartCity OS</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Unified digital infrastructure powering next-generation municipal governance, citizen safety, and automated public utilities.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full w-fit">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>All Systems Operational (99.99% Uptime)</span>
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="font-semibold text-slate-900 text-sm mb-4">Citizen Portals</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/citizen/complaints" className="hover:text-sky-600 transition-colors">Report Issues & Grievances</Link></li>
              <li><Link href="/citizen/payments" className="hover:text-sky-600 transition-colors">Utility Bill Payments</Link></li>
              <li><Link href="/citizen/appointments" className="hover:text-sky-600 transition-colors">Municipal Appointments</Link></li>
              <li><Link href="/citizen/dashboard" className="hover:text-sky-600 transition-colors">Public Transport Tracker</Link></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="font-semibold text-slate-900 text-sm mb-4">Departments</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/department/dashboard" className="hover:text-sky-600 transition-colors">Department Operations Hub</Link></li>
              <li><Link href="/department/emergency" className="hover:text-sky-600 transition-colors">Emergency Command Center</Link></li>
              <li><Link href="/department/gis" className="hover:text-sky-600 transition-colors">GIS Spatial Analytics</Link></li>
              <li><Link href="/admin/dashboard" className="hover:text-sky-600 transition-colors">System Admin & Roles</Link></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="font-semibold text-slate-900 text-sm mb-4">Compliance & Security</h4>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-sky-600" /> End-to-End Encrypted Data</li>
              <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-sky-600" /> ISO 27001 Certified Platform</li>
              <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-sky-600" /> Open API Standard v2.0</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs gap-4">
          <p>(c) {year} Enterprise Smart City Platform. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built for resilient, sustainable, and connected modern cities <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" />
          </p>
        </div>
      </div>
    </footer>
  );
}
