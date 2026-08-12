"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, MessageSquarePlus, Send, X } from "lucide-react";
import { toast } from "sonner";
import { complaintsApi } from "@/services/complaints";
import { emergenciesApi } from "@/services/operations";
import type { Asset, Complaint, Emergency } from "@/types";
import type { ServiceKey } from "./service-cards";
import { statusColor, typeLabel } from "./marker-utils";

interface ServiceModalProps {
  service: ServiceKey | null;
  counts: Record<string, number>;
  complaints: Complaint[];
  assets: Asset[];
  emergencies: Emergency[];
  mapCenter: { latitude: number; longitude: number };
  onClose: () => void;
  onRefresh: () => void;
}

const CATEGORY_OPTIONS = [
  "ROAD",
  "WATER",
  "ELECTRICITY",
  "STREET_LIGHT",
  "PARK",
  "SANITATION",
  "BUILDING",
  "PUBLIC_TRANSPORT",
  "OTHER",
];

const PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export default function ServiceModal({ service, counts, complaints, assets, emergencies, mapCenter, onClose, onRefresh }: ServiceModalProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(service !== null);
    if (service === null) return;
    const timer = window.setTimeout(() => {
      const el = document.getElementById("service-modal");
      el?.focus();
    }, 50);
    return () => window.clearTimeout(timer);
  }, [service]);

  if (!service) return null;
  if (!open) return null;

  return (
    <div
      id="service-modal"
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm focus:outline-none"
      tabIndex={-1}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3">
          <h2 className="text-sm font-black text-slate-900">{titleOf(service)}</h2>
          <button onClick={onClose} className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="p-4">
          {service === "complaint" ? (
            <ComplaintForm categories={CATEGORY_OPTIONS} mapCenter={mapCenter} onDone={onClose} onCreated={onRefresh} recent={complaints.slice(0, 4)} />
          ) : service === "emergency" ? (
            <EmergencyList emergencies={emergencies} onDispatch={onRefresh} />
          ) : service === "asset" ? (
            <AssetSummary assets={assets} counts={counts} />
          ) : (
            <CitizenSummary counts={counts} />
          )}
        </div>
      </div>
    </div>
  );
}

function titleOf(service: ServiceKey): string {
  return {
    citizen: "Citizen Services",
    complaint: "Complaint Management",
    emergency: "Emergency Response",
    asset: "Public Asset Management",
  }[service];
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-500">{children}</label>;
}

function ComplaintForm({
  categories,
  mapCenter,
  recent,
  onDone,
  onCreated,
}: {
  categories: string[];
  mapCenter: { latitude: number; longitude: number };
  recent: Complaint[];
  onDone: () => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("ROAD");
  const [priority, setPriority] = useState("MEDIUM");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    try {
      await complaintsApi.create({
        title: title.trim(),
        description: description.trim() || title.trim(),
        category,
        priority,
        address: "Unknown",
        latitude: mapCenter.latitude,
        longitude: mapCenter.longitude,
      });
      toast.success("Complaint lodged — it appears on the map as a live marker.");
      onCreated();
      onDone();
    } catch {
      toast.error("Could not lodge complaint. Check the API server.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <form onSubmit={submit} className="space-y-3">
        <div>
          <Label>Complaint Title</Label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Streetlight out on Jail Road"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Category</Label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs outline-none">
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>Priority</Label>
            <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs outline-none">
              {PRIORITY_OPTIONS.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <Label>Description</Label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Optional details…"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30"
          />
        </div>
        <p className="flex items-center gap-1.5 text-[10px] text-slate-400">
          <MessageSquarePlus className="h-3 w-3" /> Geo-tagged at map center ({mapCenter.latitude.toFixed(4)}, {mapCenter.longitude.toFixed(4)})
        </p>
        <button
          type="submit"
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-xs font-black text-white shadow-md shadow-teal-500/25 hover:bg-teal-700 disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          Lodge Complaint
        </button>
      </form>

      {recent.length > 0 && (
        <div>
          <p className="mb-2 text-[11px] font-black uppercase tracking-wide text-slate-500">Latest live complaints</p>
          <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 text-xs">
            {recent.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-2 px-3 py-2">
                <span className="truncate font-semibold text-slate-800">{c.title}</span>
                <span className="shrink-0 text-[10px] font-bold" style={{ color: statusColor(c.status) }}>
                  {c.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function EmergencyList({ emergencies, onDispatch }: { emergencies: Emergency[]; onDispatch: () => void }) {
  const active = emergencies.filter((e) => e.status !== "RESOLVED" && e.status !== "CLOSED").slice(0, 6);
  if (active.length === 0) {
    return <p className="py-8 text-center text-xs font-semibold text-slate-400">No active emergency cases.</p>;
  }
  return (
    <ul className="space-y-2">
      {active.map((e) => (
        <li key={e.id} className="rounded-lg border border-slate-200 p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-xs font-black text-slate-900">{e.title}</p>
              <p className="text-[10px] text-slate-500">
                {e.type} · {typeLabel("emergency")} · {e.address}
              </p>
            </div>
            <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black" style={{ background: statusColor(e.status) + "22", color: statusColor(e.status) }}>
              {e.status}
            </span>
          </div>
          <button
            onClick={() => {
              toast.promise(emergenciesApi.dispatch(e.id, {}), {
                loading: "Dispatching units…",
                success: () => {
                  onDispatch();
                  return "Rescue unit dispatched.";
                },
                error: "Dispatch failed.",
              });
            }}
            className="mt-2 flex items-center gap-1.5 rounded-md bg-rose-600 px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-rose-700"
          >
            <Send className="h-3 w-3" /> Dispatch Unit
          </button>
        </li>
      ))}
    </ul>
  );
}

function AssetSummary({ assets, counts }: { assets: Asset[]; counts: Record<string, number> }) {
  const byCategory = new Map<string, number>();
  assets.forEach((a) => byCategory.set(a.category, (byCategory.get(a.category) ?? 0) + 1));
  const sorted = Array.from(byCategory.entries()).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {["ROAD", "WATER", "ELECTRICITY", "STREET_LIGHT", "PARK", "SANITATION"].map((cat) => (
          <div key={cat} className="rounded-lg bg-slate-50 p-2.5 text-center">
            <p className="text-sm font-black text-slate-900">{counts[cat] ?? byCategory.get(cat) ?? 0}</p>
            <p className="text-[9px] font-bold uppercase tracking-wide text-slate-500">{cat}</p>
          </div>
        ))}
      </div>
      <div>
        <p className="mb-2 text-[11px] font-black uppercase tracking-wide text-slate-500">Asset mix ({sorted.length} categories)</p>
        {sorted.length === 0 ? (
          <p className="text-xs text-slate-400">No assets recorded.</p>
        ) : (
          <div className="space-y-1.5">
            {sorted.map(([cat, count]) => (
              <div key={cat} className="flex items-center gap-2 text-xs">
                <span className="w-28 truncate font-semibold text-slate-700">{cat}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-teal-500" style={{ width: `${Math.min(100, (count / sorted[0][1]) * 100)}%` }} />
                </div>
                <span className="w-6 text-right font-black text-slate-900">{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CitizenSummary({ counts }: { counts: Record<string, number> }) {
  const items = [
    { label: "Active Complaints", value: counts.complaints ?? 0, tone: "bg-teal-500" },
    { label: "Public Assets", value: counts.assets ?? 0, tone: "bg-cyan-600" },
    { label: "Emergency Cases", value: counts.emergencies ?? 0, tone: "bg-rose-500" },
    { label: "Gov. Facilities", value: counts.facilities ?? 0, tone: "bg-slate-600" },
  ];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <div key={item.label} className="rounded-xl border border-slate-200 p-3">
            <span className={`mb-2 block h-1.5 w-8 rounded-full ${item.tone}`} />
            <p className="text-xl font-black text-slate-900">{item.value}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{item.label}</p>
          </div>
        ))}
      </div>
      <ul className="space-y-1.5 text-xs text-slate-600">
        <li className="flex items-center gap-2">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Citizen portal — pay bills & book appointments
        </li>
        <li className="flex items-center gap-2">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> 24/7 helpline & emergency dispatch
        </li>
        <li className="flex items-center gap-2">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Real-time complaint tracking with SLA
        </li>
      </ul>
    </div>
  );
}