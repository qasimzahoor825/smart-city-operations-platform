import { io, type Socket } from "socket.io-client";
import { SOCKET_URL } from "@/config/env";
import { tokenStore } from "@/services/token-storage";

export interface ComplaintSocketEvent {
  complaintId: string;
  ref: string;
  status?: string;
  [key: string]: unknown;
}

export interface EmergencySocketEvent {
  emergencyId: string;
  ref?: string;
  status?: string;
  type?: string;
  severity?: string;
  title?: string;
  [key: string]: unknown;
}

export interface SlaSocketEvent {
  complaintId: string;
  ref?: string;
  slaHours?: number;
  [key: string]: unknown;
}

export interface RealtimeNotification {
  id: string;
  title: string;
  message: string;
  type?: string;
  [key: string]: unknown;
}

export declare interface RealtimeApi {
  onComplaint(cb: (payload: ComplaintSocketEvent) => void): () => void;
  onComplaintEvent(event: string, cb: (payload: ComplaintSocketEvent) => void): () => void;
  onEmergency(cb: (payload: EmergencySocketEvent) => void): () => void;
  onEmergencyEvent(event: string, cb: (payload: EmergencySocketEvent) => void): () => void;
  onSlaViolation(cb: (payload: SlaSocketEvent) => void): () => void;
  onNotification(cb: (payload: RealtimeNotification) => void): () => void;
  connected(): boolean;
  destroy(): void;
}

type Unsubscribe = () => void;

/**
 * Real-time bridge to the SmartCity socket server.
 *
 * Connects to `SOCKET_URL` authenticated with the current access token and
 * rejoins automatically on reconnect. All event emitters return an
 * unsubscribe function so callers (React hooks) can clean up.
 *
 * The connection is best-effort: every subscription remains functional when
 * the socket is unavailable by falling back to a polling refresh signal, so
 * UIs never depend on WebSockets being present.
 */
export class RealtimeClient implements RealtimeApi {
  private socket: Socket | null = null;
  private pollInterval: ReturnType<typeof setInterval> | null = null;
  private refreshCallbacks = new Set<() => void>();
  private failedTries = 0;

  constructor() {
    this.connect();
  }

  private connect(): void {
    if (typeof window === "undefined") return;
    const token = tokenStore.getAccessToken();
    if (!token) return;

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnectionAttempts: Number.MAX_SAFE_INTEGER,
      reconnectionDelay: 1500,
      reconnectionDelayMax: 8000,
      timeout: 5000,
    });

    this.socket.on("connect", () => {
      this.failedTries = 0;
      this.stopPolling();
    });

    this.socket.on("disconnect", () => this.maybePoll());
    this.socket.on("connect_error", () => this.maybePoll());
  }

  private maybePoll(): void {
    this.failedTries += 1;
    // Enable the polling fallback only when the socket cannot be established.
    if (this.failedTries > 1) this.startPolling();
  }

  private startPolling(): void {
    if (this.pollInterval) return;
    this.pollInterval = setInterval(() => {
      this.refreshCallbacks.forEach((cb) => cb());
    }, 15_000);
    this.pollInterval.unref?.();
  }

  private stopPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  connected(): boolean {
    return this.socket?.connected ?? false;
  }

  /** Subscribe to any upstream event, returning an unsubscribe function. */
  on(event: string, cb: (payload: unknown) => void): Unsubscribe {
    const handler = (payload: unknown) => cb(payload);
    const refresh = () => cb({});
    this.socket?.on(event, handler);
    this.refreshCallbacks.add(refresh);
    return () => {
      this.socket?.off(event, handler);
      this.refreshCallbacks.delete(refresh);
    };
  }

  onNotification(cb: (p: RealtimeNotification) => void): Unsubscribe {
    return this.on("notification:new", (payload) => cb(payload as RealtimeNotification));
  }

  onComplaint(cb: (p: ComplaintSocketEvent) => void): Unsubscribe {
    const events = ["complaint.created", "complaint.updated", "complaint.resolved", "complaint.escalated", "complaint.status"];
    const subs = events.map((event) => this.onComplaintEvent(event, cb));
    return () => subs.forEach((s) => s());
  }

  onComplaintEvent(event: string, cb: (p: ComplaintSocketEvent) => void): Unsubscribe {
    return this.on(event, (payload) => cb(payload as ComplaintSocketEvent));
  }

  onEmergency(cb: (p: EmergencySocketEvent) => void): Unsubscribe {
    const subs = ["emergency.created", "emergency.updated"].map((event) => this.onEmergencyEvent(event, cb));
    return () => subs.forEach((s) => s());
  }

  onEmergencyEvent(event: string, cb: (p: EmergencySocketEvent) => void): Unsubscribe {
    return this.on(event, (payload) => cb(payload as EmergencySocketEvent));
  }

  onSlaViolation(cb: (p: SlaSocketEvent) => void): Unsubscribe {
    return this.on("sla.violated", (payload) => cb(payload as SlaSocketEvent));
  }

  destroy(): void {
    this.stopPolling();
    this.socket?.removeAllListeners();
    this.socket?.disconnect();
    this.socket = null;
  }
}

export type { Unsubscribe };

export const realtimeApi: RealtimeApi = new RealtimeClient();
export default realtimeApi;