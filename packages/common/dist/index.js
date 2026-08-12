"use strict";
/**
 * Shared Types, DTOs & Utilities for Enterprise Smart City Operating System.
 * Cross-cutting contracts used by all microservices and the shared frontend.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = exports.ConflictError = exports.ForbiddenError = exports.UnauthorizedError = exports.NotFoundError = exports.AppError = exports.ALL_ROLES = exports.AppointmentStatus = exports.AssetCategory = exports.AssetStatus = exports.NotificationType = exports.EmergencyStatus = exports.EmergencyType = exports.ComplaintPriority = exports.COMPLAINT_FLOW = exports.ComplaintStatus = exports.UserRole = void 0;
exports.createApiResponse = createApiResponse;
exports.createListResponse = createListResponse;
exports.parsePagination = parsePagination;
exports.paginate = paginate;
exports.toRichText = toRichText;
exports.generateRef = generateRef;
exports.uid = uid;
// ===================== ENUMS =====================
var UserRole;
(function (UserRole) {
    UserRole["CITIZEN"] = "CITIZEN";
    UserRole["OFFICER"] = "OFFICER";
    UserRole["DEPARTMENT_HEAD"] = "DEPARTMENT_HEAD";
    UserRole["SUPER_ADMIN"] = "SUPER_ADMIN";
})(UserRole || (exports.UserRole = UserRole = {}));
var ComplaintStatus;
(function (ComplaintStatus) {
    ComplaintStatus["SUBMITTED"] = "SUBMITTED";
    ComplaintStatus["RECEIVED"] = "RECEIVED";
    ComplaintStatus["ASSIGNED"] = "ASSIGNED";
    ComplaintStatus["UNDER_REVIEW"] = "UNDER_REVIEW";
    ComplaintStatus["FIELD_INSPECTION"] = "FIELD_INSPECTION";
    ComplaintStatus["IN_PROGRESS"] = "IN_PROGRESS";
    ComplaintStatus["RESOLVED"] = "RESOLVED";
    ComplaintStatus["CITIZEN_FEEDBACK"] = "CITIZEN_FEEDBACK";
    ComplaintStatus["CLOSED"] = "CLOSED";
    ComplaintStatus["REJECTED"] = "REJECTED";
    ComplaintStatus["ESCALATED"] = "ESCALATED";
    ComplaintStatus["CANCELLED"] = "CANCELLED";
})(ComplaintStatus || (exports.ComplaintStatus = ComplaintStatus = {}));
/** Ordered complaint lifecycle (primary happy path). */
exports.COMPLAINT_FLOW = [
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
var ComplaintPriority;
(function (ComplaintPriority) {
    ComplaintPriority["LOW"] = "LOW";
    ComplaintPriority["MEDIUM"] = "MEDIUM";
    ComplaintPriority["HIGH"] = "HIGH";
    ComplaintPriority["CRITICAL"] = "CRITICAL";
})(ComplaintPriority || (exports.ComplaintPriority = ComplaintPriority = {}));
var EmergencyType;
(function (EmergencyType) {
    EmergencyType["FIRE"] = "FIRE";
    EmergencyType["MEDICAL"] = "MEDICAL";
    EmergencyType["FLOOD"] = "FLOOD";
    EmergencyType["ACCIDENT"] = "ACCIDENT";
    EmergencyType["PUBLIC_ALERT"] = "PUBLIC_ALERT";
})(EmergencyType || (exports.EmergencyType = EmergencyType = {}));
var EmergencyStatus;
(function (EmergencyStatus) {
    EmergencyStatus["REPORTED"] = "REPORTED";
    EmergencyStatus["ACKNOWLEDGED"] = "ACKNOWLEDGED";
    EmergencyStatus["DISPATCHED"] = "DISPATCHED";
    EmergencyStatus["ON_SCENE"] = "ON_SCENE";
    EmergencyStatus["RESOLVED"] = "RESOLVED";
    EmergencyStatus["CLOSED"] = "CLOSED";
})(EmergencyStatus || (exports.EmergencyStatus = EmergencyStatus = {}));
var NotificationType;
(function (NotificationType) {
    NotificationType["IN_APP"] = "IN_APP";
    NotificationType["EMAIL"] = "EMAIL";
    NotificationType["PUSH"] = "PUSH";
    NotificationType["SMS"] = "SMS";
    NotificationType["SYSTEM"] = "SYSTEM";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
var AssetStatus;
(function (AssetStatus) {
    AssetStatus["ACTIVE"] = "ACTIVE";
    AssetStatus["OPERATIONAL"] = "OPERATIONAL";
    AssetStatus["MAINTENANCE"] = "MAINTENANCE";
    AssetStatus["UNDER_MAINTENANCE"] = "UNDER_MAINTENANCE";
    AssetStatus["DAMAGED"] = "DAMAGED";
    AssetStatus["INACTIVE"] = "INACTIVE";
    AssetStatus["RETIRED"] = "RETIRED";
    AssetStatus["OUT_OF_SERVICE"] = "OUT_OF_SERVICE";
})(AssetStatus || (exports.AssetStatus = AssetStatus = {}));
var AssetCategory;
(function (AssetCategory) {
    AssetCategory["ROAD"] = "ROAD";
    AssetCategory["WATER"] = "WATER";
    AssetCategory["ELECTRICITY"] = "ELECTRICITY";
    AssetCategory["STREET_LIGHT"] = "STREET_LIGHT";
    AssetCategory["PARK"] = "PARK";
    AssetCategory["BUILDING"] = "BUILDING";
    AssetCategory["PUBLIC_TRANSPORT"] = "PUBLIC_TRANSPORT";
    AssetCategory["SANITATION"] = "SANITATION";
    AssetCategory["OTHER"] = "OTHER";
})(AssetCategory || (exports.AssetCategory = AssetCategory = {}));
var AppointmentStatus;
(function (AppointmentStatus) {
    AppointmentStatus["PENDING"] = "PENDING";
    AppointmentStatus["CONFIRMED"] = "CONFIRMED";
    AppointmentStatus["COMPLETED"] = "COMPLETED";
    AppointmentStatus["CANCELLED"] = "CANCELLED";
})(AppointmentStatus || (exports.AppointmentStatus = AppointmentStatus = {}));
exports.ALL_ROLES = [
    UserRole.CITIZEN,
    UserRole.OFFICER,
    UserRole.DEPARTMENT_HEAD,
    UserRole.SUPER_ADMIN,
];
// ====================== HTTP ERROR =====================
class AppError extends Error {
    statusCode;
    errors;
    constructor(message, statusCode = 500, errors) {
        super(message);
        this.name = "AppError";
        this.statusCode = statusCode;
        this.errors = errors;
        Error.captureStackTrace?.(this, this.constructor);
    }
}
exports.AppError = AppError;
class NotFoundError extends AppError {
    constructor(message = "Resource not found") {
        super(message, 404);
        this.name = "NotFoundError";
    }
}
exports.NotFoundError = NotFoundError;
class UnauthorizedError extends AppError {
    constructor(message = "Unauthorized") {
        super(message, 401);
        this.name = "UnauthorizedError";
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends AppError {
    constructor(message = "Forbidden") {
        super(message, 403);
        this.name = "ForbiddenError";
    }
}
exports.ForbiddenError = ForbiddenError;
class ConflictError extends AppError {
    constructor(message = "Conflict") {
        super(message, 409);
        this.name = "ConflictError";
    }
}
exports.ConflictError = ConflictError;
class ValidationError extends AppError {
    constructor(errors, message = "Validation failed") {
        super(message, 422, errors);
        this.name = "ValidationError";
    }
}
exports.ValidationError = ValidationError;
// ====================== HELPERS =====================
function createApiResponse(success, message, data, error) {
    return { success, message, data, error, timestamp: new Date().toISOString() };
}
function createListResponse(items, pagination, message = "Success") {
    return { success: true, message, data: items, pagination, timestamp: new Date().toISOString() };
}
function parsePagination(query) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    return { page, limit, total: 0, totalPages: 0 };
}
/** Returns a paginated slice + total for in-memory list sources. */
function paginate(items, page = 1, limit = 20) {
    const total = items.length;
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
    const start = (page - 1) * limit;
    return {
        items: items.slice(start, start + limit),
        pagination: { page, limit, total, totalPages },
    };
}
function toRichText(value) {
    return typeof value === "string" ? value.trim() : "";
}
function generateRef(prefix) {
    return `${prefix}-${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 90 + 10)}`;
}
function uid(prefix = "id") {
    return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}
