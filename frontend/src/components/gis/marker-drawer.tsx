"use client";

import { ArrowRight, CheckCircle2, MapPin, Navigation, Send, X } from "lucide-react";
import { toast } from "sonner";
import { assetsApi, emergenciesApi } from "@/services/operations";
import { complaintsApi } from "@/services/complaints";
import type { RichMarker } from "@/hooks/use-gis-portal";
import { priorityColor, statusColor, typeLabel } from "./marker-utils";

interface MarkerDrawerProps {
  marker: RichMarker | null;
  onClose: () => void;
  onRefresh: () => void;
}

function isComplaint(marker: RichMarker): boolean {
  return marker.id.startsWith("cmp:");
}
function isEmergency(marker: RichMarker): boolean {
  return marker.id.startsWith("emg:");
}
function isAsset(marker: RichMarker): boolean {
  return marker.id.startsWith("ast:");
}

function Detail({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5">
      <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</span>
      <span className="text-right text-xs font-semibold text-slate-900" style={color ? { color } : undefined}>
        {value}
      </span>
    </div>
  );
}

export default function MarkerDrawer({ marker, onClose, onRefresh }: MarkerDrawerProps) {
  if (!marker) return null;

  const id = marker.id.replace(/^(cmp|emg|ast|gmk_):?/, "");
  const sourceId = marker.id;

  async function run(action: () => Promise<unknown>, message: string) {
    toast.promise(action(), {
      loading: "Processing…",
      success: () => {
        onRefresh();
        return message;
      },
      error: "Action failed. Check the API server.",
    });
  }

  const actions =
    isComplaint(marker) && marker.status !== "RESOLVED"
      ? [
          { label: "Assign", icon: Send, fn: () => complaintsApi.updateStatus(id, "ASSIGNED"), tone: "bg-sky-600 hover:bg-sky-700" },
          { label: "In Progress", icon: Navigation, fn: () => complaintsApi.updateStatus(id, "IN_PROGRESS"), tone: "bg-teal-600 hover:bg-teal-700" },
          { label: "Resolve", icon: CheckCircle2, fn: () => complaintsApi.updateStatus(id, "RESOLVED"), tone: "bg-emerald-600 hover:bg-emerald-700" },
        ]
      : isEmergency(marker)
        ? [
            { label: "Dispatch Unit", icon: Send, fn: () => emergenciesApi.dispatch(id, {}), tone: "bg-rose-600 hover:bg-rose-700" },
          ]
        : isAsset(marker)
          ? [
              { label: "Mark Maintenance", icon: Send, fn: () => assetsApi.updateStatus(id, "UNDER_MAINTENANCE"), tone: "bg-cyan-700 hover:bg-cyan-800" },
            ]
          : [];

  return (
    <aside className="absolute right-4 top-4 z-[1100] w-72 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-3 py-2.5">
        <span className="flex items-center gap-2 text-xs font-black text-slate-800">
          <MapPin className="h-3.5 w-3.5 text-teal-600" />
          Marker Details
        </span>
        <button onClick={onClose} className="grid h-6 w-6 place-items-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="max-h-[60vh] overflow-y-auto px-3 py-2">
        <h3 className="text-sm font-black leading-snug text-slate-900">{marker.title}</h3>
        <div className="mt-3 border-t border-dashed border-slate-200">
          <Detail label="Record ID" value={String(id)} />
          <Detail label="Category" value={typeLabel(marker.type) + (marker.category && marker.category !== marker.type ? ` · ${marker.category}` : "")} />
          <Detail label="Department" value={marker.department ?? "—"} />
          <Detail label="Status" value={marker.status ?? "—"} color={statusColor(marker.status)} />
          {marker.priority ? <Detail label="Priority" value={marker.priority} color={priorityColor(marker.priority)} /> : null}
          <Detail label="Address" value={marker.address ?? "—"} />
          <Detail label="Coordinates" value={`${marker.latitude.toFixed(5)}, ${marker.longitude.toFixed(5)}`} />
          {marker.source ? <Detail label="Source" value={marker.source} /> : null}
        </div>
      </div>

      {actions.length > 0 && (
        <div className="space-y-1.5 border-t border-slate-100 p-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={() => run(() => action.fn(), `${action.label} applied`)}
                className={`flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-white transition-colors ${action.tone}`}
              >
                <Icon className="h-3.5 w-3.5" />
                {action.label}
              </button>
            );
          })}
          <p className="flex items-center gap-1 text-[10px] text-slate-400">
            <ArrowRight className="h-3 w-3" /> Actions write to the live record ({sourceId})
          </p>
        </div>
      )}
    </aside>
  );
}