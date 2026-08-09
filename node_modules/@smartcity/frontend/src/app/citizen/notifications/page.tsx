"use client";

import React from "react";
import { CheckCircle2, Info, BellRing, ShieldAlert } from "lucide-react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Badge } from "@/components/ui";
import { PageContainer } from "@/components/shared/page-container";
import { notificationsApi } from "@/services/operations";
import { useAuth } from "@/hooks/auth";
import { toast } from "sonner";
import type { AppNotification } from "@/types";

export default function CitizenNotificationsPage() {
  const { user } = useAuth();
  const [list, setList] = React.useState<AppNotification[]>([]);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(() => {
    setLoading(true);
    notificationsApi
      .list({ userId: user?.id })
      .then(setList)
      .catch(() => toast.error("Could not load notifications"))
      .finally(() => setLoading(false));
  }, [user?.id]);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const markRead = async (id: string) => {
    await notificationsApi.markRead(id).catch(() => undefined);
    refresh();
  };

  const markAllRead = async () => {
    await notificationsApi.markAllRead(user?.id).catch(() => undefined);
    refresh();
  };

  const iconOf = (n: AppNotification) =>
    n.type === "EMAIL" ? (
      <Info className="w-4 h-4" />
    ) : n.type === "SYSTEM" ? (
      <ShieldAlert className="w-4 h-4" />
    ) : (
      <CheckCircle2 className="w-4 h-4" />
    );

  return (
    <PageContainer title="Notifications" description="Stay informed about your complaints and city updates.">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" leftIcon={<BellRing className="w-4 h-4" />} onClick={() => void markAllRead()}>
          Mark all read
        </Button>
      </div>

      <Card glass>
        <CardHeader>
          <CardTitle>Inbox</CardTitle>
          <CardDescription>{loading ? "Loading…" : `${list.length} notification(s)`}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-slate-400 py-6">Loading…</p>
          ) : list.length === 0 ? (
            <p className="text-sm text-slate-400 py-6">No notifications yet.</p>
          ) : (
            <div className="space-y-3">
              {list.map((n) => (
                <div
                  key={n.id}
                  onClick={() => void markRead(n.id)}
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                    n.isRead ? "bg-slate-800/30 border-slate-700/40" : "bg-slate-800/60 border-blue-500/40"
                  }`}
                >
                  <div className="p-2 rounded-lg bg-white/5 text-slate-300 mt-0.5">{iconOf(n)}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white text-sm">{n.title}</span>
                      <span className="text-xs text-slate-500">{new Date(n.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-slate-400 mt-0.5">{n.message}</p>
                  </div>
                  {!n.isRead && <Badge variant="info">New</Badge>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}