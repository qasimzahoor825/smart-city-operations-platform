"use client";

import { ChevronDown, Filter, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import type { GisFilterOptions, GisFilters } from "@/hooks/use-gis-portal";
import { statusColor } from "./marker-utils";

interface FilterGroupProps {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  colorFor?: (value: string) => string;
}

function FilterGroup({ label, options, selected, onToggle, colorFor }: FilterGroupProps) {
  const [open, setOpen] = useState(true);
  const activeCount = selected.length;

  return (
    <div className="border-b border-slate-100 pb-3">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-1.5 text-xs font-bold uppercase tracking-wide text-slate-500"
      >
        <span className="flex items-center gap-2">
          {label}
          {activeCount > 0 && (
            <span className="grid min-w-[18px] place-items-center rounded-full bg-teal-600 px-1 py-0.5 text-[10px] font-black text-white">
              {activeCount}
            </span>
          )}
        </span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="space-y-0.5">
          {options.length === 0 && <p className="py-1 text-[11px] text-slate-400">No options in current data.</p>}
          {options.map((option) => {
            const checked = selected.includes(option);
            return (
              <label
                key={option}
                className="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 text-[11px] hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(option)}
                  className="h-3.5 w-3.5 rounded accent-teal-600"
                />
                {colorFor ? <span className="h-2 w-2 rounded-full" style={{ background: colorFor(option) }} /> : null}
                <span className={`truncate font-medium ${checked ? "text-slate-900" : "text-slate-600"}`}>{option}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface FilterPanelProps {
  options: GisFilterOptions;
  filters: GisFilters;
  onChange: (filters: GisFilters) => void;
}

export default function FilterPanel({ options, filters, onChange }: FilterPanelProps) {
  const totalActive = filters.departments.length + filters.categories.length + filters.statuses.length + filters.priorities.length;

  const toggle = (key: keyof GisFilters) => (value: string) => {
    const list = filters[key];
    onChange({ ...filters, [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value] });
  };

  const clearAll = () => onChange({ departments: [], categories: [], statuses: [], priorities: [] });

  return (
    <div className="w-60 rounded-xl border border-slate-200 bg-white/95 shadow-lg backdrop-blur">
      <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2.5">
        <span className="flex items-center gap-2 text-xs font-black text-slate-800">
          <SlidersHorizontal className="h-3.5 w-3.5 text-teal-600" />
          Dynamic Filters
        </span>
        {totalActive > 0 ? (
          <button onClick={clearAll} className="flex items-center gap-1 text-[11px] font-bold text-teal-700 hover:text-teal-900">
            <X className="h-3 w-3" /> Clear ({totalActive})
          </button>
        ) : (
          <Filter className="h-3.5 w-3.5 text-slate-300" />
        )}
      </div>
      <div className="max-h-[calc(100vh-320px)] overflow-y-auto px-3 py-2">
        <FilterGroup label="Department" options={options.departments} selected={filters.departments} onToggle={toggle("departments")} />
        <FilterGroup label="Category" options={options.categories} selected={filters.categories} onToggle={toggle("categories")} />
        <FilterGroup label="Status" options={options.statuses} selected={filters.statuses} onToggle={toggle("statuses")} colorFor={statusColor} />
        <FilterGroup label="Priority" options={options.priorities} selected={filters.priorities} onToggle={toggle("priorities")} colorFor={(value) => value} />
      </div>
    </div>
  );
}