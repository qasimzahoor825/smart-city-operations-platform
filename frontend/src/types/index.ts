export type Role = "CITIZEN" | "OFFICER" | "DEPARTMENT_HEAD" | "SUPER_ADMIN";

export type ComplaintStatus =
  | "SUBMITTED"
  | "RECEIVED"
  | "ASSIGNED"
  | "UNDER_REVIEW"
  | "FIELD_INSPECTION"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CITIZEN_FEEDBACK"
  | "CLOSED"
  | "REJECTED"
  | "ESCALATED"
  | "CANCELLED";

export type ComplaintPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type EmergencyStatus = "REPORTED" | "ACKNOWLEDGED" | "DISPATCHED" | "ON_SCENE" | "RESOLVED" | "CLOSED";
export type EmergencyType = "FIRE" | "MEDICAL" | "FLOOD" | "ACCIDENT" | "PUBLIC_ALERT";

export type AssetStatus =
  | "OPERATIONAL"
  | "UNDER_MAINTENANCE"
  | "OUT_OF_SERVICE"
  | "ACTIVE"
  | "MAINTENANCE"
  | "DAMAGED"
  | "INACTIVE"
  | "RETIRED";
export type AssetCategory =
  | "ROAD"
  | "WATER"
  | "ELECTRICITY"
  | "STREET_LIGHT"
  | "PARK"
  | "BUILDING"
  | "PUBLIC_TRANSPORT"
  | "SANITATION"
  | "OTHER";

export type AppointmentStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
export type NotificationType = "IN_APP" | "EMAIL" | "PUSH" | "SMS" | "SYSTEM";

export interface User {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  phone?: string;
  phoneNumber?: string | null;
  avatar?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  departmentId?: string | null;
}

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  phoneNumber?: string | null;
  departmentId?: string | null;
  isEmailVerified: boolean;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, unknown>;
  timestamp: string;
}

export interface ApiErrorPayload {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// ---------- Domain models ----------
export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  latitude?: number | null;
  longitude?: number | null;
  address?: string;
  imageUrls: string[];
  slaHours: number;
  slaDeadline?: string;
  resolvedAt?: string;
  citizenId: string;
  assignedToId?: string | null;
  departmentId?: string | null;
  departmentName?: string;
  comments: ComplaintComment[];
  timeline: ComplaintTimelineEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface ComplaintComment {
  id: string;
  authorId: string;
  author: string;
  body: string;
  createdAt: string;
}

export interface ComplaintTimelineEntry {
  status: ComplaintStatus;
  note?: string;
  actorId?: string;
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  createdAt: string;
}

export interface Officer {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  departmentId?: string | null;
  departmentName?: string;
  active: boolean;
}

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  status: AssetStatus;
  latitude?: number | null;
  longitude?: number | null;
  address: string;
  department: string;
  imageUrl?: string;
  lastInspection?: string;
  nextInspection?: string;
}

export interface Emergency {
  id: string;
  type: EmergencyType;
  title: string;
  description: string;
  severity: ComplaintPriority;
  status: EmergencyStatus;
  latitude?: number | null;
  longitude?: number | null;
  address: string;
  reportedBy: string;
  timeline: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  title: string;
  scheduledAt: string;
  status: AppointmentStatus;
  citizenId?: string | null;
  department: string;
  citizenName?: string;
}

export interface AppNotification {
  id: string;
  type: NotificationType;
  userId?: string | null;
  title: string;
  message: string;
  channel: string;
  isRead: boolean;
  createdAt: string;
}

export interface PaymentTransaction {
  id: string;
  billType: string;
  amount: number;
  currency: string;
  status: string;
  transactionRef: string;
  userId: string;
  description?: string;
  paidAt: string;
}

export interface Bill {
  id: string;
  billType: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  dueAt?: string;
  dueDate?: string;
  userId: string;
}

export interface MapMarker {
  id: string;
  type: "complaint" | "asset" | "hospital" | "police" | "emergency";
  title: string;
  latitude: number;
  longitude: number;
  status?: string;
  severity?: string;
  address?: string | null;
}

export interface LiveSensorReading {
  sensorId: string;
  sensorName: string;
  sensorType: string;
  metricName?: string;
  metricValue: number | null;
  unit: string;
  latitude?: number;
  longitude?: number;
  timestamp?: string | null;
}