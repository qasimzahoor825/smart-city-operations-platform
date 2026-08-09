"use client";

import React from "react";
import { KeyRound, Laptop, Trash2 } from "lucide-react";
import { Button, Input, Label, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { PageContainer } from "@/components/shared/page-container";
import { notificationsApi } from "@/services/operations";
import { authApi } from "@/services/auth";
import { useAuth, useLogout } from "@/hooks/auth";
import { toast } from "sonner";

const TOGGLES: { key: string; label: string; description: string }[] = [
  { key: "email", label: "Email Alerts", description: "Receipts and status updates delivered by email" },
  { key: "push", label: "In-App / Push Updates", description: "Get notified when your complaint status changes" },
  { key: "sms", label: "SMS Incident Alerts", description: "Receive urgent municipal emergency dispatches via SMS" },
];

interface SessionRow {
  id: string;
  userAgent?: string;
  ip?: string;
  rememberMe?: boolean;
  expiresAt: string;
  createdAt: string;
  revoked?: boolean;
}

export default function CitizenSettingsPage() {
  const { user } = useAuth();
  const logout = useLogout();
  const [prefs, setPrefs] = React.useState<Record<string, boolean>>({});
  const [busy, setBusy] = React.useState(false);

  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [pwBusy, setPwBusy] = React.useState(false);

  const [sessions, setSessions] = React.useState<SessionRow[]>([]);
  const [sessionsLoaded, setSessionsLoaded] = React.useState(false);

  React.useEffect(() => {
    notificationsApi.preferences(user?.id).then((p) => p && setPrefs(p)).catch(() => undefined);
  }, [user?.id]);

  const toggle = (key: string) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  const loadSessions = () => {
    authApi
      .listSessions()
      .then((s) => setSessions(s as SessionRow[]))
      .catch(() => undefined)
      .finally(() => setSessionsLoaded(true));
  };

  React.useEffect(loadSessions, []);

  const save = async () => {
    setBusy(true);
    try {
      const updated = await notificationsApi.updatePreferences({
        userId: user?.id,
        email: Boolean(prefs.email),
        push: Boolean(prefs.push),
        sms: Boolean(prefs.sms),
        categories: [],
      });
      if (updated) setPrefs({ email: updated.email, push: updated.push, sms: updated.sms } as Record<string, boolean>);
      toast.success("Preferences saved");
    } catch {
      toast.error("Could not save preferences");
    } finally {
      setBusy(false);
    }
  };

  const changePassword = async () => {
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    setPwBusy(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      toast.success("Password changed. Please sign in again.");
      await logout();
    } catch (e) {
      toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Could not change password");
    } finally {
      setPwBusy(false);
    }
  };

  const revoke = async (id: string) => {
    try {
      await authApi.revokeSession(id);
      toast.success("Session revoked");
      setSessions((s) => s.filter((x) => x.id !== id));
    } catch {
      toast.error("Could not revoke session");
    }
  };

  return (
    <PageContainer title="Account Settings & Privacy" description="Configure notification channels, security parameters, and active sessions.">
      <div className="grid md:grid-cols-2 gap-6">
        <Card glass>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-blue-400" />
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="cur-pw">Current Password</Label>
              <Input id="cur-pw" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="new-pw">New Password</Label>
              <Input id="new-pw" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="conf-pw">Confirm New Password</Label>
              <Input id="conf-pw" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
            <Button variant="primary" isLoading={pwBusy} onClick={() => void changePassword()} className="w-full">
              Update Password
            </Button>
          </CardContent>
        </Card>

        <Card glass>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Laptop className="w-5 h-5 text-purple-400" />
              Active Sessions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!sessionsLoaded && <p className="text-sm text-slate-400">Loading sessions…</p>}
            {sessionsLoaded && sessions.length === 0 && <p className="text-sm text-slate-400">No active sessions.</p>}
            {sessions.map((s) => (
              <div key={s.id} className="flex items-center justify-between border border-white/10 rounded-xl px-3 py-2">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white truncate">{s.userAgent ?? "Unknown device"}</div>
                  <div className="text-xs text-slate-400">
                    {s.ip ?? "Unknown IP"} · {new Date(s.createdAt).toLocaleString()}
                    {s.rememberMe ? " · Remembered" : ""}
                  </div>
                </div>
                <button
                  onClick={() => void revoke(s.id)}
                  className="text-slate-400 hover:text-red-400 p-1 rounded-lg hover:bg-white/5"
                  title="Revoke session"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card glass>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {TOGGLES.map((t) => (
              <div key={t.key} className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white">{t.label}</h4>
                  <p className="text-xs text-slate-400">{t.description}</p>
                </div>
                <input type="checkbox" checked={Boolean(prefs[t.key])} onChange={() => toggle(t.key)} className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700" />
              </div>
            ))}
            <div className="flex justify-end">
              <Button variant="primary" isLoading={busy} onClick={() => void save()}>
                Save Preferences
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card glass>
          <CardHeader>
            <CardTitle>Session & Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-300">
            <p>
              Signing out <span className="text-white font-semibold">all</span> devices requires logging in again.
            </p>
            <Button variant="destructive" onClick={() => void logout()}>
              Sign out everywhere
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}