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
import { Schema, model as mongooseModel, models } from "mongoose";
import {
  UserRole,
  ComplaintStatus,
  ComplaintPriority,
  EmergencyType,
  EmergencyStatus,
  AssetStatus,
  AssetCategory,
} from "@smartcity/common";

function keep<T>(name: string, schema: Schema): void {
  if (!models[name]) mongooseModel(name, schema);
}

const indexedString = (options: { required?: boolean; index?: boolean | "asc" | "desc"; unique?: boolean } = {}) => ({
  type: String,
  ...(options.required !== undefined ? { required: options.required } : {}),
  ...(options.unique ? { unique: true } : {}),
  index: options.index ?? true,
});

// ---------------------------------------------------------------------------
// Identity & access
// ---------------------------------------------------------------------------
export const userSchema = new Schema<any>(
  {
    id: indexedString({ required: true, unique: true }),
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    phoneNumber: { type: String, default: null },
    role: { type: String, enum: Object.values(UserRole), default: UserRole.CITIZEN, index: true },
    departmentId: { type: String, default: null, index: true },
    avatar: { type: String, default: null },
    isEmailVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true, index: true },
    lastLoginAt: { type: String, default: null },
  },
  { collection: "users", timestamps: true, minimize: false, strict: false },
);
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ departmentId: 1 });

export const sessionSchema = new Schema<any>(
  {
    id: indexedString({ required: true, unique: true }),
    userId: indexedString({ required: true }),
    refreshToken: { type: String, required: true, index: true },
    userAgent: { type: String, default: null },
    ip: { type: String, default: null },
    expiresAt: { type: String, required: true, index: true },
  },
  { collection: "auth_sessions", strict: false, minimize: false, versionKey: false },
);
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const passwordResetSchema = new Schema<any>(
  {
    id: indexedString({ required: true, unique: true }),
    userId: indexedString({ required: true }),
    tokenHash: { type: String, required: true },
    expiresAt: { type: String, required: true, index: true },
    usedAt: { type: String, default: null },
  },
  { collection: "password_resets", timestamps: true, minimize: false, strict: false },
);
passwordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// ---------------------------------------------------------------------------
// Complaints
// ---------------------------------------------------------------------------
export const complaintSchema = new Schema<any>(
  {
    id: indexedString({ required: true, unique: true }),
    ref: indexedString(),
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: indexedString(),
    status: {
      type: String,
      enum: Object.values(ComplaintStatus),
      default: ComplaintStatus.SUBMITTED,
      index: true,
    },
    priority: { type: String, enum: Object.values(ComplaintPriority), index: true },
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
  },
  { collection: "complaints", strict: false, minimize: false, versionKey: false },
);
complaintSchema.index({ status: 1 });
complaintSchema.index({ citizenId: 1, status: 1 });
complaintSchema.index({ departmentId: 1, status: 1 });
complaintSchema.index({ createdAt: -1 });
complaintSchema.index({ location: "2dsphere" });

export const complaintCommentSchema = new Schema<any>(
  {
    id: indexedString({ required: true, unique: true }),
    complaintId: indexedString({ required: true }),
    authorId: indexedString(),
    authorName: { type: String, default: null },
    body: { type: String, required: true },
  },
  { collection: "complaint_comments", strict: false, minimize: false, versionKey: false },
);
complaintCommentSchema.index({ complaintId: 1, createdAt: 1 });

export const complaintTimelineSchema = new Schema<any>(
  {
    id: indexedString({ required: true, unique: true }),
    complaintId: indexedString({ required: true }),
    status: indexedString(),
    note: { type: String, default: null },
    actorId: { type: String, default: null },
  },
  { collection: "complaint_timelines", strict: false, minimize: false, versionKey: false },
);
complaintTimelineSchema.index({ complaintId: 1, createdAt: 1 });

// ---------------------------------------------------------------------------
// Departments
// ---------------------------------------------------------------------------
export const departmentSchema = new Schema<any>(
  {
    id: indexedString({ required: true, unique: true }),
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, index: true },
    description: { type: String, default: null },
    managerId: indexedString(),
    members: { type: [Schema.Types.Mixed], default: [] },
  },
  { collection: "departments", strict: false, minimize: false, versionKey: false },
);

// ---------------------------------------------------------------------------
// Assets
// ---------------------------------------------------------------------------
export const assetSchema = new Schema<any>(
  {
    id: indexedString({ required: true, unique: true }),
    name: { type: String, required: true, index: true },
    category: { type: String, enum: Object.values(AssetCategory), index: true },
    status: { type: String, enum: Object.values(AssetStatus), index: true },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    address: { type: String, default: null },
    imageUrl: { type: String, default: null },
    location: { type: [Number], default: undefined },
    department: indexedString(),
    lastInspectionAt: { type: String, default: null },
    nextInspectionAt: { type: String, default: null },
    maintainedBy: { type: String, default: null },
    lastStatusNote: { type: String, default: null },
    createdBy: { type: String, default: null },
    updatedBy: { type: String, default: null },
  },
  { collection: "assets", strict: false, minimize: false, versionKey: false },
);
assetSchema.index({ status: 1 });
assetSchema.index({ department: 1 });
assetSchema.index({ location: "2dsphere" });

export const assetInspectionSchema = new Schema<any>(
  {
    id: indexedString({ required: true, unique: true }),
    assetId: indexedString({ required: true }),
    inspectorId: { type: String, default: null },
    status: { type: String },
    findings: { type: String },
    inspectedBy: { type: String },
  },
  { collection: "asset_inspections", strict: false, minimize: false, versionKey: false },
);

// ---------------------------------------------------------------------------
// Emergencies
// ---------------------------------------------------------------------------
export const emergencySchema = new Schema<any>(
  {
    id: indexedString({ required: true, unique: true }),
    ref: indexedString(),
    type: { type: String, enum: Object.values(EmergencyType), index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    severity: { type: String, enum: Object.values(ComplaintPriority), index: true },
    status: { type: String, enum: Object.values(EmergencyStatus), index: true },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    address: { type: String, default: null },
    location: { type: [Number], default: undefined },
    reportedById: indexedString(),
    reportedByName: { type: String, default: null },
    dispatchedUnit: { type: String, default: null },
    resolvedAt: { type: String, default: null },
    timeline: { type: [String], default: [] },
  },
  { collection: "emergencies", strict: false, minimize: false, versionKey: false },
);
emergencySchema.index({ status: 1 });
emergencySchema.index({ type: 1, status: 1 });
emergencySchema.index({ location: "2dsphere" });

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------
export const notificationSchema = new Schema<any>(
  {
    id: indexedString({ required: true, unique: true }),
    type: { type: String, default: "IN_APP" },
    userId: indexedString(),
    title: { type: String, required: true },
    message: { type: String, required: true },
    channel: { type: String, default: "in_app" },
    isRead: { type: Boolean, default: false, index: true },
    payload: { type: Schema.Types.Mixed, default: null },
  },
  { collection: "notifications", strict: false, minimize: false, versionKey: false },
);
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export const notificationPreferenceSchema = new Schema<any>(
  {
    id: indexedString({ required: true, unique: true }),
    userId: { type: String, required: true, unique: true, index: true },
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    categories: { type: [String], default: [] },
  },
  { collection: "notification_preferences", strict: false, minimize: false, versionKey: false },
);

// ---------------------------------------------------------------------------
// GIS markers
// ---------------------------------------------------------------------------
export const gisMarkerSchema = new Schema<any>(
  {
    id: indexedString({ required: true, unique: true }),
    type: indexedString(),
    title: { type: String },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    status: { type: String, default: null },
    severity: { type: String, default: null },
    address: { type: String, default: null },
    sourceId: { type: String, default: null },
  },
  { collection: "gis_markers", strict: false, minimize: false, versionKey: false },
);

export const gisLayerSchema = new Schema<any>(
  {
    id: indexedString({ required: true, unique: true }),
    name: { type: String },
    visible: { type: Boolean, default: true },
    color: { type: String, default: "#3b82f6" },
    description: { type: String, default: null },
  },
  { collection: "gis_layers", strict: false, minimize: false, versionKey: false },
);

// ---------------------------------------------------------------------------
// Payments / appointments / news / settings / audit
// ---------------------------------------------------------------------------
export const billSchema = new Schema<any>(
  {
    id: indexedString({ required: true, unique: true }),
    userId: indexedString(),
    billType: { type: String },
    amount: { type: Number, default: 0 },
    currency: { type: String, default: "USD" },
    status: { type: String, index: true },
    description: { type: String, default: null },
    dueDate: { type: String, default: null },
  },
  { collection: "bills", strict: false, minimize: false, versionKey: false },
);

export const transactionSchema = new Schema<any>(
  {
    id: indexedString({ required: true, unique: true }),
    billId: indexedString(),
    userId: indexedString(),
    ref: indexedString(),
    amount: { type: Number, default: 0 },
    currency: { type: String, default: "USD" },
    status: { type: String, default: "COMPLETED" },
    method: { type: String, default: null },
  },
  { collection: "transactions", strict: false, minimize: false, versionKey: false },
);

export const appointmentSchema = new Schema<any>(
  {
    id: indexedString({ required: true, unique: true }),
    userId: indexedString(),
    citizenId: indexedString(),
    departmentId: indexedString(),
    service: { type: String, default: null },
    date: { type: String, default: null },
    time: { type: String, default: null },
    status: { type: String, default: "PENDING", index: true },
    notes: { type: String, default: null },
  },
  { collection: "appointments", strict: false, minimize: false, versionKey: false },
);

export const newsSchema = new Schema<any>(
  {
    id: indexedString({ required: true, unique: true }),
    title: { type: String },
    content: { type: String },
    category: { type: String, default: "general" },
    status: { type: String, default: "PUBLISHED", index: true },
    publishedAt: { type: String, default: null },
    imageUrl: { type: String, default: null },
    authorId: indexedString(),
  },
  { collection: "news_articles", strict: false, minimize: false, versionKey: false },
);

export const auditLogSchema = new Schema<any>(
  {
    id: indexedString({ required: true, unique: true }),
    actorId: indexedString(),
    action: indexedString(),
    entity: { type: String, default: null },
    entityId: { type: String, default: null },
    meta: { type: Schema.Types.Mixed, default: null },
    ip: { type: String, default: null },
  },
  { collection: "audit_logs", strict: false, minimize: false, versionKey: false },
);
auditLogSchema.index({ createdAt: -1 });

export const settingsSchema = new Schema<any>(
  {
    id: indexedString({ required: true, unique: true }),
    key: { type: String, required: true, unique: true, index: true },
    value: { type: Schema.Types.Mixed, default: null },
    updatedBy: { type: String, default: null },
  },
  { collection: "system_settings", strict: false, minimize: false, versionKey: false },
);

// ---------------------------------------------------------------------------
// Configurable SLA rules (department / category / priority → hours)
// ---------------------------------------------------------------------------
export const slaRuleSchema = new Schema<any>(
  {
    id: indexedString({ required: true, unique: true }),
    name: { type: String, required: true },
    priority: { type: String, required: true, index: true },
    category: { type: String, default: null, index: true },
    departmentId: { type: String, default: null, index: true },
    hours: { type: Number, required: true },
    active: { type: Boolean, default: true },
  },
  { collection: "sla_rules", strict: false, minimize: false, versionKey: false },
);
slaRuleSchema.index({ departmentId: 1, category: 1, priority: 1 });

// ---------------------------------------------------------------------------
// Complaint category catalog (seeded reference data)
// ---------------------------------------------------------------------------
export const complaintCategorySchema = new Schema<any>(
  {
    id: indexedString({ required: true, unique: true }),
    name: { type: String, required: true, unique: true, index: true },
    code: { type: String, index: true },
    description: { type: String, default: null },
    departmentId: { type: String, default: null, index: true },
    suggestedPriority: { type: String, default: "MEDIUM" },
    active: { type: Boolean, default: true },
  },
  { collection: "complaint_categories", strict: false, minimize: false, versionKey: false },
);

// ---------------------------------------------------------------------------
// Citizen feedback / ratings on resolved complaints
// ---------------------------------------------------------------------------
export const feedbackSchema = new Schema<any>(
  {
    id: indexedString({ required: true, unique: true }),
    complaintId: { type: String, required: true, index: true },
    citizenId: { type: String, required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: null },
    createdAt: { type: String, required: true },
  },
  { collection: "feedback", strict: false, minimize: false, versionKey: false },
);
feedbackSchema.index({ complaintId: 1 }, { unique: true });

// ---------------------------------------------------------------------------
// Public announcements
// ---------------------------------------------------------------------------
export const announcementSchema = new Schema<any>(
  {
    id: indexedString({ required: true, unique: true }),
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, default: "general", index: true },
    status: { type: String, default: "PUBLISHED", index: true },
    publishedAt: { type: String, default: null },
    imageUrl: { type: String, default: null },
    authorId: { type: String, default: null },
  },
  { collection: "announcements", strict: false, minimize: false, versionKey: false },
);

// ---------------------------------------------------------------------------
// Traffic zones (GIS reference data)
// ---------------------------------------------------------------------------
export const trafficZoneSchema = new Schema<any>(
  {
    id: indexedString({ required: true, unique: true }),
    name: { type: String, required: true },
    congestion: { type: String, default: "LOW", index: true },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    bounds: { type: [Number], default: [] },
    updatedAt: { type: String, default: null },
  },
  { collection: "traffic_zones", strict: false, minimize: false, versionKey: false },
);
trafficZoneSchema.index({ latitude: 1, longitude: 1 });

// ---------------------------------------------------------------------------
// Service catalog + citizen service requests
// ---------------------------------------------------------------------------
export const serviceSchema = new Schema<any>(
  {
    id: indexedString({ required: true, unique: true }),
    name: { type: String, required: true, index: true },
    code: { type: String, index: true },
    description: { type: String, default: null },
    departmentId: { type: String, default: null, index: true },
    category: { type: String, default: "GENERAL", index: true },
    fee: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { collection: "services", strict: false, minimize: false, versionKey: false },
);

export const serviceRequestSchema = new Schema<any>(
  {
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
  },
  { collection: "service_requests", strict: false, minimize: false, versionKey: false },
);
serviceRequestSchema.index({ citizenId: 1, status: 1 });
serviceRequestSchema.index({ departmentId: 1, status: 1 });

/**
 * Register every schema under its collection name so the repository layer
 * (`modelFor`) picks them up instead of the lenient fallback.
 */
export function registerModels(): void {
  keep("users", userSchema);
  keep("auth_sessions", sessionSchema);
  keep("password_resets", passwordResetSchema);
  keep("complaints", complaintSchema);
  keep("complaint_comments", complaintCommentSchema);
  keep("complaint_timelines", complaintTimelineSchema);
  keep("departments", departmentSchema);
  keep("assets", assetSchema);
  keep("asset_inspections", assetInspectionSchema);
  keep("emergencies", emergencySchema);
  keep("notifications", notificationSchema);
  keep("notification_preferences", notificationPreferenceSchema);
  keep("gis_markers", gisMarkerSchema);
  keep("gis_layers", gisLayerSchema);
  keep("bills", billSchema);
  keep("transactions", transactionSchema);
  keep("appointments", appointmentSchema);
  keep("news_articles", newsSchema);
  keep("audit_logs", auditLogSchema);
  keep("system_settings", settingsSchema);
  keep("sla_rules", slaRuleSchema);
  keep("complaint_categories", complaintCategorySchema);
  keep("feedback", feedbackSchema);
  keep("announcements", announcementSchema);
  keep("traffic_zones", trafficZoneSchema);
  keep("services", serviceSchema);
  keep("service_requests", serviceRequestSchema);
}

export default registerModels;