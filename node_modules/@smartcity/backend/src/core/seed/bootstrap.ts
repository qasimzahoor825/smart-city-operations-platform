import { modelFor } from "../database/repository";
import { mongoState } from "../database/mongo";
import { seedUsers } from "../../modules/auth/repository";
import { seedDepartments } from "../../modules/departments/repository";
import { seedRoles } from "../../modules/roles/repository";
import { seedSettings as seedSystemSettings, seedMetrics } from "../../modules/system/repository";
import { seedLayers } from "../../modules/gis/repository";
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

export async function bootstrapDatabase(): Promise<void> {
  if (mongoState() !== "connected") return;
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
