/**
 * SmartCity OS — Database Seeder (operational data)
 *
 * Seeds reference data (SLA rules, categories, services, traffic zones,
 * announcements), demo accounts and a realistic volume of OPERATIONAL records
 * (complaints, assets, emergencies, appointments, bills, service requests,
 * notifications, feedback) straight into MongoDB so every dashboard, GIS layer
 * and analytics endpoint reflects real persisted data.
 *
 * Usage (from backend/):
 *   npm run db:seed          # seed only when collections are empty (idempotent)
 *   npm run db:seed -- --reset   # drop seeded collections first, then reseed
 */
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { config } from "./config";
import { modelFor } from "./core/database/repository";
import {
  seedSlaRules,
  seedComplaintCategories,
  seedServices,
  seedTrafficZones,
  seedAnnouncements,
} from "./core/seed/reference";

export interface SeedDatabaseOptions {
  /** Drop seeded collections first, then reseed. */
  reset?: boolean;
}

const COLLECTIONS_TO_RESET = [
  "complaints",
  "complaint_comments",
  "complaint_timelines",
  "assets",
  "asset_inspections",
  "emergencies",
  "appointments",
  "bills",
  "transactions",
  "notifications",
  "service_requests",
  "feedback",
  "gis_markers",
  "users",
  "departments",
  "roles",
  "sla_rules",
  "complaint_categories",
  "services",
  "traffic_zones",
  "announcements",
  "system_settings",
  "system_metrics",
  "gis_layers",
  "audit_logs",
];

const RESET_ARG = process.argv.includes("--reset");
const now = new Date();
const hoursAgo = (h: number): string => new Date(now.getTime() - h * 3_600_000).toISOString();
const daysAgo = (d: number): string => new Date(now.getTime() - d * 86_400_000).toISOString();
const hoursFrom = (h: number): string => new Date(now.getTime() + h * 3_600_000).toISOString();

const hash = (pw: string) => bcrypt.hashSync(pw, 10);

const CITY = {
  center: { lat: 31.52, lon: 74.35 },
  spread: 0.06,
};

function jitter(seedValue: number): { lat: number; lon: number } {
  const lat = CITY.center.lat + ((seedValue * 37) % 100) / 100 * CITY.spread * 2 - CITY.spread;
  const lon = CITY.center.lon + ((seedValue * 71) % 100) / 100 * CITY.spread * 2 - CITY.spread;
  return { lat: Number(lat.toFixed(6)), lon: Number(lon.toFixed(6)) };
}

async function insertIfEmpty(collectionName: string, docs: (Record<string, unknown> | null)[]): Promise<number> {
  const rows = docs.filter((d): d is Record<string, unknown> => d !== null);
  if (rows.length === 0) return 0;
  const Model = modelFor(collectionName);
  const existing = await Model.countDocuments();
  if (existing > 0) return 0;
  await Model.insertMany(rows);
  return rows.length;
}

async function upsertAll(collectionName: string, docs: Record<string, unknown>[]): Promise<number> {
  if (docs.length === 0) return 0;
  const Model = modelFor(collectionName);
  for (const doc of docs) {
    await Model.updateOne({ id: doc.id }, { $set: doc }, { upsert: true }).exec();
  }
  return docs.length;
}

function location(lat: number, lon: number): number[] {
  return [Number(lon.toFixed(6)), Number(lat.toFixed(6))];
}

const DEPTS = [
  { id: "dept-public-works", name: "Public Works" },
  { id: "dept-water-sanitation", name: "Water & Sanitation" },
  { id: "dept-health", name: "Health Department" },
  { id: "dept-education", name: "Education Department" },
  { id: "dept-transport", name: "Transport Department" },
  { id: "dept-electricity", name: "Electricity Authority" },
  { id: "dept-municipal", name: "Municipal Services" },
  { id: "dept-emergency", name: "Emergency Services" },
];

const OFFICERS = [
  { id: "usr_seed_officer1", name: "Bilal Ahmed", dept: "dept-public-works" },
  { id: "usr_seed_officer2", name: "Mana Patel", dept: "dept-water-sanitation" },
  { id: "usr_officer_health", name: "Hassan Malik", dept: "dept-health" },
  { id: "usr_officer_transport", name: "Zainab Ali", dept: "dept-transport" },
  { id: "usr_officer_electricity", name: "Adnan Raza", dept: "dept-electricity" },
  { id: "usr_officer_municipal", name: "Imran Baig", dept: "dept-municipal" },
  { id: "usr_officer_emergency", name: "Daniyal Qureshi", dept: "dept-emergency" },
];

const CATEGORY_DEPT: Record<string, string> = {
  ROAD: "dept-public-works",
  STREET_LIGHT: "dept-electricity",
  WATER: "dept-water-sanitation",
  ELECTRICITY: "dept-electricity",
  GARBAGE: "dept-municipal",
  PARK: "dept-municipal",
  HEALTH: "dept-health",
  EDUCATION: "dept-education",
  TRANSPORT: "dept-transport",
  EMERGENCY: "dept-emergency",
  BUILDING: "dept-municipal",
  NOISE: "dept-municipal",
  OTHER: "dept-municipal",
};

const STATUSES = [
  "SUBMITTED",
  "RECEIVED",
  "ASSIGNED",
  "UNDER_REVIEW",
  "FIELD_INSPECTION",
  "IN_PROGRESS",
  "RESOLVED",
  "CITIZEN_FEEDBACK",
  "CLOSED",
  "REJECTED",
  "ESCALATED",
  "CANCELLED",
];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

const COMPLAINT_TITLES: Record<string, string[]> = {
  ROAD: ["Pothole near school crossing", "Road surface damaged on Market road", "Broken footpath tile", "Missing manhole cover", "Faded lane markings"],
  STREET_LIGHT: ["Streetlight flickering on Main St", "Lamp post off for a week", "Streetlight damaged by vehicle"],
  WATER: ["Water leak flooding sidewalk", "Low water pressure in block C", "Drainage blocked on 4th street", "Sewer line overflowing"],
  ELECTRICITY: ["Power cut in Gulberg area", "Transformer humming loudly", "Frequent voltage surges"],
  GARBAGE: ["Missed garbage collection", "Illegal dumping at park corner", "Overflowing bins at market"],
  PARK: ["Broken park bench", "Playground swing damaged", "Overgrown grass in community park"],
  HEALTH: ["Stray dogs near clinic", "Unhygienic conditions at food market", "Rat infestation in housing colony"],
  EDUCATION: ["School roof leaking", "Broken school fence", "No drinking water in school"],
  TRANSPORT: ["Bus delay on route 42", "Traffic signal stuck red", "Damaged bus shelter"],
  EMERGENCY: ["Dangerous electrical wire hanging", "Gas leak near shops", "Fire hazard in market"],
  BUILDING: ["Illegal construction on green belt", "Cracked building facade"],
  NOISE: ["Loud construction after hours", "Persistent night noise from club"],
  OTHER: ["General public complaint", "Request for civic information"],
};

function buildComplaints(count: number): (Record<string, unknown> | null)[] {
  const out: (Record<string, unknown> | null)[] = [];
  const categories = Object.keys(CATEGORY_DEPT);
  const citizenIds = ["usr_seed_citizen1", "usr_seed_citizen2", "usr_cit_a", "usr_cit_b", "usr_cit_c", "usr_cit_d", "usr_cit_e"];
  const citizenNames = ["Sarah Jenkins", "James Carter", "Ali Hassan", "Mariam Noor", "Bilqees Fatima", "Usman Sheikh", "Hina Akhtar"];

  for (let i = 0; i < count; i += 1) {
    const category = categories[i % categories.length];
    const titles = COMPLAINT_TITLES[category] ?? COMPLAINT_TITLES.OTHER;
    const title = titles[i % titles.length];
    const priority = PRIORITIES[i % PRIORITIES.length];
    const status = STATUSES[i % STATUSES.length];
    const { lat, lon } = jitter(i * 13 + 3);
    const deptId = CATEGORY_DEPT[category] ?? null;
    const dept = DEPTS.find((d) => d.id === deptId);
    const citizenIdx = i % citizenIds.length;
    const created = hoursAgo(((count - i) % 240) * 7 + 5);
    const SLA_HOURS: Record<string, number> = { LOW: 72, MEDIUM: 48, HIGH: 24, CRITICAL: 4 };
    const slaHours = SLA_HOURS[priority];
    const resolved = ["RESOLVED", "CITIZEN_FEEDBACK", "CLOSED"].includes(status);
    const breached = (status === "ESCALATED") || (i % 13 === 0);
    const officer = i % 7 < OFFICERS.length ? OFFICERS[i % OFFICERS.length] : undefined;
    const resolvedAt = resolved ? new Date(new Date(created).getTime() + slaHours * 0.6 * 3_600_000).toISOString() : null;
    const deadlineDate = resolved ? hoursAgo(1) : breached ? hoursAgo(2) : hoursFrom(slaHours / 2);

    out.push({
      id: `cmp_seed_${i + 1}`,
      ref: `CMP-${(1000 + i).toString(36).toUpperCase()}-${i}`,
      title,
      description: `${title} reported by a citizen. ${i % 3 === 0 ? "Repeated reports in the area." : "Please review and take action within the SLA."}`,
      category,
      status,
      priority,
      latitude: lat,
      longitude: lon,
      location: location(lat, lon),
      address: `${["Main St", "Market road", "Garden Avenue", "University Blvd", "Ring Road"][i % 5]}, District ${["A", "B", "C"][i % 3]}`,
      imageUrls: [],
      slaHours,
      slaDeadline: deadlineDate,
      slaBreached: breached,
      resolvedAt,
      citizenId: citizenIds[citizenIdx],
      citizenName: citizenNames[citizenIdx],
      assignedToId: officer?.id ?? null,
      assignedToName: officer?.name ?? null,
      departmentId: deptId,
      departmentName: dept?.name ?? null,
      ai: null,
      createdAt: created,
      updatedAt: hoursAgo(((count - i) % 24) + 1),
    });
  }
  return out;
}

function buildAssets(count: number): Record<string, unknown>[] {
  const defs = [
    { name: "Road", category: "ROAD", dept: "dept-public-works" },
    { name: "Street Light", category: "STREET_LIGHT", dept: "dept-electricity" },
    { name: "Water Pump", category: "WATER", dept: "dept-water-sanitation" },
    { name: "Transformer", category: "ELECTRICITY", dept: "dept-electricity" },
    { name: "Community Park", category: "PARK", dept: "dept-municipal" },
    { name: "School Building", category: "BUILDING", dept: "dept-education" },
    { name: "BMT Bus", category: "PUBLIC_TRANSPORT", dept: "dept-transport" },
    { name: "Drainage Line", category: "SANITATION", dept: "dept-water-sanitation" },
    { name: "Hospital Wing", category: "BUILDING", dept: "dept-health" },
    { name: "Fire Truck", category: "OTHER", dept: "dept-emergency" },
  ];
  const statuses = ["OPERATIONAL", "UNDER_MAINTENANCE", "OUT_OF_SERVICE", "ACTIVE", "MAINTENANCE", "DAMAGED", "RETIRED"];
  const out: Record<string, unknown>[] = [];
  for (let i = 0; i < count; i += 1) {
    const def = defs[i % defs.length];
    const { lat, lon } = jitter(i * 7 + 11);
    const created = daysAgo(400 + i);
    out.push({
      id: `ast_seed_${i + 1}`,
      name: `${def.name} ${["North", "South", "East", "West", "Central"][i % 5]}`,
      category: def.category,
      status: statuses[i % statuses.length],
      latitude: lat,
      longitude: lon,
      location: location(lat, lon),
      address: `Sector ${["A", "B", "C", "D"][i % 4]}, ${["Main", "Ring", "Service"][i % 3]} road`,
      imageUrl: null,
      department: def.dept,
      lastInspectionAt: daysAgo((i % 60) + 5),
      nextInspectionAt: hoursFrom((i % 60) * 24 + 72),
      maintainedBy: OFFICERS[i % OFFICERS.length]?.name ?? null,
      lastStatusNote: statuses[i % statuses.length] === "UNDER_MAINTENANCE" ? "Scheduled maintenance" : null,
      createdBy: "usr_seed_admin",
      updatedBy: "usr_seed_admin",
      createdAt: created,
      updatedAt: daysAgo(i % 20),
    });
  }
  return out;
}

function buildEmergencies(count: number): Record<string, unknown>[] {
  const types = [
    { type: "FIRE", title: "Apartment fire", dept: "dept-emergency", unit: "Fire Unit 1" },
    { type: "MEDICAL", title: "Cardiac emergency", dept: "dept-health", unit: "Ambulance 7" },
    { type: "FLOOD", title: "Flash flood in low-lying area", dept: "dept-water-sanitation", unit: "Rescue Boat 2" },
    { type: "ACCIDENT", title: "Road accident on ring road", dept: "dept-emergency", unit: "Traffic Patrol 4" },
    { type: "PUBLIC_ALERT", title: "Gas leak reported", dept: "dept-emergency", unit: "Hazmat Team" },
  ];
  const statuses = ["REPORTED", "ACKNOWLEDGED", "DISPATCHED", "ON_SCENE", "RESOLVED", "CLOSED"];
  const severities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
  const out: Record<string, unknown>[] = [];
  for (let i = 0; i < count; i += 1) {
    const def = types[i % types.length];
    const { lat, lon } = jitter(i * 19 + 5);
    const status = statuses[i % statuses.length];
    const created = hoursAgo((count - i) * 9 + 2);
    out.push({
      id: `emg_seed_${i + 1}`,
      ref: `EMG-${(500 + i).toString(36).toUpperCase()}`,
      type: def.type,
      title: def.title,
      description: `${def.title} reported at ${hoursAgo((count - i) * 9 + 2)}.`,
      severity: severities[i % severities.length],
      status,
      latitude: lat,
      longitude: lon,
      location: location(lat, lon),
      address: `Sector ${["A", "B", "C"][i % 3]}, ${["Main", "Ring", "Service"][i % 3]} road`,
      reportedById: ["usr_seed_citizen1", "usr_seed_citizen2", "usr_cit_a"][i % 3],
      reportedByName: "Citizen Report",
      dispatchedUnit: status === "REPORTED" || status === "ACKNOWLEDGED" ? null : def.unit,
      resolvedAt: ["RESOLVED", "CLOSED"].includes(status) ? hoursAgo((count - i) * 2) : null,
      timeline: [`Reported by screening centre`, `Dispatched ${def.unit ?? ""}`.trim()],
      createdAt: created,
      updatedAt: hoursAgo((count - i) * 6),
    });
  }
  return out;
}

function buildAppointments(count: number): Record<string, unknown>[] {
  const services = ["Road Repair Inspection", "Building Permit Review", "Health Camp Visit", "Water Connection"];
  const statuses = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];
  const out: Record<string, unknown>[] = [];
  for (let i = 0; i < count; i += 1) {
    out.push({
      id: `apt_seed_${i + 1}`,
      userId: i % 2 === 0 ? "usr_seed_citizen1" : "usr_seed_citizen2",
      citizenId: i % 2 === 0 ? "usr_seed_citizen1" : "usr_seed_citizen2",
      departmentId: DEPTS[i % DEPTS.length].id,
      service: services[i % services.length],
      date: new Date(now.getTime() + ((i % 7) + 1) * 86_400_000).toISOString().slice(0, 10),
      time: `${9 + (i % 8)}:00`,
      status: statuses[i % statuses.length],
      notes: null,
      createdAt: daysAgo((i % 10) + 1),
    });
  }
  return out;
}

function buildBills(count: number): Record<string, unknown>[] {
  const types = ["WATER", "ELECTRICITY", "TAX", "SERVICE_FEE"];
  const statuses = ["PENDING", "PAID", "OVERDUE"];
  const out: Record<string, unknown>[] = [];
  for (let i = 0; i < count; i += 1) {
    out.push({
      id: `bill_seed_${i + 1}`,
      userId: i % 2 === 0 ? "usr_seed_citizen1" : "usr_seed_citizen2",
      billType: types[i % types.length],
      amount: Math.round(50 + ((i * 37) % 400) * 10) / 10,
      currency: "USD",
      status: statuses[i % statuses.length],
      description: `${types[i % types.length]} bill - January cycle`,
      dueDate: hoursFrom(((i % 20) + 2) * 24),
      createdAt: daysAgo((i % 25) + 3),
    });
  }
  return out;
}

function buildServiceRequests(count: number): Record<string, unknown>[] {
  const services = seedServices;
  const statuses = ["SUBMITTED", "IN_PROGRESS", "COMPLETED", "REJECTED"];
  const out: Record<string, unknown>[] = [];
  for (let i = 0; i < count; i += 1) {
    const svc = services[i % services.length];
    const dept = DEPTS.find((d) => d.id === svc.departmentId);
    const status = statuses[i % statuses.length];
    const { lat, lon } = jitter(i * 23 + 2);
    out.push({
      id: `srv_seed_${i + 1}`,
      ref: `SRV-${(300 + i).toString(36).toUpperCase()}`,
      serviceId: svc.id,
      serviceName: svc.name,
      citizenId: i % 2 === 0 ? "usr_seed_citizen1" : "usr_seed_citizen2",
      citizenName: i % 2 === 0 ? "Sarah Jenkins" : "James Carter",
      departmentId: dept?.id ?? null,
      departmentName: dept?.name ?? null,
      status,
      description: `${svc.name} request`,
      latitude: lat,
      longitude: lon,
      resolvedAt: status === "COMPLETED" ? hoursAgo((i % 3) + 1) : null,
      createdAt: daysAgo((i % 30) + 1),
      updatedAt: hoursAgo((i % 24) + 1),
    });
  }
  return out;
}

function buildNotifications(count: number): Record<string, unknown>[] {
  const users = ["usr_seed_citizen1", "usr_seed_citizen2", "usr_seed_officer1", "usr_head_health", "usr_head_electricity"];
  const titles = ["Complaint status update", "SLA deadline approaching", "New announcement", "Emergency alert"];
  const out: Record<string, unknown>[] = [];
  for (let i = 0; i < count; i += 1) {
    out.push({
      id: `ntf_seed_${i + 1}`,
      type: "IN_APP",
      userId: users[i % users.length],
      title: titles[i % titles.length],
      message: `Seed notification ${i + 1}: please review your pending items.`,
      channel: "in_app",
      isRead: i % 3 !== 0,
      payload: null,
      createdAt: hoursAgo((count - i) * 5),
    });
  }
  return out;
}

function buildFeedback(resolvedComplaints: (Record<string, unknown> | null)[]): Record<string, unknown>[] {
  const ratings = [5, 5, 4, 4, 3, 5, 4, 5];
  const out: Record<string, unknown>[] = [];
  resolvedComplaints
    .filter((c): c is Record<string, unknown> => c !== null && ["RESOLVED", "CITIZEN_FEEDBACK", "CLOSED"].includes(String(c.status)))
    .slice(0, 8)
    .forEach((c, i) => {
      out.push({
        id: `fb_seed_${i + 1}`,
        complaintId: String(c.id),
        citizenId: String(c.citizenId),
        rating: ratings[i % ratings.length],
        comment: ratings[i % ratings.length] >= 4 ? "Resolved quickly, great service." : "Took longer than expected.",
        createdAt: hoursAgo(((i + 1) % 3) + 1),
      });
    });
  return out;
}

async function main(): Promise<void> {
  console.log("🌱 SmartCity OS seeder starting...");
  await mongoose.connect(config.database.mongoUrl);
  await seedDatabase({ reset: RESET_ARG });
  await mongoose.disconnect();
  console.log("✅ Seeding completed successfully!");
}

export async function seedDatabase(opts: SeedDatabaseOptions = {}): Promise<void> {
  const { reset = false } = opts;

  if (reset) {
    console.log("🗑️  --reset: dropping seeded collections...");
    for (const name of COLLECTIONS_TO_RESET) {
      await modelFor(name).deleteMany({});
    }
    console.log("🗑️  Drop complete.");
  }

  // Reference data
  let n = await upsertAll("sla_rules", seedSlaRules.map((r) => ({ ...r })));
  console.log(`  sla_rules: ${n}`);
  n = await upsertAll("complaint_categories", seedComplaintCategories.map((c) => ({ ...c })));
  console.log(`  complaint_categories: ${n}`);
  n = await upsertAll("services", seedServices.map((s) => ({ ...s })));
  console.log(`  services: ${n}`);
  n = await upsertAll("traffic_zones", seedTrafficZones.map((z) => ({ ...z })));
  console.log(`  traffic_zones: ${n}`);
  n = await upsertAll("announcements", seedAnnouncements.map((a) => ({ ...a, publishedAt: a.publishedAt ?? new Date().toISOString() })));
  console.log(`  announcements: ${n}`);

  // Accounts
  const extraCitizens = [
    { id: "usr_cit_a", fullName: "Ali Hassan", email: "ali@example.com" },
    { id: "usr_cit_b", fullName: "Mariam Noor", email: "mariam@example.com" },
    { id: "usr_cit_c", fullName: "Bilqees Fatima", email: "bilqees@example.com" },
    { id: "usr_cit_d", fullName: "Usman Sheikh", email: "usman@example.com" },
    { id: "usr_cit_e", fullName: "Hina Akhtar", email: "hina@example.com" },
  ];
  n = await upsertAll(
    "users",
    extraCitizens.map((c) => ({
      id: c.id,
      fullName: c.fullName,
      email: c.email,
      passwordHash: hash("Citizen@1234"),
      role: "CITIZEN",
      isEmailVerified: true,
      isActive: true,
      createdAt: daysAgo(20),
      updatedAt: daysAgo(2),
    })),
  );
  console.log(`  extra_citizens: ${n}`);

  // Operational data
  const complaints = buildComplaints(96);
  n = await insertIfEmpty("complaints", complaints);
  console.log(`  complaints: ${n}`);

  const assets = buildAssets(40);
  n = await insertIfEmpty("assets", assets);
  console.log(`  assets: ${n}`);

  const emergencies = buildEmergencies(18);
  n = await insertIfEmpty("emergencies", emergencies);
  console.log(`  emergencies: ${n}`);

  n = await insertIfEmpty("appointments", buildAppointments(12));
  console.log(`  appointments: ${n}`);

  n = await insertIfEmpty("bills", buildBills(14));
  console.log(`  bills: ${n}`);

  n = await insertIfEmpty("service_requests", buildServiceRequests(18));
  console.log(`  service_requests: ${n}`);

  n = await insertIfEmpty("notifications", buildNotifications(24));
  console.log(`  notifications: ${n}`);

  n = await insertIfEmpty("feedback", buildFeedback(complaints as (Record<string, unknown> | null)[]));
  console.log(`  feedback: ${n}`);

  // Timeline reflections for a subset of complaints so details render history
  const timelineDocs: Record<string, unknown>[] = [];
  (complaints as Record<string, unknown>[]).slice(0, 48).forEach((c, i) => {
    timelineDocs.push({
      id: `ctl_seed_sub_${i}`,
      complaintId: String(c.id),
      status: "SUBMITTED",
      note: "Complaint submitted",
      actorId: String(c.citizenId),
      createdAt: String(c.createdAt),
    });
    if (["ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED", "CITIZEN_FEEDBACK", "ESCALATED"].includes(String(c.status))) {
      timelineDocs.push({
        id: `ctl_seed_ass_${i}`,
        complaintId: String(c.id),
        status: "ASSIGNED",
        note: "Assigned to field officer",
        actorId: String(c.assignedToId ?? null),
        createdAt: hoursAgo(((i % 20) + 6) * 7),
      });
    }
    if (String(c.status) === "RESOLVED") {
      timelineDocs.push({
        id: `ctl_seed_res_${i}`,
        complaintId: String(c.id),
        status: "RESOLVED",
        note: "Issue resolved by field team",
        actorId: String(c.assignedToId ?? null),
        createdAt: String(c.resolvedAt),
      });
    }
  });
  n = await insertIfEmpty("complaint_timelines", timelineDocs);
  console.log(`  complaint_timelines: ${n}`);
}

if (require.main === module) {
  main().catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  });
}