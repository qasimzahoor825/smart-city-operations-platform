"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShieldAlert, User, Cpu, X } from "lucide-react";

const SELF_CHROME_ROUTES = ["/login", "/register", "/citizen", "/department", "/admin", "/officer"];

const NAV_LINKS = [
  { label: "Services", href: "#services" },
  { label: "Live Metrics", href: "#metrics" },
  { label: "Portals", href: "#portals" },
];

export function Navbar() {
  const pathname = usePathname() ?? "/";
  const [menuOpen, setMenuOpen] = useState(false);

  if (SELF_CHROME_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group min-w-0" onClick={() => setMenuOpen(false)}>
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform duration-300 shrink-0">
            <Cpu className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="font-bold text-xl tracking-tight text-slate-900 flex items-center gap-1.5 truncate">
              SmartCity <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-700 border border-sky-500/30">OS</span>
            </span>
            <p className="text-xs text-slate-500 hidden sm:block">Enterprise Municipal Platform</p>
          </div>
        </Link>

        {/* Navigation Links (desktop) */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Action Buttons (desktop) */}
        <div className="hidden md:flex items-center gap-3">
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

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 md:hidden hover:bg-slate-50"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav id="mobile-menu" className="border-t border-slate-200 bg-white/95 backdrop-blur-md px-4 py-4 md:hidden" aria-label="Mobile">
          <div className="space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="mt-3 flex flex-col gap-2.5 border-t border-slate-100 pt-3">
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <User className="w-4 h-4" />
              Sign In
            </Link>
            <Link
              href="/emergency"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
            >
              <ShieldAlert className="w-4 h-4" />
              Emergency SOS
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}