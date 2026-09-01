"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serviceRequestSchema = exports.serviceSchema = exports.trafficZoneSchema = exports.announcementSchema = exports.feedbackSchema = exports.complaintCategorySchema = exports.slaRuleSchema = exports.settingsSchema = exports.auditLogSchema = exports.newsSchema = exports.appointmentSchema = exports.transactionSchema = exports.billSchema = exports.gisLayerSchema = exports.gisMarkerSchema = exports.notificationPreferenceSchema = exports.notificationSchema = exports.emergencySchema = exports.assetInspectionSchema = exports.assetSchema = exports.departmentSchema = exports.complaintTimelineSchema = exports.complaintCommentSchema = exports.complaintSchema = exports.passwordResetSchema = exports.sessionSchema = exports.userSchema = void 0;
exports.registerModels = registerModels;
/**
 * Typed Mongoose schemas for every persisted collection.
 *
 * Schemas are registered lazily by collection name and are picked up by the
 * repository layer (`modelFor`). They provide schema validation and indexes
 * for the real persisted data — no seed/mock documents are ever written
 * through them. Strictness is relaxed (`strict: false`) so existing services
 * can keep using their current field shapes, while key fields stay validated
 * and indexed.
 */
const mongoose_1 = require("mongoose");
const common_1 = require("@smartcity/common");
function keep(name, schema) {
    if (!mongoose_1.models[name])
        (0, mongoose_1.model)(name, schema);
}
const indexedString = (options = {}) => ({
    type: String,
    ...(options.required !== undefined ? { required: options.required } : {}),
    ...(options.unique ? { unique: true } : {}),
    index: options.index ?? true,
});
// ---------------------------------------------------------------------------
// Identity & access
// ---------------------------------------------------------------------------
exports.userSchema = new mongoose_1.Schema({
    id: indexedString({ required: true, unique: true }),
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    phoneNumber: { type: String, default: null },
    role: { type: String, enum: Object.values(common_1.UserRole), default: common_1.UserRole.CITIZEN },
    departmentId: { type: String, default: null },
    avatar: { type: String, default: null },
    isEmailVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true, index: true },
    lastLoginAt: { type: String, default: null },
}, { collection: "users", timestamps: true, minimize: false, strict: false });
exports.userSchema.index({ role: 1 });
exports.userSchema.index({ departmentId: 1 });
exports.sessionSchema = new mongoose_1.Schema({
    id: indexedString({ required: true, unique: true }),
    userId: indexedString({ required: true }),
    refreshToken: { type: String, required: true, index: true },
    userAgent: { type: String, default: null },
    ip: { type: String, default: null },
    expiresAt: { type: String, required: true },
}, { collection: "auth_sessions", strict: false, minimize: false, versionKey: false });
exports.sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
exports.passwordResetSchema = new mongoose_1.Schema({
    id: indexedString({ required: true, unique: true }),
    userId: indexedString({ required: true }),
    tokenHash: { type: String, required: true },
    expiresAt: { type: String, required: true },
    usedAt: { type: String, default: null },
}, { collection: "password_resets", timestamps: true, minimize: false, strict: false });
exports.passwordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// ---------------------------------------------------------------------------
// Complaints
// ---------------------------------------------------------------------------
exports.complaintSchema = new mongoose_1.Schema({
    id: indexedString({ required: true, unique: true }),
    ref: indexedString(),
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: indexedString(),
    status: {
        type: String,
        enum: Object.values(common_1.ComplaintStatus),
        default: common_1.ComplaintStatus.SUBMITTED,
    },
    priority: { type: String, enum: Object.values(common_1.ComplaintPriority), index: true },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    address: { type: String, default: null },
    imageUrls: { type: [String], default: [] },
    location: { type: [Number], default: undefined },
    slaHours: { type: Number, default: 24 },
    slaDeadline: { type: String, default: null },
    slaBreached: { type: Boolean, default: false },
    resolvedAt: { type: String, default: null },
    citizenId: indexedString({ required: true }),
    citizenName: { type: String, default: null },
    assignedToId: indexedString(),
    assignedToName: { type: String, default: null },
    departmentId: indexedString(),
    departmentName: { type: String, default: null },
    ai: {
        category: { type: String, default: null },
        priority: { type: String, default: null },
        departmentId: { type: String, default: null },
        departmentName: { type: String, default: null },
        summary: { type: String, default: null },
        source: { type: String, default: null },
    },
}, { collection: "complaints", strict: false, minimize: false, versionKey: false });
exports.complaintSchema.index({ status: 1 });
exports.complaintSchema.index({ citizenId: 1, status: 1 });
exports.complaintSchema.index({ departmentId: 1, status: 1 });
exports.complaintSchema.index({ createdAt: -1 });
exports.complaintSchema.index({ location: "2dsphere" });
exports.complaintCommentSchema = new mongoose_1.Schema({
    id: indexedString({ required: true, unique: true }),
    complaintId: indexedString({ required: true }),
    authorId: indexedString(),
    authorName: { type: String, default: null },
    body: { type: String, required: true },
}, { collection: "complaint_comments", strict: false, minimize: false, versionKey: false });
exports.complaintCommentSchema.index({ complaintId: 1, createdAt: 1 });
exports.complaintTimelineSchema = new mongoose_1.Schema({
    id: indexedString({ required: true, unique: true }),
    complaintId: indexedString({ required: true }),
    status: indexedString(),
    note: { type: String, default: null },
    actorId: { type: String, default: null },
}, { collection: "complaint_timelines", strict: false, minimize: false, versionKey: false });
exports.complaintTimelineSchema.index({ complaintId: 1, createdAt: 1 });
// ---------------------------------------------------------------------------
// Departments
// ---------------------------------------------------------------------------
exports.departmentSchema = new mongoose_1.Schema({
    id: indexedString({ required: true, unique: true }),
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, index: true },
    description: { type: String, default: null },
    managerId: indexedString(),
    members: { type: [mongoose_1.Schema.Types.Mixed], default: [] },
}, { collection: "departments", strict: false, minimize: false, versionKey: false });
// ---------------------------------------------------------------------------
// Assets
// ---------------------------------------------------------------------------
exports.assetSchema = new mongoose_1.Schema({
    id: indexedString({ required: true, unique: true }),
    name: { type: String, required: true, index: true },
    category: { type: String, enum: Object.values(common_1.AssetCategory), index: true },
    status: { type: String, enum: Object.values(common_1.AssetStatus) },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    address: { type: String, default: null },
    imageUrl: { type: String, default: null },
    location: { type: [Number], default: undefined },
    department: indexedString({ index: false }),
    lastInspectionAt: { type: String, default: null },
    nextInspectionAt: { type: String, default: null },
    maintainedBy: { type: String, default: null },
    lastStatusNote: { type: String, default: null },
    createdBy: { type: String, default: null },
    updatedBy: { type: String, default: null },
}, { collection: "assets", strict: false, minimize: false, versionKey: false });
exports.assetSchema.index({ status: 1 });
exports.assetSchema.index({ department: 1 });
exports.assetSchema.index({ location: "2dsphere" });
exports.assetInspectionSchema = new mongoose_1.Schema({
    id: indexedString({ required: true, unique: true }),
    assetId: indexedString({ required: true }),
    inspectorId: { type: String, default: null },
    status: { type: String },
    findings: { type: String },
    inspectedBy: { type: String },
}, { collection: "asset_inspections", strict: false, minimize: false, versionKey: false });
// ---------------------------------------------------------------------------
// Emergencies
// ---------------------------------------------------------------------------
exports.emergencySchema = new mongoose_1.Schema({
    id: indexedString({ required: true, unique: true }),
    ref: indexedString(),
    type: { type: String, enum: Object.values(common_1.EmergencyType), index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    severity: { type: String, enum: Object.values(common_1.ComplaintPriority), index: true },
    status: { type: String, enum: Object.values(common_1.EmergencyStatus) },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    address: { type: String, default: null },
    location: { type: [Number], default: undefined },
    reportedById: indexedString(),
    reportedByName: { type: String, default: null },
    dispatchedUnit: { type: String, default: null },
    resolvedAt: { type: String, default: null },
    timeline: { type: [String], default: [] },
}, { collection: "emergencies", strict: false, minimize: false, versionKey: false });
exports.emergencySchema.index({ status: 1 });
exports.emergencySchema.index({ type: 1, status: 1 });
exports.emergencySchema.index({ location: "2dsphere" });
// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------
exports.notificationSchema = new mongoose_1.Schema({
    id: indexedString({ required: true, unique: true }),
    type: { type: String, default: "IN_APP" },
    userId: indexedString(),
    title: { type: String, required: true },
    message: { type: String, required: true },
    channel: { type: String, default: "in_app" },
    isRead: { type: Boolean, default: false, index: true },
    payload: { type: mongoose_1.Schema.Types.Mixed, default: null },
}, { collection: "notifications", strict: false, minimize: false, versionKey: false });
exports.notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
exports.notificationPreferenceSchema = new mongoose_1.Schema({
    id: indexedString({ required: true, unique: true }),
    userId: { type: String, required: true, unique: true, index: true },
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    categories: { type: [String], default: [] },
}, { collection: "notification_preferences", strict: false, minimize: false, versionKey: false });
// ---------------------------------------------------------------------------
// GIS markers
// ---------------------------------------------------------------------------
exports.gisMarkerSchema = new mongoose_1.Schema({
    id: indexedString({ required: true, unique: true }),
    type: indexedString(),
    title: { type: String },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    status: { type: String, default: null },
    severity: { type: String, default: null },
    address: { type: String, default: null },
    sourceId: { type: String, default: null },
}, { collection: "gis_markers", strict: false, minimize: false, versionKey: false });
exports.gisLayerSchema = new mongoose_1.Schema({
    id: indexedString({ required: true, unique: true }),
    name: { type: String },
    visible: { type: Boolean, default: true },
    color: { type: String, default: "#3b82f6" },
    description: { type: String, default: null },
}, { collection: "gis_layers", strict: false, minimize: false, versionKey: false });
// ---------------------------------------------------------------------------
// Payments / appointments / news / settings / audit
// ---------------------------------------------------------------------------
exports.billSchema = new mongoose_1.Schema({
    id: indexedString({ required: true, unique: true }),
    userId: indexedString(),
    billType: { type: String },
    amount: { type: Number, default: 0 },
    currency: { type: String, default: "USD" },
    status: { type: String, index: true },
    description: { type: String, default: null },
    dueDate: { type: String, default: null },
}, { collection: "bills", strict: false, minimize: false, versionKey: false });
exports.transactionSchema = new mongoose_1.Schema({
    id: indexedString({ required: true, unique: true }),
    billId: indexedString(),
    userId: indexedString(),
    ref: indexedString(),
    amount: { type: Number, default: 0 },
    currency: { type: String, default: "USD" },
    status: { type: String, default: "COMPLETED" },
    method: { type: String, default: null },
}, { collection: "transactions", strict: false, minimize: false, versionKey: false });
exports.appointmentSchema = new mongoose_1.Schema({
    id: indexedString({ required: true, unique: true }),
    userId: indexedString(),
    citizenId: indexedString(),
    departmentId: indexedString(),
    service: { type: String, default: null },
    date: { type: String, default: null },
    time: { type: String, default: null },
    status: { type: String, default: "PENDING", index: true },
    notes: { type: String, default: null },
}, { collection: "appointments", strict: false, minimize: false, versionKey: false });
exports.newsSchema = new mongoose_1.Schema({
    id: indexedString({ required: true, unique: true }),
    title: { type: String },
    content: { type: String },
    category: { type: String, default: "general" },
    status: { type: String, default: "PUBLISHED", index: true },
    publishedAt: { type: String, default: null },
    imageUrl: { type: String, default: null },
    authorId: indexedString(),
}, { collection: "news_articles", strict: false, minimize: false, versionKey: false });
exports.auditLogSchema = new mongoose_1.Schema({
    id: indexedString({ required: true, unique: true }),
    actorId: indexedString(),
    action: indexedString(),
    entity: { type: String, default: null },
    entityId: { type: String, default: null },
    meta: { type: mongoose_1.Schema.Types.Mixed, default: null },
    ip: { type: String, default: null },
}, { collection: "audit_logs", strict: false, minimize: false, versionKey: false });
exports.auditLogSchema.index({ createdAt: -1 });
exports.settingsSchema = new mongoose_1.Schema({
    id: indexedString({ required: true, unique: true }),
    key: { type: String, default: null, index: true },
    value: { type: mongoose_1.Schema.Types.Mixed, default: null },
    updatedBy: { type: String, default: null },
}, { collection: "system_settings", strict: false, minimize: false, versionKey: false });
// ---------------------------------------------------------------------------
// Configurable SLA rules (department / category / priority → hours)
// ---------------------------------------------------------------------------
exports.slaRuleSchema = new mongoose_1.Schema({
    id: indexedString({ required: true, unique: true }),
    name: { type: String, required: true },
    priority: { type: String, required: true, index: true },
    category: { type: String, default: null, index: true },
    departmentId: { type: String, default: null, index: true },
    hours: { type: Number, required: true },
    active: { type: Boolean, default: true },
}, { collection: "sla_rules", strict: false, minimize: false, versionKey: false });
exports.slaRuleSchema.index({ departmentId: 1, category: 1, priority: 1 });
// ---------------------------------------------------------------------------
// Complaint category catalog (seeded reference data)
// ---------------------------------------------------------------------------
exports.complaintCategorySchema = new mongoose_1.Schema({
    id: indexedString({ required: true, unique: true }),
    name: { type: String, required: true, unique: true, index: true },
    code: { type: String, index: true },
    description: { type: String, default: null },
    departmentId: { type: String, default: null, index: true },
    suggestedPriority: { type: String, default: "MEDIUM" },
    active: { type: Boolean, default: true },
}, { collection: "complaint_categories", strict: false, minimize: false, versionKey: false });
// ---------------------------------------------------------------------------
// Citizen feedback / ratings on resolved complaints
// ---------------------------------------------------------------------------
exports.feedbackSchema = new mongoose_1.Schema({
    id: indexedString({ required: true, unique: true }),
    complaintId: { type: String, required: true },
    citizenId: { type: String, required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: null },
    createdAt: { type: String, required: true },
}, { collection: "feedback", strict: false, minimize: false, versionKey: false });
exports.feedbackSchema.index({ complaintId: 1 }, { unique: true });
// ---------------------------------------------------------------------------
// Public announcements
// ---------------------------------------------------------------------------
exports.announcementSchema = new mongoose_1.Schema({
    id: indexedString({ required: true, unique: true }),
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, default: "general", index: true },
    status: { type: String, default: "PUBLISHED", index: true },
    publishedAt: { type: String, default: null },
    imageUrl: { type: String, default: null },
    authorId: { type: String, default: null },
}, { collection: "announcements", strict: false, minimize: false, versionKey: false });
// ---------------------------------------------------------------------------
// Traffic zones (GIS reference data)
// ---------------------------------------------------------------------------
exports.trafficZoneSchema = new mongoose_1.Schema({
    id: indexedString({ required: true, unique: true }),
    name: { type: String, required: true },
    congestion: { type: String, default: "LOW", index: true },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    bounds: { type: [Number], default: [] },
    updatedAt: { type: String, default: null },
}, { collection: "traffic_zones", strict: false, minimize: false, versionKey: false });
exports.trafficZoneSchema.index({ latitude: 1, longitude: 1 });
// ---------------------------------------------------------------------------
// Service catalog + citizen service requests
// ---------------------------------------------------------------------------
exports.serviceSchema = new mongoose_1.Schema({
    id: indexedString({ required: true, unique: true }),
    name: { type: String, required: true, index: true },
    code: { type: String, index: true },
    description: { type: String, default: null },
    departmentId: { type: String, default: null, index: true },
    category: { type: String, default: "GENERAL", index: true },
    fee: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
}, { collection: "services", strict: false, minimize: false, versionKey: false });
exports.serviceRequestSchema = new mongoose_1.Schema({
    id: indexedString({ required: true, unique: true }),
    ref: indexedString(),
    serviceId: { type: String, default: null },
    serviceName: { type: String, default: null },
    citizenId: indexedString(),
    citizenName: { type: String, default: null },
    departmentId: { type: String, default: null },
    departmentName: { type: String, default: null },
    status: { type: String, default: "SUBMITTED", index: true },
    description: { type: String, default: null },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    resolvedAt: { type: String, default: null },
    createdAt: { type: String, required: true },
    updatedAt: { type: String, default: null },
}, { collection: "service_requests", strict: false, minimize: false, versionKey: false });
exports.serviceRequestSchema.index({ citizenId: 1, status: 1 });
exports.serviceRequestSchema.index({ departmentId: 1, status: 1 });
/**
 * Register every schema under its collection name so the repository layer
 * (`modelFor`) picks them up instead of the lenient fallback.
 */
function registerModels() {
    keep("users", exports.userSchema);
    keep("auth_sessions", exports.sessionSchema);
    keep("password_resets", exports.passwordResetSchema);
    keep("complaints", exports.complaintSchema);
    keep("complaint_comments", exports.complaintCommentSchema);
    keep("complaint_timelines", exports.complaintTimelineSchema);
    keep("departments", exports.departmentSchema);
    keep("assets", exports.assetSchema);
    keep("asset_inspections", exports.assetInspectionSchema);
    keep("emergencies", exports.emergencySchema);
    keep("notifications", exports.notificationSchema);
    keep("notification_preferences", exports.notificationPreferenceSchema);
    keep("gis_markers", exports.gisMarkerSchema);
    keep("gis_layers", exports.gisLayerSchema);
    keep("bills", exports.billSchema);
    keep("transactions", exports.transactionSchema);
    keep("appointments", exports.appointmentSchema);
    keep("news_articles", exports.newsSchema);
    keep("audit_logs", exports.auditLogSchema);
    keep("system_settings", exports.settingsSchema);
    keep("sla_rules", exports.slaRuleSchema);
    keep("complaint_categories", exports.complaintCategorySchema);
    keep("feedback", exports.feedbackSchema);
    keep("announcements", exports.announcementSchema);
    keep("traffic_zones", exports.trafficZoneSchema);
    keep("services", exports.serviceSchema);
    keep("service_requests", exports.serviceRequestSchema);
}
exports.default = registerModels;
//# sourceMappingURL=index.js.map