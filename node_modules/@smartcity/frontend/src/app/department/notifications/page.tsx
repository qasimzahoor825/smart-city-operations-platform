"use client";

import React from "react";
import Link from "next/link";
import {
  Bell,
  Briefcase,
  Building2,
  Check,
  CheckSquare,
  ChevronDown,
  Home,
  Layers,
  LogOut,
  Search,
  Settings,
  Siren,
  SlidersHorizontal,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { toast } from "sonner";
import { notificationsApi } from "@/services/operations";
import { useAuth } from "@/hooks/auth";
import type { AppNotification } from "@/types";

type NotificationKind = "All" | "Complaints" | "Tasks" | "Emergency" | "System";
type ItemKind = Exclude<NotificationKind, "All">;

const KIND_META: Record<ItemKind, { icon: React.ComponentType<{ className?: string }>; accent: string; action: string }> = {
  Complaints: { icon: Building2, accent: "bg-teal-50 text-teal-700", action: "View Details" },
  Tasks: { icon: CheckSquare, accent: "bg-teal-50 text-teal-700", action: "Manage Task" },
  Emergency: { icon: Siren, accent: "bg-red-50 text-slate-700", action: "Acknowledge" },
  System: { icon: Bell, accent: "bg-slate-100 text-slate-700", action: "View" },
};

const CATEGORY_BY_LABEL: Record<string, string> = {
  "Complaint Updates": "complaints",
  "Task Assignments": "tasks",
  "Emergency Alerts": "emergencies",
};

const kindOf = (n: AppNotification): ItemKind => {
  const hay = `${n.title} ${n.message}`.toLowerCase();
  if (hay.includes("emergenc")) return "Emergency";
  if (hay.includes("task") || hay.includes("assign")) return "Tasks";
  if (hay.includes("complaint")) return "Complaints";
  return "System";
};

const formatTime = (value: string): string => new Date(value).toLocaleString();

export default function DepartmentNotificationsPage() {
  const { user } = useAuth();
  const [tab, setTab] = React.useState<NotificationKind>("All");
  const [query, setQuery] = React.useState("");
  const [notifications, setNotifications] = React.useState<AppNotification[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [emailEnabled, setEmailEnabled] = React.useState(true);
  const [inAppEnabled, setInAppEnabled] = React.useState(true);
  const [subscriptions, setSubscriptions] = React.useState<Record<string, boolean>>({
    "Complaint Updates": true,
    "Task Assignments": true,
    "Emergency Alerts": true,
  });
  const [saving, setSaving] = React.useState(false);

  const refresh = React.useCallback(() => {
    setLoading(true);
    notificationsApi
      .list({ userId: user?.id })
      .then(setNotifications)
      .catch(() => toast.error("Could not load notifications"))
      .finally(() => setLoading(false));
  }, [user?.id]);

  React.useEffect(() => {
    refresh();
    notificationsApi
      .preferences(user?.id)
      .then((prefs) => {
        if (!prefs) return;
        if (typeof prefs.email === "boolean") setEmailEnabled(prefs.email);
        if (typeof prefs.push === "boolean") setInAppEnabled(prefs.push);
        const categories = (prefs as { categories?: string[] }).categories;
        if (Array.isArray(categories)) {
          setSubscriptions({
            "Complaint Updates": categories.includes("complaints"),
            "Task Assignments": categories.includes("tasks"),
            "Emergency Alerts": categories.includes("emergency"),
          });
        }
      })
      .catch(() => undefined);
  }, [refresh]);

  const markRead = async (id: string) => {
    await notificationsApi.markRead(id).catch(() => undefined);
    refresh();
  };

  const markAllRead = async () => {
    await notificationsApi.markAllRead(user?.id).catch(() => undefined);
    refresh();
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await notificationsApi.updatePreferences({
        userId: user?.id,
        email: emailEnabled,
        push: inAppEnabled,
        categories: Object.entries(subscriptions).filter(([, enabled]) => enabled).map(([label]) => CATEGORY_BY_LABEL[label]),
      });
      toast.success("Notification settings saved");
    } catch {
      toast.error("Could not save notification settings");
    } finally {
      setSaving(false);
    }
  };

  const filtered = notifications
    .map((n) => ({ ...n, kind: kindOf(n) }))
    .filter((n) => tab === "All" || n.kind === tab)
    .filter((n) => `${n.title} ${n.message}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 font-sans">
      <header className="h-14 bg-white text-slate-900 border-b border-slate-200 flex items-center justify-between px-5 shadow">
        <Link href="/" className="flex items-center gap-3 font-extrabold text-lg">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-teal-600">
            <Layers className="h-5 w-5" />
          </span>
          City GIS Operations
        </Link>
        <div className="relative hidden w-64 md:block">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Location search" className="h-9 w-full rounded-lg bg-white pl-9 pr-3 text-xs text-slate-900 outline-none" />
        </div>
        <div className="flex items-center gap-4 text-xs">
          <Bell className="h-4 w-4 text-slate-500" />
          <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-700 font-bold">SU</span>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-56px)]">
        <aside className="hidden w-11 shrink-0 flex-col items-center gap-5 border-r border-slate-200 bg-white py-4 lg:flex">
          {[Home, Layers, Briefcase, Settings].map((Icon, index) => (
            <button key={index} className={`grid h-9 w-9 place-items-center rounded-lg ${index === 2 ? "bg-teal-600 text-white" : "text-slate-500 hover:bg-slate-100"}`}>
              <Icon className="h-4 w-4" />
            </button>
          ))}
          <button className="mt-auto grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100">
            <LogOut className="h-4 w-4" />
          </button>
        </aside>

        <main className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 p-6 lg:grid-cols-[1fr_280px] lg:p-10">
          <section>
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-black tracking-tight">Notifications</h1>
              <button onClick={() => void markAllRead()} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-950 shadow-sm hover:border-teal-600 hover:text-teal-700">
                Mark all read
              </button>
            </div>
            <div className="mt-7 flex border-b border-slate-300">
              {(["All", "Complaints", "Tasks", "Emergency", "System"] as NotificationKind[]).map((item) => (
                <button
                  key={item}
                  onClick={() => setTab(item)}
                  className={`min-w-28 px-6 py-3 text-sm font-semibold ${tab === item ? "border-b-4 border-teal-600 text-teal-700" : "text-slate-800 hover:text-teal-700"}`}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              {loading ? (
                <p className="py-10 text-sm font-semibold text-slate-500">Loading notifications…</p>
              ) : filtered.length === 0 ? (
                <p className="py-10 text-sm font-semibold text-slate-500">No notifications found.</p>
              ) : (
                filtered.map((item) => {
                  const meta = KIND_META[item.kind];
                  const Icon = meta.icon;
                  const unread = !item.isRead;
                  return (
                    <article key={item.id} className="relative rounded-lg border border-slate-300 bg-white p-5 shadow-sm">
                      {unread && <span className="absolute left-3 top-4 h-2.5 w-2.5 rounded-full bg-sky-500" />}
                      <div className="flex gap-5">
                        <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-full ${meta.accent}`}>
                          <Icon className="h-7 w-7" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="min-h-14 text-base font-semibold leading-snug text-slate-950">{item.title}</p>
                          <p className="text-sm text-slate-500">{item.channel}</p>
                          <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3 text-sm">
                            <span>{formatTime(item.createdAt)}</span>
                            <button onClick={() => void markRead(item.id)} className="font-semibold text-slate-950 hover:text-teal-700">
                              {unread ? "Mark as read" : meta.action}
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </section>

          <aside className="h-fit overflow-hidden rounded-lg border border-slate-300 bg-white shadow">
            <h2 className="bg-slate-50 border-b border-slate-200 px-4 py-5 text-lg font-bold text-slate-900">Notification Settings</h2>
            <div className="space-y-6 p-4">
              <div>
                <h3 className="mb-3 text-sm font-black">Channel Preferences</h3>
                <SettingToggle label="Email Notifications" enabled={emailEnabled} onClick={() => setEmailEnabled((value) => !value)} />
                <SettingToggle label="In-App Notifications" enabled={inAppEnabled} onClick={() => setInAppEnabled((value) => !value)} />
              </div>

              <div>
                <h3 className="mb-3 text-sm font-black">Event Subscription</h3>
                <div className="space-y-2">
                  {Object.entries(subscriptions).map(([label, enabled]) => (
                    <button
                      key={label}
                      onClick={() => setSubscriptions((current) => ({ ...current, [label]: !current[label] }))}
                      className="flex w-full items-center justify-between rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    >
                      <span className="flex items-center gap-2 font-semibold">
                        <span className={`grid h-4 w-4 place-items-center rounded ${enabled ? "bg-teal-600 text-white" : "bg-slate-200 text-slate-400"}`}>
                          {enabled && <Check className="h-3 w-3" />}
                        </span>
                        {label}
                      </span>
                      <ChevronDown className="h-4 w-4 text-slate-500" />
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={() => void saveSettings()} className="flex w-full items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-bold text-white">
                <SlidersHorizontal className="h-4 w-4" /> {saving ? "Saving…" : "Save Settings"}
              </button>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}

function SettingToggle({ label, enabled, onClick }: { label: string; enabled: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="mb-3 flex w-full items-center justify-between text-sm font-semibold">
      {label}
      {enabled ? <ToggleRight className="h-8 w-8 text-slate-950" /> : <ToggleLeft className="h-8 w-8 text-slate-400" />}
    </button>
  );
}