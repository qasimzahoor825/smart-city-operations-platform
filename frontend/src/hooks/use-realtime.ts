"use client";

import React from "react";
import realtimeApi, {
  type ComplaintSocketEvent,
  type EmergencySocketEvent,
  type RealtimeNotification,
  type Unsubscribe,
} from "@/services/realtime";

/**
 * Subscribe to realtime complaint events. The callback runs when a matching
 * socket event arrives, or once per polling fallback tick when the socket is
 * unavailable so the UI can reconcile with a fresh API fetch.
 */
export function useRealtimeComplaints(cb: (payload: ComplaintSocketEvent) => void): void {
  React.useEffect(() => {
    const subs: Unsubscribe[] = [
      realtimeApi.onComplaint(cb),
      realtimeApi.onSlaViolation((p) => {
        cb({ complaintId: p.complaintId, ref: p.ref ?? "", status: "ESCALATED" });
      }),
    ];
    return () => subs.forEach((s) => s());
  }, [cb]);
}

export function useRealtimeEmergencies(cb: (payload: EmergencySocketEvent) => void): void {
  React.useEffect(() => realtimeApi.onEmergency(cb), [cb]);
}

export function useRealtimeNotifications(cb: (payload: RealtimeNotification) => void): void {
  React.useEffect(() => realtimeApi.onNotification(cb), [cb]);
}

/** Manual polling fallback used when the socket is unavailable. */
export function usePollingRefresh(callback: () => void, intervalMs = 15_000): void {
  const saved = React.useRef(callback);
  saved.current = callback;

  React.useEffect(() => {
    const id = setInterval(() => saved.current(), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
}

export default {
  useRealtimeComplaints,
  useRealtimeEmergencies,
  useRealtimeNotifications,
  usePollingRefresh,
} as const;