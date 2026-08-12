"use client";

import { useCallback, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Bell, Loader2, Map, MapPinned, RefreshCw, Search, SlidersHorizontal } from "lucide-react";

import GisSidebar from "@/components/gis/gis-sidebar";
import FilterPanel from "@/components/gis/filter-panel";
import ServiceCards from "@/components/gis/service-cards";
import StatBar from "@/components/gis/stat-bar";
import MarkerDrawer from "@/components/gis/marker-drawer";
import ServiceModal from "@/components/gis/service-modal";
import { filterMarkers, useGisPortal, type GisFilters, type RichMarker } from "@/hooks/use-gis-portal";
import type { ServiceKey } from "@/components/gis/service-cards";

const GisMap = dynamic(() => import("@/components/gis/gis-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[#eef4f3] text-sm font-semibold text-slate-500">
      <Loader2 className="mr-2 h-4 w-4 animate-spin text-teal-600" /> Loading live GIS portal…
    </div>
  ),
});

const EMPTY_FILTERS: GisFilters = { departments: [], categories: [], statuses: [], priorities: [] };

export default function AdminGisPage() {
  const { data: portal, options, refresh } = useGisPortal(20000);
  const [filters, setFilters] = useState<GisFilters>(EMPTY_FILTERS);
  const [hiddenLayers, setHiddenLayers] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<RichMarker | null>(null);
  const [focus, setFocus] = useState<{ latitude: number; longitude: number; nonce: number } | null>(null);
  const [mapStyle, setMapStyle] = useState<"streets" | "satellite">("streets");
  const [service, setService] = useState<ServiceKey | null>(null);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);

  const toggleLayer = useCallback((layer: string) => {
    setHiddenLayers((prev) => {
      const next = new Set(prev);
      if (next.has(layer)) next.delete(layer);
      else next.add(layer);
      return next;
    });
  }, []);

  const filtered = useMemo(() => {
    let list = filterMarkers(portal.markers, filters);
    if (hiddenLayers.size > 0) {
      list = list.filter((m) => {
        const layer = m.source ?? (m.type === "hospital" ? "Government Facilities" : m.type === "police" ? "Government Facilities" : typeLayer(m.type));
        return !hiddenLayers.has(layer);
      });
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (m) =>
          (m.title ?? "").toLowerCase().includes(q) ||
          (m.address ?? "").toLowerCase().includes(q) ||
          (m.status ?? "").toLowerCase().includes(q) ||
          (m.department ?? "").toLowerCase().includes(q),
      );
    }
    return list;
  }, [portal.markers, filters, hiddenLayers, query]);

  const counts = useMemo(() => {
    const byType: Record<string, number> = {};
    filtered.forEach((m) => {
      byType[m.type] = (byType[m.type] ?? 0) + 1;
    });
    const facilities = (byType.hospital ?? 0) + (byType.police ?? 0);
    return {
      complaints: byType.complaint ?? 0,
      assets: byType.asset ?? 0,
      emergencies: byType.emergency ?? 0,
      facilities,
      total: filtered.length,
    };
  }, [filtered]);

  const select = useCallback((marker: RichMarker) => {
    setSelected(marker);
    setFocus({ latitude: marker.latitude, longitude: marker.longitude, nonce: Date.now() });
  }, []);

  const manualRefresh = async () => {
    setBusy(true);
    try {
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  const layerList = useMemo(() => {
    const layers = new Set<string>();
    portal.markers.forEach((m) => layers.add(m.source ?? typeLayer(m.type)));
    portal.layers.forEach((l) => layers.add(l));
    return Array.from(layers).sort();
  }, [portal.markers, portal.layers]);

  const countByCategory = useMemo(() => {
    const byType: Record<string, number> = {};
    portal.markers.forEach((m) => {
      byType[m.type] = (byType[m.type] ?? 0) + 1;
    });
    return byType;
  }, [portal.markers]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 font-sans text-slate-900">
      <GisSidebar active="GIS Portal" />

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-tr from-teal-500 to-sky-600 text-white shadow-md shadow-teal-500/25">
              <Map className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-sm font-black leading-tight">GIS Portal — City Operations</h1>
              <p className="text-[10px] font-medium text-slate-500">
                {portal.lastUpdated ? `Live · updated ${portal.lastUpdated.toLocaleTimeString()}` : "Loading…"}
              </p>
            </div>
            {portal.error && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">{portal.error}</span>}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search markers, departments…"
                className="h-10 w-60 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
            <div className="hidden items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 md:flex">
              <MapPinned className="h-3.5 w-3.5 text-teal-600" />
              {mapStyle === "streets" ? "Streets" : "Satellite"}
              <button
                onClick={() => setMapStyle((s) => (s === "streets" ? "satellite" : "streets"))}
                className="text-slate-400 hover:text-teal-600"
                title="Toggle basemap"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>
            <button
              onClick={manualRefresh}
              disabled={busy}
              className="flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-700 disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              Refresh
            </button>
            <button className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-teal-600">
              <Bell className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="shrink-0 space-y-3 p-4 pb-0">
          <ServiceCards stats={{ complaints: counts.complaints, assets: counts.assets, emergencies: counts.emergencies, citizens: portal.complaints.length }} onOpen={setService} />
        </div>

        <section className="relative m-4 min-h-0 flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <GisMap markers={filtered} mapStyle={mapStyle} focus={focus} onSelect={select} fitOnLoad />

          <div className="absolute left-4 top-4 z-[1000] w-60">
            <div className="mb-1 flex items-center gap-2 rounded-lg bg-slate-900/90 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wide text-white shadow">
              <SlidersHorizontal className="h-3 w-3 text-teal-400" /> Live Layers
            </div>
            <div className="space-y-1 rounded-b-lg bg-white/95 p-2 shadow-lg backdrop-blur">
              {layerList.map((layer) => {
                const checked = !hiddenLayers.has(layer);
                return (
                  <label key={layer} className="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50">
                    <input type="checkbox" checked={checked} onChange={() => toggleLayer(layer)} className="h-3.5 w-3.5 rounded accent-teal-600" />
                    <span className="h-2 w-2 rounded-full bg-teal-500" />
                    {layer}
                  </label>
                );
              })}
              {layerList.length === 0 && <p className="px-1 py-1 text-[11px] text-slate-400">Waiting for data…</p>}
            </div>
          </div>

          <div className="absolute left-4 top-[216px] z-[1000]">
            <FilterPanel options={options} filters={filters} onChange={setFilters} />
          </div>

          <MarkerDrawer marker={selected} onClose={() => setSelected(null)} onRefresh={() => void refresh()} />

          {filtered.length === 0 && !portal.loading && (
            <div className="absolute inset-0 z-[1000] flex items-center justify-center">
              <div className="rounded-xl border border-slate-200 bg-white/95 px-5 py-3 text-xs font-semibold text-slate-600 shadow-lg">
                No markers match the active filters — adjust or clear them.
              </div>
            </div>
          )}
        </section>

        <StatBar counts={counts} />

        <ServiceModal
          service={service}
          counts={countByCategory}
          complaints={portal.complaints}
          assets={portal.assets}
          emergencies={portal.emergencies}
          mapCenter={{ latitude: 31.5497, longitude: 74.3436 }}
          onClose={() => setService(null)}
          onRefresh={() => void refresh()}
        />
      </main>
    </div>
  );
}

function typeLayer(type: string): string {
  if (type === "hospital" || type === "police") return "Government Facilities";
  if (type === "complaint") return "Complaints";
  if (type === "asset") return "Public Assets";
  if (type === "emergency") return "Emergencies";
  return type;
}