"use client";

import React from "react";
import { Megaphone, Send } from "lucide-react";
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Input, Label, Textarea, Badge } from "@/components/ui";
import { PageContainer } from "@/components/shared/page-container";
import { notificationsApi } from "@/services/operations";
import type { AppNotification } from "@/types";
import { toast } from "sonner";

const ADVISORY_TYPES = ["SYSTEM", "IN_APP", "PUSH", "EMAIL"];

export default function AdminNewsPage() {
  const [title, setTitle] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [type, setType] = React.useState("PUBLIC_ALERT");
  const [history, setHistory] = React.useState<AppNotification[]>([]);
  const [busy, setBusy] = React.useState(false);

  const load = () =>
    notificationsApi
      .list({ limit: 30 })
      .then(setHistory)
      .catch(() => undefined);
  React.useEffect(() => {
    load();
  }, []);

  const publish = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error("Title and message are required");
      return;
    }
    setBusy(true);
    try {
      await notificationsApi.send({ title: title.trim(), message: message.trim(), type, channel: "IN_APP" });
      toast.success("Advisory published to all residents");
      setTitle("");
      setMessage("");
      load();
    } catch {
      toast.error("Could not publish advisory");
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageContainer title="News & Public Advisories" description="Broadcast municipal news, maintenance notices, and emergency alerts to residents.">
      <Card glass className="max-w-2xl mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-amber-400" />
            Compose Resident Notification
          </CardTitle>
          <CardDescription>Dispatched instantly across in-app channels.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="adv-title">Headline</Label>
              <Input id="adv-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Scheduled water shutdown Zone 4" />
            </div>
            <div>
              <Label htmlFor="adv-type">Type</Label>
              <select id="adv-type" value={type} onChange={(e) => setType(e.target.value)} className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20">
                {ADVISORY_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <Label htmlFor="adv-msg">Message</Label>
            <Textarea id="adv-msg" value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>
          <div className="flex justify-end">
            <Button variant="primary" isLoading={busy} leftIcon={<Send className="w-4 h-4" />} onClick={() => void publish()}>
              Broadcast to Residents
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card glass>
        <CardHeader>
          <CardTitle>Recently Published</CardTitle>
          <CardDescription>Most recent advisories shown first.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {history.length === 0 && <p className="text-sm text-slate-500">No advisories published yet.</p>}
          {history.slice(0, 10).map((n) => (
            <div key={n.id} className="border border-slate-200 rounded-xl px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-900">{n.title}</span>
                <Badge variant={n.type === "SYSTEM" ? "destructive" : "default"}>{n.type}</Badge>
              </div>
              <p className="text-xs text-slate-500 mt-1">{n.message}</p>
              <span className="text-[11px] text-slate-500">{new Date(n.createdAt).toLocaleString()}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </PageContainer>
  );
}