"use client";

import React from "react";

interface BarDatum {
  label: string;
  value: number;
  color?: string;
}

/** Dependency-free horizontal bar chart rendered with CSS for the dashboards. */
export function BarChart({ data }: { data: BarDatum[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-3">
          <span className="w-28 shrink-0 text-xs text-slate-500">{d.label}</span>
          <div className="flex-1 h-2.5 rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-500 to-blue-600"
              style={{ width: `${(d.value / max) * 100}%`, backgroundColor: d.color }}
            />
          </div>
          <span className="w-10 shrink-0 text-xs font-semibold text-slate-700 text-right">{d.value}</span>
        </div>
      ))}
    </div>
  );
}

/** Simple donut using CSS conic-gradient. */
export function DonutChart({
  segments,
  size = 160,
}: {
  segments: { label: string; value: number; color: string }[];
  size?: number;
}) {
  const total = Math.max(1, segments.reduce((s, d) => s + d.value, 0));
  let acc = 0;
  const stops = segments
    .map((s) => {
      const from = (acc / total) * 360;
      acc += s.value;
      const to = (acc / total) * 360;
      return `${s.color} ${from}deg ${to}deg`;
    })
    .join(", ");

  return (
    <div className="flex items-center gap-6">
      <div
        className="rounded-full"
        style={{
          width: size,
          height: size,
          background: `conic-gradient(${stops})`,
        }}
      />
      <div className="space-y-2">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-2 text-xs text-slate-600">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
            {s.label}
            <span className="font-semibold text-slate-800">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}