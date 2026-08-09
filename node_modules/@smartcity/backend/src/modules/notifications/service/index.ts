import { NotificationType } from "@prisma/client";
import {
  AppError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  paginate,
  type Pagination,
} from "@smartcity/common";
import { authRepository } from "../../auth/repository";
import { emitToRoom } from "../../../core/socket";
import {
  notificationRepository,
  type StoredNotification,
  type StoredNotificationPreference,
} from "../repository";
import type {
  NotificationQuery,
  NotificationPreferencesDto,
  SendNotificationDto,
  SendNotificationResult,
  NotificationDelivery,
} from "../dto";

const DEFAULT_CATEGORIES = ["complaints", "payments", "emergencies", "appointments", "system"];

export interface NotifyOptions {
  type?: NotificationType;
  channel?: string;
  payload?: Record<string, unknown> | null;
}

function publishSocket(notification: StoredNotification): void {
  const userId = notification.userId ?? null;
  if (userId) emitToRoom(`user:${userId}`, "notification:new", notification);
  emitToRoom("staff", "notification:new", notification);
}

function dispatch(notification: StoredNotification): NotificationDelivery[] {
  const results: NotificationDelivery[] = [];
  const targets = new Set<string>();

  if (notification.type === NotificationType.IN_APP || notification.channel === "in_app") {
    targets.add("in_app");
  }
  if (notification.type === NotificationType.EMAIL || notification.channel === "email") {
    targets.add("email");
  }
  if (notification.type === NotificationType.PUSH || notification.channel === "push") {
    targets.add("push");
  }
  if (notification.type === NotificationType.SMS || notification.channel === "sms") {
    targets.add("sms");
  }

  targets.forEach((channel) => {
    results.push({ channel, status: "SENT" });
  });

  if (results.length === 0) results.push({ channel: "in_app", status: "SENT" });
  return results;
}

export const notificationService = {
  async list(query: NotificationQuery = {}): Promise<{ items: StoredNotification[]; pagination: Pagination }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const userId = query.userId ?? null;
    const items = notificationRepository.notifications.query({
      filter: (n) =>
        (userId === null || n.userId === userId) && (query.unread === undefined || n.isRead !== query.unread),
      sort: (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    });
    const { items: paged, pagination } = paginate(items, page, limit);
    return { items: paged, pagination };
  },

  async unreadCount(userId: string): Promise<{ count: number }> {
    const count = notificationRepository.notifications
      .all()
      .filter((n) => n.userId === userId && !n.isRead).length;
    return { count };
  },

  async markRead(id: string, userId: string): Promise<StoredNotification> {
    const notification = notificationRepository.notifications.findById(id);
    if (!notification) throw new NotFoundError("Notification not found");
    if (notification.userId !== null && notification.userId !== userId) {
      throw new ForbiddenError("Cannot modify another user's notification");
    }
    const updated = notificationRepository.notifications.update(id, { isRead: true } as Partial<StoredNotification>);
    if (!updated) throw new NotFoundError("Notification not found");
    return updated;
  },

  async readAll(userId: string): Promise<{ updated: number }> {
    let updated = 0;
    notificationRepository.notifications
      .all()
      .filter((n) => n.userId === userId && !n.isRead)
      .forEach((n) => {
        notificationRepository.notifications.update(n.id, { isRead: true } as Partial<StoredNotification>);
        updated += 1;
      });
    return { updated };
  },

  async send(dto: SendNotificationDto): Promise<SendNotificationResult> {
    const title = (dto.title ?? "").trim();
    const message = (dto.message ?? "").trim();
    if (!title) throw new ValidationError({ title: "title is required" });
    if (!message) throw new ValidationError({ message: "message is required" });

    const user = authRepository.users.findById(dto.userId);
    if (!user) throw new AppError("User not found", 404);

    const notification = notificationRepository.notifications.create({
      type: dto.type ?? NotificationType.IN_APP,
      userId: dto.userId,
      title,
      message,
      channel: (dto.channel ?? "in_app").trim().toLowerCase() || "in_app",
      isRead: false,
      payload: dto.payload ?? null,
      createdAt: new Date().toISOString(),
    } as unknown as StoredNotification);

    publishSocket(notification);

    return {
      notification: {
        id: notification.id,
        type: notification.type,
        userId: notification.userId ?? dto.userId,
        title: notification.title,
        message: notification.message,
        channel: notification.channel,
        isRead: notification.isRead,
        createdAt: notification.createdAt,
      },
      delivery: dispatch(notification),
    };
  },

  /**
   * Programmatic notifications from business workflows (complaint assigned,
   * emergency reported, payment confirmed…). Persists the notification and
   * pushes it to the recipient's socket room in one step.
   */
  async notify(
    userId: string,
    title: string,
    message: string,
    options: NotifyOptions = {},
  ): Promise<StoredNotification> {
    const channel = (options.channel ?? "in_app").trim().toLowerCase() || "in_app";
    const notification = notificationRepository.notifications.create({
      type: options.type ?? NotificationType.IN_APP,
      userId,
      title,
      message,
      channel,
      isRead: false,
      payload: options.payload ?? null,
      createdAt: new Date().toISOString(),
    } as unknown as StoredNotification);
    publishSocket(notification);
    return notification;
  },

  async getPreferences(userId: string): Promise<StoredNotificationPreference> {
    const existing = notificationRepository.findPreference(userId);
    if (existing) return existing;
    return notificationRepository.preferences.create({
      userId,
      email: true,
      push: true,
      sms: true,
      categories: [...DEFAULT_CATEGORIES],
      updatedAt: new Date().toISOString(),
    } as unknown as StoredNotificationPreference);
  },

  async updatePreferences(userId: string, dto: NotificationPreferencesDto): Promise<StoredNotificationPreference> {
    const now = new Date().toISOString();
    const existing = notificationRepository.findPreference(userId);
    if (!existing) {
      return notificationRepository.preferences.create({
        userId,
        email: dto.email ?? true,
        push: dto.push ?? true,
        sms: dto.sms ?? true,
        categories: dto.categories ?? [...DEFAULT_CATEGORIES],
        updatedAt: now,
      } as unknown as StoredNotificationPreference);
    }

    const patch: Partial<StoredNotificationPreference> = { updatedAt: now };
    if (dto.email !== undefined) patch.email = dto.email;
    if (dto.push !== undefined) patch.push = dto.push;
    if (dto.sms !== undefined) patch.sms = dto.sms;
    if (dto.categories !== undefined) patch.categories = dto.categories;
    const updated = notificationRepository.preferences.update(existing.id, patch);
    if (!updated) throw new NotFoundError("Preferences not found");
    return updated;
  },
};

export default notificationService;