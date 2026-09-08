import { collection, modelFor } from "../database/repository";
import { mongoState } from "../database/mongo";
import { seedUsers } from "../../modules/auth/repository";
import { seedDepartments } from "../../modules/departments/repository";
import { seedRoles } from "../../modules/roles/repository";
import { seedSettings as seedSystemSettings, seedMetrics, systemRepository } from "../../modules/system/repository";
import { seedLayers, gisRepository } from "../../modules/gis/repository";
import { newsRepository } from "../../modules/news/repository";
import { complaintRepository } from "../../modules/complaints/repository";
import { seedSlaRules, seedComplaintCategories, seedServices, seedTrafficZones, seedAnnouncements } from "./reference";
import { logger } from "../logger";

/**
 * First-boot bootstrap for a fresh MongoDB database.
 *
 * Provisions *reference/config* data only - the admin account, departments,
 * roles, GIS layers, system settings, configurable SLA rules, the complaint
 * category catalog, the service catalog, traffic zones and announcements.
 * Operational records (complaints, assets, emergencies, service requests,
 * feedback) are seeded separately via `npm run db:seed` so every operational
 * API response reflects real persisted records.
 *
 * The routine is idempotent - it only inserts when a collection is empty.
 */
async function insertIfEmpty<T>(collectionName: string, docs: T[], idOf: (d: T) => string): Promise<void> {
  if (mongoState() !== "connected") return;
  const Model = modelFor(collectionName);
  const existing = await Model.countDocuments();
  if (existing > 0) return;
  await Model.insertMany(docs.map((d) => ({ ...d, id: idOf(d) })));
  logger.info(`[bootstrap] provisioned ${docs.length} documents into '${collectionName}'`);
}

/**
 * MongoDB-free fallback: when the database is unreachable the platform still
 * boots fully by seeding the shared in-memory repositories with the same
 * demo/reference records normally written to MongoDB. This keeps login,
 * complaints, GIS, IoT, news and department dashboards alive with ZERO
 * external services - critical for offline/lab demos.
 */
function seedInMemoryData(): void {
  const seeded: string[] = [];
  const mark = (name: string): void => {
    seeded.push(name);
  };

  collection("users").seed(seedUsers);
  mark("users");
  collection("departments").seed(seedDepartments);
  mark("departments");
  collection("roles").seed(seedRoles);
  mark("roles");

  systemRepository.reset();
  mark("system_settings");

  gisRepository.reset();
  mark("gis_layers");

  newsRepository.reset();
  mark("news_articles");

  complaintRepository.reset();
  mark("complaints");

  collection("sla_rules").seed(seedSlaRules);
  mark("sla_rules");
  collection("complaint_categories").seed(seedComplaintCategories);
  mark("complaint_categories");
  collection("services").seed(seedServices);
  mark("services");
  collection("traffic_zones").seed(seedTrafficZones);
  mark("traffic_zones");
  collection("announcements").seed(seedAnnouncements);
  mark("announcements");

  logger.info(`[bootstrap] MongoDB unavailable — seeded in-memory demo data: ${seeded.join(", ")}`);
}

export async function bootstrapDatabase(): Promise<void> {
  if (mongoState() !== "connected") {
    seedInMemoryData();
    return;
  }
  await insertIfEmpty("users", seedUsers, (u) => u.id);
  await insertIfEmpty("departments", seedDepartments, (d) => d.id);
  await insertIfEmpty("roles", seedRoles, (r) => r.role);
  await insertIfEmpty("system_settings", seedSystemSettings, (s) => s.id);
  await insertIfEmpty("system_metrics", seedMetrics, (m) => m.id);
  await insertIfEmpty("gis_layers", seedLayers, (l) => l.id);
  await insertIfEmpty("sla_rules", seedSlaRules, (s) => s.id);
  await insertIfEmpty("complaint_categories", seedComplaintCategories, (c) => c.id);
  await insertIfEmpty("services", seedServices, (s) => s.id);
  await insertIfEmpty("traffic_zones", seedTrafficZones, (z) => z.id);
  await insertIfEmpty("announcements", seedAnnouncements, (a) => a.id);
}

export default bootstrapDatabase;
