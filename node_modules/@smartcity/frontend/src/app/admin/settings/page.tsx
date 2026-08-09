"use client";

import React from "react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import { PageContainer } from "@/components/shared/page-container";
import { systemApi } from "@/services/operations";
import { toast } from "sonner";

const SYSTEM_OPTIONS: { key: string; label: string; description: string }[] = [
  { key: "rateLimiting", label: "Enable API Rate Limiting", description: "Protect the gateway from abuse" },
  { key: "maintenanceMode", label: "Maintenance Mode", description: "Show a maintenance banner across the portal" },
  { key: "emailNotifications", label: "Email Notifications", description: "Send status updates via email" },
  { key: "smsAlerts", label: "SMS Alerts", description: "Send emergency alerts via SMS" },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = React.useState<Record<string, boolean>>({
    rateLimiting: true,
    maintenanceMode: false,
    emailNotifications: true,
    smsAlerts: true,
  });
  const [busy, setBusy] = React.useState(false);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    systemApi
      .get()
      .then((s) => {
        if (s && Object.keys(s).length) setSettings((prev) => ({ ...prev, ...s }));
      })
      .catch(() => undefined)
      .finally(() => setLoaded(true));
  }, []);

  const toggle = (key: string) => setSettings((s) => ({ ...s, [key]: !s[key] }));

  const save = async () => {
    setBusy(true);
    try {
      await systemApi.update(settings);
      toast.success("System settings saved");
    } catch {
      toast.error("Could not save settings");
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageContainer title="Global Platform Settings" description="Configure environment flags, security controls, and maintenance toggles.">
      <Card glass className="max-w-2xl">
        <CardHeader>
          <CardTitle>Global System Settings</CardTitle>
          <CardDescription>{loaded ? "Applied platform-wide." : "Loading current configuration…"}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {SYSTEM_OPTIONS.map((o) => (
            <div key={o.key} className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-900">{o.label}</div>
                <div className="text-xs text-slate-500">{o.description}</div>
              </div>
              <input
                type="checkbox"
                checked={Boolean(settings[o.key])}
                onChange={() => toggle(o.key)}
                className="w-4 h-4 rounded text-purple-600 bg-white border-slate-300"
              />
            </div>
          ))}
          <div className="flex justify-end pt-2">
            <Button variant="primary" isLoading={busy} onClick={() => void save()}>
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}