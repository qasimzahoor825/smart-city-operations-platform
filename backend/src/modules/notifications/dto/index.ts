import { NotificationType } from "@prisma/client";

export interface NotificationQuery {
  page?: number;
  limit?: number;
  userId?: string;
  unread?: boolean;
}

export interface SendNotificationDto {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
  channel?: string;
  payload?: Record<string, unknown>;
}

export interface NotificationPreferencesDto {
  email?: boolean;
  push?: boolean;
  sms?: boolean;
  categories?: string[];
}

export type DeliveryStatus = "SENT" | "SKIPPED";

export interface NotificationDelivery {
  channel: string;
  status: DeliveryStatus;
}

export interface SendNotificationResult {
  notification: {
    id: string;
    type: NotificationType;
    userId: string;
    title: string;
    message: string;
    channel: string;
    isRead: boolean;
    createdAt: string;
  };
  delivery: NotificationDelivery[];
}