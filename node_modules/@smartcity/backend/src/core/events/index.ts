import { EventEmitter } from "node:events";

export enum DomainEvent {
  COMPLAINT_CREATED = "complaint.created",
  COMPLAINT_STATUS_CHANGED = "complaint.status_changed",
  NOTIFICATION_SENT = "notification.sent",
  PAYMENT_COMPLETED = "payment.completed",
  EMERGENCY_REPORTED = "emergency.reported",
  USER_REGISTERED = "user.registered",
  USER_UPDATED = "user.updated",
  APPOINTMENT_BOOKED = "appointment.booked",
}

type Listener<T = unknown> = (payload: T) => void | Promise<void>;

const bus = new EventEmitter();
bus.setMaxListeners(100);

export const eventBus = {
  emit<T>(event: DomainEvent, payload: T): void {
    bus.emit(event, payload);
  },
  on<T>(event: DomainEvent, listener: Listener<T>): () => void {
    bus.on(event, listener as (...args: unknown[]) => void);
    return () => bus.off(event, listener as (...args: unknown[]) => void);
  },
  once<T>(event: DomainEvent, listener: Listener<T>): void {
    bus.once(event, listener as (...args: unknown[]) => void);
  },
};

export default eventBus;