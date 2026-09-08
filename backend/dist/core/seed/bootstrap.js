"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrapDatabase = bootstrapDatabase;
const repository_1 = require("../database/repository");
const mongo_1 = require("../database/mongo");
const repository_2 = require("../../modules/auth/repository");
const repository_3 = require("../../modules/departments/repository");
const repository_4 = require("../../modules/roles/repository");
const repository_5 = require("../../modules/system/repository");
const repository_6 = require("../../modules/gis/repository");
const repository_7 = require("../../modules/news/repository");
const repository_8 = require("../../modules/complaints/repository");
const reference_1 = require("./reference");
const logger_1 = require("../logger");
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
async function insertIfEmpty(collectionName, docs, idOf) {
    if ((0, mongo_1.mongoState)() !== "connected")
        return;
    const Model = (0, repository_1.modelFor)(collectionName);
    const existing = await Model.countDocuments();
    if (existing > 0)
        return;
    await Model.insertMany(docs.map((d) => ({ ...d, id: idOf(d) })));
    logger_1.logger.info(`[bootstrap] provisioned ${docs.length} documents into '${collectionName}'`);
}
/**
 * MongoDB-free fallback: when the database is unreachable the platform still
 * boots fully by seeding the shared in-memory repositories with the same
 * demo/reference records normally written to MongoDB. This keeps login,
 * complaints, GIS, IoT, news and department dashboards alive with ZERO
 * external services - critical for offline/lab demos.
 */
function seedInMemoryData() {
    const seeded = [];
    const mark = (name) => {
        seeded.push(name);
    };
    (0, repository_1.collection)("users").seed(repository_2.seedUsers);
    mark("users");
    (0, repository_1.collection)("departments").seed(repository_3.seedDepartments);
    mark("departments");
    (0, repository_1.collection)("roles").seed(repository_4.seedRoles);
    mark("roles");
    repository_5.systemRepository.reset();
    mark("system_settings");
    repository_6.gisRepository.reset();
    mark("gis_layers");
    repository_7.newsRepository.reset();
    mark("news_articles");
    repository_8.complaintRepository.reset();
    mark("complaints");
    (0, repository_1.collection)("sla_rules").seed(reference_1.seedSlaRules);
    mark("sla_rules");
    (0, repository_1.collection)("complaint_categories").seed(reference_1.seedComplaintCategories);
    mark("complaint_categories");
    (0, repository_1.collection)("services").seed(reference_1.seedServices);
    mark("services");
    (0, repository_1.collection)("traffic_zones").seed(reference_1.seedTrafficZones);
    mark("traffic_zones");
    (0, repository_1.collection)("announcements").seed(reference_1.seedAnnouncements);
    mark("announcements");
    logger_1.logger.info(`[bootstrap] MongoDB unavailable — seeded in-memory demo data: ${seeded.join(", ")}`);
}
async function bootstrapDatabase() {
    if ((0, mongo_1.mongoState)() !== "connected") {
        seedInMemoryData();
        return;
    }
    await insertIfEmpty("users", repository_2.seedUsers, (u) => u.id);
    await insertIfEmpty("departments", repository_3.seedDepartments, (d) => d.id);
    await insertIfEmpty("roles", repository_4.seedRoles, (r) => r.role);
    await insertIfEmpty("system_settings", repository_5.seedSettings, (s) => s.id);
    await insertIfEmpty("system_metrics", repository_5.seedMetrics, (m) => m.id);
    await insertIfEmpty("gis_layers", repository_6.seedLayers, (l) => l.id);
    await insertIfEmpty("sla_rules", reference_1.seedSlaRules, (s) => s.id);
    await insertIfEmpty("complaint_categories", reference_1.seedComplaintCategories, (c) => c.id);
    await insertIfEmpty("services", reference_1.seedServices, (s) => s.id);
    await insertIfEmpty("traffic_zones", reference_1.seedTrafficZones, (z) => z.id);
    await insertIfEmpty("announcements", reference_1.seedAnnouncements, (a) => a.id);
}
exports.default = bootstrapDatabase;
//# sourceMappingURL=bootstrap.js.map