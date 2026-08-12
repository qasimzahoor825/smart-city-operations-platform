"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Bell,
  Briefcase,
  ChevronDown,
  Home,
  Layers,
  LogOut,
  Map,
  Satellite,
  MapPinned,
  Search,
  Settings,
  Loader2,
} from "lucide-react";

import { gisApi } from "@/services/gis";
import type { MapMarker } from "@/types";

const GisMap = dynamic(() => import("@/components/gis/gis-map"), { ssr: false, loading: () => <MapLoading /> });

const TYPES = ["complaint", "asset", "hospital", "police", "emergency"] as const;

const TYPE_LABEL: Record<string, string> = {
  complaint: "Complaint",
  asset: "Asset",
  hospital: "Hospital",
  police: "Police",
  emergency: "Emergency",
};

const TYPE_COLOR: Record<string, string> = {
  complaint: "#0d9488",
  asset: "#155e75",
  hospital: "#4f46e5",
  police: "#1f2937",
  emergency: "#dc2626",
};

export default function DepartmentGISPage() {
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [layers, setLayers] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<MapMarker[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<MapMarker | null>(null);
  const [focus, setFocus] = useState<{ latitude: number; longitude: number; nonce: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [mapType, setMapType] = useState<"streets" | "satellite">("streets");
  const [visibleLayers, setVisibleLayers] = useState<Record<string, boolean>>({
    complaint: true,
    asset: true,
    hospital: true,
    police: true,
    emergency: true,
  });
  const [busy, setBusy] = useState(false);

  async function loadAll() {
    const [mk, st, ly] = await Promise.all([
      gisApi.markers(),
      gisApi.stats().catch(() => null),
      gisApi.layers().catch(() => []),
    ]);
    setMarkers(mk);
    if (st) setStats(st.byType ?? {});
    setLayers(ly.map((l) => l.name));
    setLastUpdated(new Date());
    setLoading(false);
  }

  // Initial load.
  useEffect(() => {
    loadAll().catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Live polling — refresh GIS data every 30 seconds for near-real-time state.
  useEffect(() => {
    const id = setInterval(() => {
      loadAll().catch(() => undefined);
    }, 30000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    let list = markers.filter((m) => visibleLayers[m.type] !== false);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          (m.address ?? "").toLowerCase().includes(q) ||
          (m.status ?? "").toLowerCase().includes(q),
      );
    }
    return list;
  }, [markers, query, visibleLayers]);

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setBusy(true);
    try {
      const res = await gisApi.search(query);
      setSearchResults(res);
      if (res.length > 0) {
        const first = res[0];
        setSelected(first);
        setFocus({ latitude: first.latitude, longitude: first.longitude, nonce: Date.now() });
      }
    } finally {
      setBusy(false);
    }
  };

  function select(m: MapMarker) {
    setSelected(m);
    setFocus({ latitude: m.latitude, longitude: m.longitude, nonce: Date.now() });
  }

  const info = selected ?? (filtered[0] ?? null);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans">
      <header className="h-14 bg-white text-slate-900 border-b border-slate-200 flex items-center justify-between px-5 shadow">
        <Link href="/" className="flex items-center gap-3 font-extrabold text-lg">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-teal-600">
            <Map className="h-5 w-5" />
          </span>
          City GIS Operations
        </Link>
        <div className="flex items-center gap-4 text-xs">
          {lastUpdated && (
            <span className="hidden items-center gap-1.5 text-emerald-600 sm:flex">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Live · {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <Bell className="h-4 w-4 text-slate-500" />
          <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-700 font-bold">SU</span>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-56px)]">
        <aside className="hidden w-11 shrink-0 flex-col items-center gap-5 border-r border-slate-200 bg-white py-4 lg:flex">
          {[Home, Layers, Briefcase, Settings].map((Icon, index) => (
            <button key={index} className={`grid h-9 w-9 place-items-center rounded-lg ${index === 1 ? "bg-teal-600 text-white" : "text-slate-500 hover:bg-slate-100"}`}>
              <Icon className="h-4 w-4" />
            </button>
          ))}
          <button className="mt-auto grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100">
            <LogOut className="h-4 w-4" />
          </button>
        </aside>

        <aside className="hidden w-56 shrink-0 space-y-5 border-r border-slate-200 bg-white p-4 text-xs lg:flex lg:flex-col">
          <h3 className="font-bold text-slate-800">
            Live GIS Layers
            {loading && <Loader2 className="ml-2 inline h-3 w-3 animate-spin text-teal-600" />}
          </h3>
          {TYPES.map((t) => (
            <label key={t} className="flex items-center gap-2 text-slate-700">
              <input
                type="checkbox"
                checked={visibleLayers[t] !== false}
                onChange={() => setVisibleLayers((prev) => ({ ...prev, [t]: !(prev[t] !== false) }))}
                className="rounded text-teal-600"
              />
              <span className="h-2 w-2 rounded-full" style={{ background: TYPE_COLOR[t] }} />
              {TYPE_LABEL[t]}
              <span className="ml-auto text-slate-500">{stats[t] ?? 0}</span>
            </label>
          ))}
          <div className="space-y-2 border-t border-slate-200 pt-4">
            <h3 className="font-bold text-slate-800">Available Layers</h3>
            {layers.length === 0 ? (
              <p className="text-slate-500">—</p>
            ) : (
              layers.map((l) => (
                <p key={l} className="flex items-center gap-2 text-slate-600">
                  <span className="h-2 w-2 rounded-full bg-teal-500" /> {l}
                </p>
              ))
            )}
          </div>
        </aside>

        <main className="relative flex-1 overflow-hidden">
          <div className="absolute left-4 top-4 z-[1000] flex items-center gap-2">
            <div className="rounded-lg bg-white shadow border border-slate-200 px-2 py-1 text-[11px] text-slate-500">
              Zoom via map controls
            </div>
            <form onSubmit={search} className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search markers, status, address"
                className="h-10 w-56 rounded-lg border border-slate-200 bg-white pl-9 pr-8 text-xs shadow focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
              {busy && <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-teal-600" />}
            </form>
          </div>

          <div className="absolute right-4 top-4 z-[1000] flex items-center gap-2 text-xs" style={{ zIndex: 1000 }}>
            <button
              onClick={() => setMapType("streets")}
              className={`flex items-center gap-1.5 rounded-lg border bg-white px-3 py-2 font-semibold shadow ${mapType === "streets" ? "border-teal-500 text-teal-700" : "border-slate-200"}`}
            >
              <MapPinned className="h-3.5 w-3.5" /> Streets
            </button>
            <button
              onClick={() => setMapType("satellite")}
              className={`flex items-center gap-1.5 rounded-lg border bg-white px-3 py-2 font-semibold shadow ${mapType === "satellite" ? "border-teal-500 text-teal-700" : "border-slate-200"}`}
            >
              <Satellite className="h-3.5 w-3.5" /> Satellite
            </button>
            <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 font-semibold shadow">
              <Layers className="h-3.5 w-3.5" /> Layers <ChevronDown className="h-3 w-3" />
            </button>
          </div>

          <section className="relative h-[calc(100vh-136px)] min-h-[570px] overflow-hidden bg-[#e8f2f0]">
            <GisMap markers={filtered} mapStyle={mapType} focus={focus} onSelect={select} />

            {searchResults.length > 0 && (
              <div className="absolute left-4 top-16 z-[1000] w-64 space-y-1 rounded-xl border border-slate-200 bg-white p-2 text-xs shadow-lg">
                <p className="px-1 font-bold text-slate-800">Search results</p>
                {searchResults.slice(0, 5).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => select(m)}
                    className="block w-full truncate rounded-lg px-2 py-1.5 text-left hover:bg-slate-100"
                  >
                    <b>{m.title}</b> · {TYPE_LABEL[m.type] ?? m.type}
                  </button>
                ))}
              </div>
            )}
          </section>

          <aside className="absolute right-0 top-0 z-[1200] h-[calc(100vh-136px)] w-52 space-y-3 border-l border-slate-200 bg-white p-4 text-xs overflow-y-auto">
            {!info ? (
              <p className="text-slate-500">No marker data yet.</p>
            ) : (
              <>
                <h2 className="font-bold text-slate-900">{info.title}</h2>
                <Info label="Type" value={TYPE_LABEL[info.type] ?? info.type} />
                <Info label="Status" value={info.status ?? "—"} />
                <Info label="Severity" value={info.severity ?? "—"} />
                <Info label="Address" value={info.address ?? "—"} />
                <Info label="Coords" value={`${info.latitude.toFixed(4)}, ${info.longitude.toFixed(4)}`} />
              </>
            )}
          </aside>

          <div className="grid grid-cols-2 gap-4 border-t border-slate-200 bg-white p-3 lg:grid-cols-4">
            <Stat label="Active Complaints" value={loading ? "—" : (stats.complaint ?? 0)} />
            <Stat label="Public Assets" value={loading ? "—" : (stats.asset ?? 0)} />
            <Stat label="Emergency Cases" value={loading ? "—" : (stats.emergency ?? 0)} />
            <Stat label="Facilities (Hosp./Police)" value={loading ? "—" : (stats.hospital ?? 0) + (stats.police ?? 0)} />
          </div>
        </main>
      </div>
    </div>
  );
}

function MapLoading() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#e8f2f0] text-sm text-slate-500">
      <Loader2 className="mr-2 h-4 w-4 animate-spin text-teal-600" /> Loading live map…
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-2">
      <span className="block text-slate-500">{label}</span>
      <span className="font-semibold text-slate-900">{value}</span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold text-slate-700">{label}</p>
      <p className="mt-1 text-3xl font-black text-slate-950">{value}</p>
    </div>
  );
}