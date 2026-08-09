"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldAlert, User, Cpu } from "lucide-react";

const SELF_CHROME_ROUTES = ["/login", "/register", "/citizen", "/department", "/admin", "/officer"];

export function Navbar() {
  const pathname = usePathname();
  if (SELF_CHROME_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform duration-300">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <span className="font-bold text-xl tracking-tight text-slate-900 flex items-center gap-1.5">
              SmartCity <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-700 border border-sky-500/30">OS</span>
            </span>
            <p className="text-xs text-slate-500 hidden sm:block">Enterprise Municipal Platform</p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="#services" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Services
          </Link>
          <Link href="#metrics" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Live Metrics
          </Link>
          <Link href="#portals" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Portals
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-all"
          >
            <User className="w-4 h-4" />
            <span>Sign In</span>
          </Link>

          <Link
            href="/emergency"
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:border-red-300 transition-all shadow-sm"
          >
            <ShieldAlert className="w-4 h-4 animate-pulse" />
            <span>Emergency SOS</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
