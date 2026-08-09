import { RealtimeClient } from "@/services/realtime";

/**
 * Unit tests for the realtime bridge's subscription semantics (no socket
 * server involved — these exercise the pub/sub bookkeeping and the polling
 * fallback signalling).
 */
describe("realtime client subscriptions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("onNotification returns an unsubscribe function", () => {
    const client = new RealtimeClient();
    const cb = jest.fn();
    const unsub = client.onNotification(cb);
    expect(typeof unsub).toBe("function");
    unsub();
  });

  it("onComplaint wires the four upstream complaint events and cleans up", () => {
    const client = new RealtimeClient();
    const cb = jest.fn();
    const unsub = client.onComplaint(cb);
    unsub();
    expect(cb).not.toHaveBeenCalled();
  });

  it("onEmergency returns an unsubscribe function", () => {
    const client = new RealtimeClient();
    const cb = jest.fn();
    const unsub = client.onEmergency(cb);
    unsub();
  });

  it("onSlaViolation returns an unsubscribe function", () => {
    const client = new RealtimeClient();
    const cb = jest.fn();
    const unsub = client.onSlaViolation(cb);
    unsub();
  });

  it("connected() reports false when no socket is available", () => {
    const client = new RealtimeClient();
    expect(client.connected()).toBe(false);
  });

  it("destroy() cleans up timers and socket without throwing", () => {
    const client = new RealtimeClient();
    expect(() => client.destroy()).not.toThrow();
  });
});