import React from "react";
import { ShieldAlert } from "lucide-react";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Advisory Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 border-b border-blue-500/20 py-2 px-4 text-center text-xs text-blue-200 font-medium flex items-center justify-center gap-2">
        <ShieldAlert className="w-4 h-4 text-blue-400 shrink-0" />
        <span>Official Enterprise Smart City Portal • Real-Time Telemetry Operational</span>
      </div>

      <div className="flex-1">{children}</div>
    </div>
  );
}
