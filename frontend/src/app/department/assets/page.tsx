"use client";

import React from "react";
import Link from "next/link";
import {
  Building2,
  LayoutDashboard,
  Layers,
  Wrench,
  CheckCircle2,
  MapPin,
  FileText,
  Search,
  Plus,
  Bell,
  AlertTriangle,
  ThumbsUp,
  Globe,
  AlertCircle,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { assetsApi } from "@/services/operations";
import type { Asset, AssetCategory, AssetStatus } from "@/types";

type AssetStatsShape = {
  total: number;
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
};

const titleCase = (s: string) =>
  s.replace(/_/g, " ").toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase());

const statusStyle = (s: AssetStatus) => {
  if (s === "OPERATIONAL") return "bg-emerald-100 text-emerald-800";
  if (s === "UNDER_MAINTENANCE") return "bg-amber-100 text-amber-800";
  return "bg-red-100 text-red-800";
};

const conditionLabel = (s: AssetStatus) => {
  if (s === "OPERATIONAL") return "Good";
  if (s === "UNDER_MAINTENANCE") return "Sustain";
  return "Overdue";
};

const CATEGORY_OPTIONS: { label: string; value: AssetCategory }[] = [
  { label: "Street Light", value: "STREET_LIGHT" },
  { label: "Road", value: "ROAD" },
  { label: "Water Pump", value: "WATER" },
  { label: "Electricity", value: "ELECTRICITY" },
  { label: "Public Building", value: "BUILDING" },
  { label: "Public Transport", value: "PUBLIC_TRANSPORT" },
  { label: "Waste Container", value: "SANITATION" },
  { label: "Other", value: "OTHER" },
];

export default function PublicAssetManagementPage() {
  const [activeTab, setActiveTab] = React.useState("Asset Dashboard");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [addAssetOpen, setAddAssetOpen] = React.useState(false);

  // Form states for new asset
  const [newAssetName, setNewAssetName] = React.useState("");
  const [newAssetType, setNewAssetType] = React.useState<AssetCategory>("STREET_LIGHT");
  const [newAssetLocation, setNewAssetLocation] = React.useState("");
  const [newAssetDepartment, setNewAssetDepartment] = React.useState("Department");

  const [assets, setAssets] = React.useState<Asset[]>([]);
  const [stats, setStats] = React.useState<AssetStatsShape>({ total: 0, byStatus: {}, byCategory: {} });
  const [loading, setLoading] = React.useState(true);

  const loadData = React.useCallback(() => {
    assetsApi
      .list({ limit: 200 })
      .then(setAssets)
      .catch(() => toast.error("Could not load assets"));
    assetsApi
      .stats()
      .then((s) => setStats(s as unknown as AssetStatsShape))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    loadData();
    const timer = setInterval(loadData, 12000);
    return () => clearInterval(timer);
  }, [loadData]);

  const filtered = assets.filter((a) => {
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      a.name.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q) ||
      a.address.toLowerCase().includes(q) ||
      a.department.toLowerCase().includes(q)
    );
  });

  const maintenanceAssets = assets.filter((a) => a.status === "UNDER_MAINTENANCE");

  const changeStatus = async (a: Asset, target: AssetStatus) => {
    try {
      await assetsApi.updateStatus(a.id, target);
      toast.success(`${a.name} ${target === "UNDER_MAINTENANCE" ? "sent to maintenance" : "marked operational"}`);
      loadData();
    } catch {
      toast.error("Could not update asset status");
    }
  };

  const handleAddAssetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssetName.trim()) {
      toast.error("Asset name is required");
      return;
    }
    try {
      await assetsApi.create({
        name: newAssetName.trim(),
        category: newAssetType,
        status: "OPERATIONAL",
        address: newAssetLocation.trim(),
        department: newAssetDepartment.trim() || "Department",
      });
      toast.success(`Asset ${newAssetName.trim()} registered successfully`);
      setAddAssetOpen(false);
      setNewAssetName("");
      setNewAssetType("STREET_LIGHT");
      setNewAssetLocation("");
      setNewAssetDepartment("Department");
      loadData();
    } catch {
      toast.error("Could not register asset");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex">
      
      {/* Left Dark Navy Sidebar matching Screenshot 08 */}
      <aside className="w-64 bg-white text-slate-900 shrink-0 hidden lg:flex flex-col justify-between p-4 border-r border-slate-200">
        <div className="space-y-6">
          
          <Link href="/" className="flex items-center gap-3 px-2 py-3">
            <div className="p-2 rounded-xl bg-teal-600 text-white">
              <Building2 className="w-6 h-6" />
            </div>
            <span className="font-extrabold text-base tracking-tight text-slate-900 block">
              Smart City
            </span>
          </Link>

          <nav className="space-y-1">
            {[
              { label: "Asset Dashboard", icon: LayoutDashboard, href: "/department/assets" },
              { label: "Asset Registry", icon: Layers, href: "/department/assets" },
              { label: "Maintenance", icon: Wrench, href: "/department/maintenance" },
              { label: "Inspections", icon: CheckCircle2, href: "/department/inspections" },
              { label: "Map View", icon: MapPin, href: "/department/gis" },
              { label: "Reports", icon: FileText, href: "/department/reports" },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.label;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setActiveTab(item.label)}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-teal-600 text-white shadow-md font-bold"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-200 px-2 text-xs text-slate-500">
          Public Asset System
        </div>
      </aside>

      {/* Main Body Column matching Screenshot 08 */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Bar */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Public Asset Management Dashboard
            </h1>
            <p className="text-xs text-slate-500 font-medium">Current date: 25, 2023</p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <button className="p-2 rounded-lg text-slate-500 hover:bg-slate-100" aria-label="Language">
              <Globe className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 relative" aria-label="Notifications">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
            </button>
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
              AM
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="p-6 space-y-6 flex-1 overflow-y-auto">
          
          {/* Top 4 Summary Cards matching Screenshot 08 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Total Assets */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium block">Total Assets</span>
                <span className="text-xl font-extrabold text-slate-900">
                  {loading ? "…" : `${stats.total.toLocaleString()} assets`}
                </span>
              </div>
            </div>

            {/* Good Condition */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
                <ThumbsUp className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium block">Good Condition</span>
                <span className="text-xl font-extrabold text-slate-900">
                  {loading ? "…" : `${(stats.byStatus["OPERATIONAL"] ?? 0).toLocaleString()} good`}
                </span>
              </div>
            </div>

            {/* Needs Maintenance */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-4">
              <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium block">Needs Maintenance</span>
                <span className="text-xl font-extrabold text-slate-900">
                  {loading ? "…" : `${(stats.byStatus["UNDER_MAINTENANCE"] ?? 0).toLocaleString()} maintain`}
                </span>
              </div>
            </div>

            {/* Out of Service */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-4">
              <div className="p-3 rounded-xl bg-red-50 text-red-600">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium block">Out of Service</span>
                <span className="text-xl font-extrabold text-slate-900">
                  {loading ? "…" : `${(stats.byStatus["OUT_OF_SERVICE"] ?? 0).toLocaleString()} out`}
                </span>
              </div>
            </div>

          </div>

          {/* Main Grid: Asset Registry + GIS Asset Grid + Maintenance Warnings matching Screenshot 08 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left 8 Columns (Registry Table & GIS Asset Grid) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Asset Registry Table */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h2 className="text-base font-bold text-slate-900">
                    Asset Registry
                  </h2>

                  <div className="flex items-center gap-3">
                    <div className="relative w-48 sm:w-64">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
                      />
                    </div>

                    <button
                      onClick={() => setAddAssetOpen(true)}
                      className="px-4 py-1.5 rounded-xl smart-btn-teal text-xs font-semibold shadow flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Asset</span>
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="text-xs text-slate-500 text-center py-8">Loading assets…</div>
                ) : filtered.length === 0 ? (
                  <div className="text-xs text-slate-500 text-center py-8">No assets match your search.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead className="text-[11px] bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold">
                        <tr>
                          <th className="p-3">Asset ID</th>
                          <th className="p-3">Asset Type</th>
                          <th className="p-3">Location</th>
                          <th className="p-3">Department</th>
                          <th className="p-3">Condition</th>
                          <th className="p-3">Last Inspection</th>
                          <th className="p-3">Next Maintenance</th>
                          <th className="p-3 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {filtered.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-3 font-semibold text-slate-900">{item.id}</td>
                            <td className="p-3 text-slate-800">{item.name}</td>
                            <td className="p-3 text-slate-600">{item.address}</td>
                            <td className="p-3 text-slate-500">{item.department}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusStyle(item.status)}`}>
                                {conditionLabel(item.status)}
                              </span>
                            </td>
                            <td className="p-3 text-slate-500">
                              {item.lastInspection ? new Date(item.lastInspection).toLocaleDateString() : "—"}
                            </td>
                            <td className="p-3 text-slate-500">
                              {item.nextInspection ? new Date(item.nextInspection).toLocaleDateString() : "—"}
                            </td>
                            <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                              {item.status === "OPERATIONAL" ? (
                                <button
                                  onClick={() => changeStatus(item, "UNDER_MAINTENANCE")}
                                  className="px-2 py-0.5 rounded-full border border-amber-200 bg-amber-50 text-amber-700 text-[10px] font-bold hover:bg-amber-100"
                                >
                                  Set Maint
                                </button>
                              ) : (
                                <button
                                  onClick={() => changeStatus(item, "OPERATIONAL")}
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold hover:opacity-80 ${statusStyle(item.status)}`}
                                >
                                  {item.status === "UNDER_MAINTENANCE" ? "Operational" : "Restore"}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* GIS Asset Grid matching Screenshot 08 */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-sm font-bold text-slate-900">GIS Asset Locations</h3>
                  <span className="text-[10px] font-semibold text-slate-500">
                    {filtered.length.toLocaleString()} asset{filtered.length === 1 ? "" : "s"} located
                  </span>
                </div>

                {loading ? (
                  <div className="text-xs text-slate-500 text-center py-12">Loading asset locations…</div>
                ) : filtered.length === 0 ? (
                  <div className="text-xs text-slate-500 text-center py-12">No assets to display.</div>
                ) : (
                  <div className="relative aspect-[16/8] rounded-xl overflow-hidden border border-slate-200 bg-sky-50">
                    <div className="absolute inset-0 bg-[#e0f2fe]/60">
                      <svg className="w-full h-full stroke-blue-200" strokeWidth="2">
                        <path d="M0,80 Q150,120 300,50 T600,100" fill="none" stroke="#38bdf8" strokeWidth="8" />
                        <line x1="80" y1="0" x2="80" y2="400" stroke="#cbd5e1" strokeWidth="3" />
                        <line x1="240" y1="0" x2="240" y2="400" stroke="#cbd5e1" strokeWidth="3" />
                      </svg>
                    </div>

                    <div className="absolute inset-0 overflow-y-auto p-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {filtered.slice(0, 200).map((a) => (
                          <div key={a.id} className="flex items-center justify-between gap-2 bg-white/90 backdrop-blur rounded-lg border border-slate-200 px-3 py-2 shadow-sm">
                            <div className="flex items-center gap-2 min-w-0">
                              <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                              <div className="min-w-0">
                                <div className="text-[11px] font-bold text-slate-800 truncate">{a.name}</div>
                                <div className="text-[9px] text-slate-500 truncate">{a.address}</div>
                              </div>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold shrink-0 ${statusStyle(a.status)}`}>
                              {titleCase(a.status)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Map Legend Overlay matching Screenshot 08 */}
                    <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur p-3 rounded-xl shadow-lg border border-slate-200 text-[10px] space-y-1">
                      <div className="font-bold text-slate-800 mb-1">Asset Status</div>
                      <div className="flex items-center gap-1.5 text-slate-700"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Operational</div>
                      <div className="flex items-center gap-1.5 text-slate-700"><span className="w-2 h-2 rounded-full bg-amber-500" /> Under Maintenance</div>
                      <div className="flex items-center gap-1.5 text-slate-700"><span className="w-2 h-2 rounded-full bg-red-500" /> Out of Service</div>
                    </div>

                    <div className="absolute bottom-2 left-2 bg-white/80 px-2 py-0.5 rounded text-[9px] text-slate-500">
                      Live asset registry
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Right 4 Columns: Maintenance Warnings Feed matching Screenshot 08 */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900">
                  Maintenance Warnings
                </h2>
                <span className="text-[10px] font-semibold text-slate-500">
                  {maintenanceAssets.length} flagged
                </span>
              </div>

              <div className="space-y-3">
                {loading ? (
                  <div className="text-xs text-slate-500 text-center py-8">Loading warnings…</div>
                ) : maintenanceAssets.length === 0 ? (
                  <div className="text-xs text-slate-500 text-center py-8">No assets currently under maintenance.</div>
                ) : (
                  maintenanceAssets.slice(0, 4).map((a) => (
                    <div key={a.id} className="p-4 rounded-xl bg-red-50/80 border border-red-200 space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-red-900">
                        <span>Asset ID: {a.id}</span>
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                      </div>
                      <div className="text-xs font-semibold text-slate-800">{a.name}</div>
                      <div className="text-[11px] text-red-700">
                        Next due: {a.nextInspection ? new Date(a.nextInspection).toLocaleDateString() : "Not scheduled"}
                      </div>
                      <button
                        onClick={() => changeStatus(a, "OPERATIONAL")}
                        className="mt-1 px-2.5 py-1 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 text-[10px] font-bold hover:bg-emerald-100"
                      >
                        Mark Operational
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </main>
      </div>

      {/* Add New Asset Modal */}
      {addAssetOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">Add New Public Asset</h3>
              <button onClick={() => setAddAssetOpen(false)} aria-label="Close modal"><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <form onSubmit={handleAddAssetSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Asset Name</label>
                <input
                  type="text"
                  value={newAssetName}
                  onChange={(e) => setNewAssetName(e.target.value)}
                  placeholder="e.g. Main St Street Light"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Asset Type</label>
                <select
                  value={newAssetType}
                  onChange={(e) => setNewAssetType(e.target.value as AssetCategory)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
                >
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Location</label>
                <input
                  type="text"
                  value={newAssetLocation}
                  onChange={(e) => setNewAssetLocation(e.target.value)}
                  placeholder="e.g. Marcesta City"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Department</label>
                <input
                  type="text"
                  value={newAssetDepartment}
                  onChange={(e) => setNewAssetDepartment(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setAddAssetOpen(false)} className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg smart-btn-teal text-xs font-semibold">Save Asset</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}