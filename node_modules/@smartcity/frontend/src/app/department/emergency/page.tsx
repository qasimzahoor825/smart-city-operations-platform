"use client";

import React from "react";
import Link from "next/link";
import {
  Building2,
  ShieldAlert,
  Siren,
  Users,
  Clock,
  Activity,
  MapPin,
  Flame,
  Ambulance,
  Bus,
  Bell,
  ChevronDown,
  Navigation,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { emergenciesApi } from "@/services/operations";
import { useRealtimeEmergencies } from "@/hooks/use-realtime";
import type { Emergency, EmergencyStatus } from "@/types";

const dispatchFlow: Record<string, EmergencyStatus> = {
  REPORTED: "ACKNOWLEDGED",
  ACKNOWLEDGED: "DISPATCHED",
  DISPATCHED: "ON_SCENE",
  ON_SCENE: "RESOLVED",
  RESOLVED: "RESOLVED",
};

const dispatchSteps = [
  { label: "Reported" },
  { label: "Department Notified" },
  { label: "Team Assigned" },
  { label: "Team Dispatched" },
  { label: "Arrived" },
  { label: "Resolved" },
];

const STEP_INDEX: Record<EmergencyStatus, number> = {
  REPORTED: 0,
  ACKNOWLEDGED: 1,
  DISPATCHED: 3,
  ON_SCENE: 4,
  RESOLVED: 5,
  CLOSED: 5,
};

const severityColor = (s: string) =>
  s === "CRITICAL"
    ? "text-red-700 bg-red-50 border-red-200"
    : s === "HIGH"
    ? "text-amber-700 bg-amber-50 border-amber-200"
    : "text-blue-700 bg-blue-50 border-blue-200";

const markerColor = (s: string) =>
  s === "CRITICAL"
    ? "bg-red-500 ring-red-500/30 border-red-500"
    : s === "HIGH"
    ? "bg-amber-500 ring-amber-500/30 border-amber-500"
    : "bg-blue-500 ring-blue-500/30 border-blue-500";

const typeIcon = (type: string) =>
  type === "FIRE" ? Flame : type === "MEDICAL" ? Ambulance : type === "FLOOD" ? Navigation : type === "ACCIDENT" ? Bus : ShieldAlert;

export default function EmergencyResponseCenterPage() {
  const [items, setItems] = React.useState<Emergency[]>([]);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    try {
      const res = await (emergenciesApi.list() as Promise<Emergency[]>);
      if (res.length) {
        setItems(res);
        setSelectedId((prev) => prev && res.some((e) => e.id === prev) ? prev : res[0].id);
      } else {
        setItems([]);
      }
    } catch {
      toast.error("Could not load emergencies");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  // Subscribe to live emergency events; reload instantly when one arrives.
  useRealtimeEmergencies(
    React.useCallback(() => {
      load();
    }, [load]),
  );

  // Polling fallback keeps the feed fresh when the socket is unavailable or
  // no event has fired recently (e.g. static deployments without WebSockets).
  const refreshTick = React.useCallback(() => {
    emergenciesApi.list().then((res) => { if (res.length) setItems(res); }).catch(() => undefined);
  }, []);
  const timer = React.useRef<ReturnType<typeof setInterval> | null>(null);
  React.useEffect(() => {
    timer.current = setInterval(refreshTick, 15_000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [refreshTick]);

  const active = items.filter((e) => e.status !== "RESOLVED");
  const selected = items.find((e) => e.id === selectedId) ?? active[0] ?? items[0] ?? null;

  const activeCount = items.filter((e) => ["REPORTED", "DISPATCHED", "ON_SCENE"].includes(e.status)).length;
  const criticalCount = items.filter((e) => ["CRITICAL", "HIGH"].includes(e.severity) && e.status !== "RESOLVED").length;
  const dispatchedCount = items.filter((e) => e.status === "DISPATCHED" || e.status === "ON_SCENE").length;
  const resolvedCount = items.filter((e) => e.status === "RESOLVED").length;

  const byType = (type: string) => items.filter((e) => e.type === type).length;

  const activeStep = selected ? STEP_INDEX[selected.status] : 0;

  const advance = async (emg: Emergency) => {
    const target = dispatchFlow[emg.status] ?? emg.status;
    if (emg.status === "RESOLVED") return;
    try {
      const updated = await emergenciesApi.dispatch(emg.id, { status: target });
      setItems((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      toast.success(`Emergency ${emg.id} advanced to ${target.replace("_", " ")}`);
    } catch {
      toast.error("Could not advance emergency");
    }
  };

  const resolve = async (emg: Emergency) => {
    try {
      await emergenciesApi.dispatch(emg.id, { status: "RESOLVED", note: "Incident resolved" });
      toast.success(`Incident ${emg.id} resolved`);
      load();
    } catch {
      toast.error("Could not resolve incident");
    }
  };

  const markerSlots = [
    "top-1/3 left-1/4",
    "top-1/2 left-1/2",
    "bottom-1/3 right-1/3",
    "top-1/4 right-1/4",
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-between p-4 sm:p-6 space-y-6">
      
      {/* Top Header Bar */}
      <header className="bg-white border border-red-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur shadow-sm">
        <Link href="/" className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-red-600 to-blue-600 text-white shadow-lg shadow-red-500/30">
            <Building2 className="w-6 h-6" />
          </div>
          <span className="font-extrabold text-base tracking-tight text-slate-900">
            Smart City government
          </span>
        </Link>

        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight text-center flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-red-500 animate-pulse" />
          <span>Emergency Response Command Center</span>
        </h1>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <button className="p-2 rounded-lg text-slate-500 hover:text-slate-900 relative" aria-label="Notifications">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-ping" />
          </button>
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-white font-bold text-xs flex items-center justify-center">
            EM
          </div>
          <div className="text-right text-[11px] text-slate-500">
            <div>Live feed</div>
            <div className="text-slate-700 font-mono">
              {loading ? "syncing…" : `${active.length} active`}
            </div>
          </div>
        </div>
      </header>

      {/* Top 5 Emergency KPI Cards Row matching Screenshot 09 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        
        {/* Active Emergencies */}
        <div className="bg-white border border-blue-200 rounded-2xl p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5"><Siren className="w-4 h-4 text-blue-600" /> Active Emergencies</span>
            <span>&gt;</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-black text-slate-900">{activeCount}</span>
            <div className="flex items-end gap-1 h-8">
              <div className="w-1.5 bg-blue-500 h-3 rounded-t" />
              <div className="w-1.5 bg-blue-500 h-6 rounded-t" />
              <div className="w-1.5 bg-blue-500 h-4 rounded-t" />
              <div className="w-1.5 bg-blue-500 h-8 rounded-t" />
            </div>
          </div>
        </div>

        {/* Critical Cases */}
        <div className="bg-white border border-red-200 rounded-2xl p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5"><ShieldAlert className="w-4 h-4 text-red-600" /> Critical Cases</span>
            <span>&gt;</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-black text-red-600">{criticalCount}</span>
            <div className="flex items-end gap-1 h-8">
              <div className="w-1.5 bg-red-500 h-4 rounded-t" />
              <div className="w-1.5 bg-red-500 h-8 rounded-t" />
              <div className="w-1.5 bg-red-500 h-6 rounded-t" />
            </div>
          </div>
        </div>

        {/* Response Teams Dispatched */}
        <div className="bg-white border border-cyan-200 rounded-2xl p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-cyan-600" /> Teams Dispatched</span>
            <span>&gt;</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-black text-slate-900">{dispatchedCount}</span>
            <div className="flex items-end gap-1 h-8">
              <div className="w-1.5 bg-cyan-500 h-5 rounded-t" />
              <div className="w-1.5 bg-cyan-500 h-7 rounded-t" />
              <div className="w-1.5 bg-cyan-500 h-4 rounded-t" />
            </div>
          </div>
        </div>

        {/* Resolved */}
        <div className="bg-white border border-emerald-200 rounded-2xl p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-emerald-600" /> Resolved</span>
            <span>&gt;</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600">{resolvedCount}</span>
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          </div>
        </div>

        {/* Overall Status */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Total Incidents</span>
            <span>&gt;</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-black text-slate-900">{items.length}</span>
            <Activity className="w-6 h-6 text-emerald-600" />
          </div>
        </div>

      </div>

      {/* Center Tactical Map & Incident Detail Panel matching Screenshot 09 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1">
        
        {/* Tactical GIS Dark Map Box */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-4 relative overflow-hidden shadow-sm flex flex-col justify-between">
          {/* Top Map Location Dropdown Bar */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700">
              <MapPin className="w-3.5 h-3.5 text-cyan-600" />
              <span>Metropolis</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 text-xs text-slate-600">
              <Navigation className="w-3.5 h-3.5 text-cyan-600" />
              <span>Live Mesh GIS</span>
            </div>
          </div>

          {/* Dark Tactical Grid Map Graphic Canvas */}
          <div className="relative my-4 aspect-[16/9] rounded-2xl overflow-hidden bg-[#060913] border border-slate-700 flex items-center justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-40" />
            
            {/* Vector Street Grid Overlay */}
            <svg className="absolute inset-0 w-full h-full stroke-slate-800" strokeWidth="1.5">
              <path d="M0,60 L500,60 M0,160 L500,160 M0,260 L500,260" stroke="#1e293b" />
              <path d="M100,0 L100,400 M250,0 L250,400 M400,0 L400,400" stroke="#1e293b" />
              <path d="M0,200 Q200,50 500,180" fill="none" stroke="#0284c7" strokeWidth="4" />
            </svg>

            {/* Live Tactical Incident Map Markers */}
            {loading ? (
              <span className="relative z-10 text-xs text-slate-400">Syncing live incidents…</span>
            ) : active.length === 0 ? (
              <span className="relative z-10 text-xs text-slate-400">No active incidents</span>
            ) : (
              active.slice(0, 4).map((e, i) => {
                const Icon = typeIcon(e.type);
                const position = markerSlots[i % markerSlots.length];
                return (
                  <button
                    key={e.id}
                    onClick={() => { setSelectedId(e.id); toast.info(`Focused Emergency #${e.id}`); }}
                    className={`absolute ${position} p-2 rounded-full text-white ring-4 shadow-lg cursor-pointer ${markerColor(e.severity)}`}
                    title={`${e.id} - ${e.title}`}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                );
              })
            )}
          </div>

          <div className="relative z-10 flex items-center justify-between text-xs text-slate-500">
            <span>{active.length} active incident{active.length === 1 ? "" : "s"} on the grid</span>
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> Live Telemetry Feed
            </span>
          </div>
        </div>

        {/* Right Active Emergency Detail Panel matching Screenshot 09 */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col justify-between space-y-6">
          
          <div className="space-y-4">
            {selected ? (
              <>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Siren className="w-5 h-5 text-red-500" />
                    <span>Active Emergency #{selected.id}</span>
                  </h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${severityColor(selected.severity)}`}>
                    {selected.severity}
                  </span>
                </div>

                {/* Incident Details Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block">Emergency Type</span>
                    <span className="font-bold text-white text-sm">{selected.type.replace("_", " ")}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Location</span>
                    <span className="font-semibold text-slate-200">{selected.address || "—"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Reported Time</span>
                    <span className="font-semibold text-slate-200">
                      {new Date(selected.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Priority</span>
                    <span className="font-bold text-red-400">{selected.severity}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Reported By</span>
                    <span className="font-semibold text-slate-200">{selected.reportedBy || "—"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Status</span>
                    <span className="font-semibold text-cyan-300">{selected.status.replace("_", " ")}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Live Response Timer</span>
                  <span className="text-base font-mono font-bold text-red-400 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-red-500 animate-spin" />
                    {selected.status === "RESOLVED"
                      ? "Closed"
                      : `${Math.max(0, Math.round((Date.now() - new Date(selected.createdAt).getTime()) / 60000))} min`
                    }
                  </span>
                </div>

                {/* Emergency Response Timeline Stepper matching Screenshot 09 */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">Emergency response timeline</span>
                    {selected.status !== "RESOLVED" && (
                      <button
                        onClick={() => void advance(selected)}
                        className="text-[10px] text-cyan-400 font-semibold hover:underline"
                      >
                        Advance Status
                      </button>
                    )}
                  </div>

                  <div className="relative flex items-center justify-between pt-2">
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-800 -translate-y-1/2 z-0" />
                    {dispatchSteps.map((st, i) => {
                      const isDone = i < activeStep;
                      const isCurrent = i === activeStep;
                      return (
                        <div key={i} className="relative z-10 flex flex-col items-center gap-1">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                              isDone
                                ? "bg-blue-600 text-white"
                                : isCurrent
                                ? "bg-cyan-500 text-white ring-4 ring-cyan-500/30 animate-pulse"
                                : "bg-slate-800 text-slate-500"
                            }`}
                          >
                            {isDone ? "OK" : i + 1}
                          </div>
                          <span className={`text-[9px] font-semibold text-center max-w-[50px] ${isCurrent ? "text-cyan-400 font-bold" : "text-slate-500"}`}>
                            {st.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Resolve Action */}
                  {selected.status !== "RESOLVED" ? (
                    <button
                      onClick={() => void resolve(selected)}
                      className="w-full mt-2 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 hover:bg-emerald-500/30"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Mark Incident Resolved
                    </button>
                  ) : (
                    <div className="w-full mt-2 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                      <CheckCircle2 className="w-4 h-4" />
                      Incident Resolved
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center text-sm text-slate-500 py-10">No incident selected.</div>
            )}
          </div>

        </div>

      </div>

      {/* Bottom Grid: Department Coordination Cards by real incident type matching Screenshot 09 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Police */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-md space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-white">
            <span className="flex items-center gap-1.5"><ShieldAlert className="w-4 h-4 text-blue-400" /> Police</span>
          </div>
          <div className="text-xs text-slate-400">ACCIDENT incidents: <span className="font-bold text-white">{byType("ACCIDENT")}</span></div>
          <div className="text-[11px] text-slate-500">Team availability: <span className="text-emerald-400">High</span></div>
          <div className="text-[10px] text-slate-400 border-t border-slate-800 pt-2 flex items-center justify-between">
            <span>In-transit</span>
            <span className="text-emerald-400 font-semibold">Deployed</span>
          </div>
        </div>

        {/* Fire & Rescue */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-md space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-white">
            <span className="flex items-center gap-1.5"><Flame className="w-4 h-4 text-red-500" /> Fire & Rescue</span>
          </div>
          <div className="text-xs text-slate-400">FIRE incidents: <span className="font-bold text-white">{byType("FIRE")}</span></div>
          <div className="text-[11px] text-slate-500">Team availability: <span className="text-emerald-400">Medium</span></div>
          <div className="text-[10px] text-slate-400 border-t border-slate-800 pt-2 flex items-center justify-between">
            <span>In-transit</span>
            <span className="text-emerald-400 font-semibold">Deployed</span>
          </div>
        </div>

        {/* Medical */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-md space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-white">
            <span className="flex items-center gap-1.5"><Ambulance className="w-4 h-4 text-cyan-400" /> Medical</span>
          </div>
          <div className="text-xs text-slate-400">MEDICAL incidents: <span className="font-bold text-white">{byType("MEDICAL")}</span></div>
          <div className="text-[11px] text-slate-500">Team availability: <span className="text-emerald-400">Active</span></div>
          <div className="text-[10px] text-slate-400 border-t border-slate-800 pt-2 flex items-center justify-between">
            <span>In-transit</span>
            <span className="text-emerald-400 font-semibold">Deployed</span>
          </div>
        </div>

        {/* Flood Relief */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-md space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-white">
            <span className="flex items-center gap-1.5"><Navigation className="w-4 h-4 text-emerald-400" /> Flood Relief</span>
          </div>
          <div className="text-xs text-slate-400">FLOOD incidents: <span className="font-bold text-white">{byType("FLOOD")}</span></div>
          <div className="text-[11px] text-slate-500">Team availability: <span className="text-emerald-400">Optimal</span></div>
          <div className="text-[10px] text-slate-400 border-t border-slate-800 pt-2 flex items-center justify-between">
            <span>In-transit</span>
            <span className="text-emerald-400 font-semibold">Deployed</span>
          </div>
        </div>

        {/* Public Alert */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-md space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-white">
            <span className="flex items-center gap-1.5"><ShieldAlert className="w-4 h-4 text-purple-400" /> Public Alert</span>
          </div>
          <div className="text-xs text-slate-400">PUBLIC_ALERT incidents: <span className="font-bold text-white">{byType("PUBLIC_ALERT")}</span></div>
          <div className="text-[11px] text-slate-500">Team availability: <span className="text-emerald-400">High</span></div>
          <div className="text-[10px] text-slate-400 border-t border-slate-800 pt-2 flex items-center justify-between">
            <span>In-transit</span>
            <span className="text-emerald-400 font-semibold">Deployed</span>
          </div>
        </div>

      </div>

    </div>
  );
}