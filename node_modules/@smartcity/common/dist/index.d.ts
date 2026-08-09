/**
 * Shared Types, DTOs & Utilities for Enterprise Smart City Operating System.
 * Cross-cutting contracts used by all microservices and the shared frontend.
 */
export declare enum UserRole {
    CITIZEN = "CITIZEN",
    OFFICER = "OFFICER",
    DEPARTMENT_HEAD = "DEPARTMENT_HEAD",
    SUPER_ADMIN = "SUPER_ADMIN"
}
export declare enum ComplaintStatus {
    SUBMITTED = "SUBMITTED",
    ASSIGNED = "ASSIGNED",
    IN_PROGRESS = "IN_PROGRESS",
    RESOLVED = "RESOLVED",
    CLOSED = "CLOSED",
    REJECTED = "REJECTED"
}
export declare enum ComplaintPriority {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    CRITICAL = "CRITICAL"
}
export declare enum EmergencyType {
    FIRE = "FIRE",
    MEDICAL = "MEDICAL",
    FLOOD = "FLOOD",
    ACCIDENT = "ACCIDENT",
    PUBLIC_ALERT = "PUBLIC_ALERT"
}
export declare enum EmergencyStatus {
    REPORTED = "REPORTED",
    DISPATCHED = "DISPATCHED",
    ON_SCENE = "ON_SCENE",
    RESOLVED = "RESOLVED"
}
export declare enum NotificationType {
    IN_APP = "IN_APP",
    EMAIL = "EMAIL",
    PUSH = "PUSH",
    SMS = "SMS",
    SYSTEM = "SYSTEM"
}
export declare enum AssetStatus {
    OPERATIONAL = "OPERATIONAL",
    UNDER_MAINTENANCE = "UNDER_MAINTENANCE",
    OUT_OF_SERVICE = "OUT_OF_SERVICE"
}
export declare enum AssetCategory {
    ROAD = "ROAD",
    WATER = "WATER",
    ELECTRICITY = "ELECTRICITY",
    STREET_LIGHT = "STREET_LIGHT",
    PARK = "PARK",
    BUILDING = "BUILDING",
    PUBLIC_TRANSPORT = "PUBLIC_TRANSPORT",
    SANITATION = "SANITATION",
    OTHER = "OTHER"
}
export declare enum AppointmentStatus {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}
export declare const ALL_ROLES: UserRole[];
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
export type PaginatedQuery = PaginationQuery & Record<string, unknown> & {
    page?: number;
    limit?: number;
};
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
export declare class AppError extends Error {
    readonly statusCode: number;
    readonly errors?: Record<string, unknown>;
    constructor(message: string, statusCode?: number, errors?: Record<string, unknown>);
}
export declare class NotFoundError extends AppError {
    constructor(message?: string);
}
export declare class UnauthorizedError extends AppError {
    constructor(message?: string);
}
export declare class ForbiddenError extends AppError {
    constructor(message?: string);
}
export declare class ConflictError extends AppError {
    constructor(message?: string);
}
export declare class ValidationError extends AppError {
    constructor(errors: Record<string, unknown>, message?: string);
}
export declare function createApiResponse<T>(success: boolean, message: string, data?: T, error?: string): ApiResponse<T>;
export declare function createListResponse<T>(items: T[], pagination: Pagination, message?: string): ApiListResponse<T>;
export declare function parsePagination(query: PaginatedQuery): Pagination;
/** Returns a paginated slice + total for in-memory list sources. */
export declare function paginate<T>(items: T[], page?: number, limit?: number): {
    items: T[];
    pagination: Pagination;
};
export declare function toRichText(value: unknown): string;
export declare function generateRef(prefix: string): string;
export declare function uid(prefix?: string): string;
