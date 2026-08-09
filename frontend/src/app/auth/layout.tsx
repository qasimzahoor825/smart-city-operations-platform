import React from "react";
import Link from "next/link";
import { Cpu } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Brand Link */}
      <div className="mb-8 z-10">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform duration-300">
            <Cpu className="w-6 h-6" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">
            SmartCity <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-700 border border-sky-500/30">OS</span>
          </span>
        </Link>
      </div>

      <div className="w-full max-w-md z-10">{children}</div>
    </div>
  );
}
