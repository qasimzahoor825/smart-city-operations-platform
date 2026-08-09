/**
 * Shared Types, DTOs & Utilities for Enterprise Smart City Operating System.
 * Cross-cutting contracts used by all microservices and the shared frontend.
 */

// ===================== ENUMS =====================

export enum UserRole {
  CITIZEN = "CITIZEN",
  OFFICER = "OFFICER",
  DEPARTMENT_HEAD = "DEPARTMENT_HEAD",
  SUPER_ADMIN = "SUPER_ADMIN",
}

export enum ComplaintStatus {
  SUBMITTED = "SUBMITTED",
  RECEIVED = "RECEIVED",
  ASSIGNED = "ASSIGNED",
  UNDER_REVIEW = "UNDER_REVIEW",
  FIELD_INSPECTION = "FIELD_INSPECTION",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED = "RESOLVED",
  CITIZEN_FEEDBACK = "CITIZEN_FEEDBACK",
  CLOSED = "CLOSED",
  REJECTED = "REJECTED",
  ESCALATED = "ESCALATED",
  CANCELLED = "CANCELLED",
}

/** Ordered complaint lifecycle (primary happy path). */
export const COMPLAINT_FLOW: ComplaintStatus[] = [
  ComplaintStatus.SUBMITTED,
  ComplaintStatus.RECEIVED,
  ComplaintStatus.ASSIGNED,
  ComplaintStatus.UNDER_REVIEW,
  ComplaintStatus.FIELD_INSPECTION,
  ComplaintStatus.IN_PROGRESS,
  ComplaintStatus.RESOLVED,
  ComplaintStatus.CITIZEN_FEEDBACK,
  ComplaintStatus.CLOSED,
];

export enum ComplaintPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export enum EmergencyType {
  FIRE = "FIRE",
  MEDICAL = "MEDICAL",
  FLOOD = "FLOOD",
  ACCIDENT = "ACCIDENT",
  PUBLIC_ALERT = "PUBLIC_ALERT",
}

export enum EmergencyStatus {
  REPORTED = "REPORTED",
  ACKNOWLEDGED = "ACKNOWLEDGED",
  DISPATCHED = "DISPATCHED",
  ON_SCENE = "ON_SCENE",
  RESOLVED = "RESOLVED",
  CLOSED = "CLOSED",
}

export enum NotificationType {
  IN_APP = "IN_APP",
  EMAIL = "EMAIL",
  PUSH = "PUSH",
  SMS = "SMS",
  SYSTEM = "SYSTEM",
}

export enum AssetStatus {
  ACTIVE = "ACTIVE",
  OPERATIONAL = "OPERATIONAL",
  MAINTENANCE = "MAINTENANCE",
  UNDER_MAINTENANCE = "UNDER_MAINTENANCE",
  DAMAGED = "DAMAGED",
  INACTIVE = "INACTIVE",
  RETIRED = "RETIRED",
  OUT_OF_SERVICE = "OUT_OF_SERVICE",
}

export enum AssetCategory {
  ROAD = "ROAD",
  WATER = "WATER",
  ELECTRICITY = "ELECTRICITY",
  STREET_LIGHT = "STREET_LIGHT",
  PARK = "PARK",
  BUILDING = "BUILDING",
  PUBLIC_TRANSPORT = "PUBLIC_TRANSPORT",
  SANITATION = "SANITATION",
  OTHER = "OTHER",
}

export enum AppointmentStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export const ALL_ROLES: UserRole[] = [
  UserRole.CITIZEN,
  UserRole.OFFICER,
  UserRole.DEPARTMENT_HEAD,
  UserRole.SUPER_ADMIN,
];

// ===================== GENERIC CONTRACTS =====================

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  timestamp: string;
  data?: T;
  error?: string;
  errors?: Record<string, unknown>;
}

export interface ApiListResponse<T> {
  success: boolean;
  message: string;
  timestamp: string;
  data: T[];
  pagination: Pagination;
}

export type PaginatedQuery = PaginationQuery &
  Record<string, unknown> & { page?: number; limit?: number };

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
  search?: string;
}

export interface ServiceHealthStatus {
  service: string;
  status: "UP" | "DOWN" | "DEGRADED";
  uptimeSeconds: number;
  timestamp: string;
}

export interface AuthenticatedActor {
  id: string;
  email: string;
  role: UserRole;
  departmentId?: string | null;
}

// ====================== HTTP ERROR =====================

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errors?: Record<string, unknown>;

  constructor(message: string, statusCode = 500, errors?: Record<string, unknown>) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404);
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403);
    this.name = "ForbiddenError";
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflict") {
    super(message, 409);
    this.name = "ConflictError";
  }
}

export class ValidationError extends AppError {
  constructor(errors: Record<string, unknown>, message = "Validation failed") {
    super(message, 422, errors);
    this.name = "ValidationError";
  }
}

// ====================== HELPERS =====================

export function createApiResponse<T>(
  success: boolean,
  message: string,
  data?: T,
  error?: string,
): ApiResponse<T> {
  return { success, message, data, error, timestamp: new Date().toISOString() };
}

export function createListResponse<T>(
  items: T[],
  pagination: Pagination,
  message = "Success",
): ApiListResponse<T> {
  return { success: true, message, data: items, pagination, timestamp: new Date().toISOString() };
}

export function parsePagination(query: PaginatedQuery): Pagination {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  return { page, limit, total: 0, totalPages: 0 };
}

/** Returns a paginated slice + total for in-memory list sources. */
export function paginate<T>(items: T[], page = 1, limit = 20): { items: T[]; pagination: Pagination } {
  const total = items.length;
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
  const start = (page - 1) * limit;
  return {
    items: items.slice(start, start + limit),
    pagination: { page, limit, total, totalPages },
  };
}

export function toRichText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function generateRef(prefix: string): string {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 90 + 10)}`;
}

export function uid(prefix = "id"): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}