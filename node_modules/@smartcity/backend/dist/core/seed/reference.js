"use strict";
/**
 * Reference / configuration seed data shared by the boot bootstrap and the
 * `scripts/seed-db.ts` operational seeder. These are real persisted records -
 * sourced from MongoDB at runtime - NOT frontend mock data.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedAnnouncements = exports.seedTrafficZones = exports.seedServices = exports.seedComplaintCategories = exports.seedSlaRules = void 0;
exports.seedSlaRules = [
    { id: "sla_low", name: "Low priority", priority: "LOW", category: null, departmentId: null, hours: 72, active: true },
    { id: "sla_medium", name: "Medium priority", priority: "MEDIUM", category: null, departmentId: null, hours: 48, active: true },
    { id: "sla_high", name: "High priority", priority: "HIGH", category: null, departmentId: null, hours: 24, active: true },
    { id: "sla_critical", name: "Critical priority", priority: "CRITICAL", category: null, departmentId: null, hours: 4, active: true },
    { id: "sla_pw_road", name: "Public Works road repairs", priority: "HIGH", category: "ROAD", departmentId: "dept-public-works", hours: 18, active: true },
    { id: "sla_ws_water", name: "Water authority leaks", priority: "CRITICAL", category: "WATER", departmentId: "dept-water-sanitation", hours: 3, active: true },
    { id: "sla_el_streetlight", name: "Street light outages", priority: "MEDIUM", category: "STREET_LIGHT", departmentId: "dept-electricity", hours: 36, active: true },
    { id: "sla_emg_fire", name: "Fire hazards", priority: "CRITICAL", category: "EMERGENCY", departmentId: "dept-emergency", hours: 2, active: true },
];
exports.seedComplaintCategories = [
    { id: "cat_road", name: "ROAD", code: "ROAD", description: "Road, potholes, footpaths and signage defects", departmentId: "dept-public-works", suggestedPriority: "MEDIUM", active: true },
    { id: "cat_street_light", name: "STREET_LIGHT", code: "STREET_LIGHT", description: "Street lighting outages and faults", departmentId: "dept-electricity", suggestedPriority: "MEDIUM", active: true },
    { id: "cat_water", name: "WATER", code: "WATER", description: "Water supply, leaks, drainage and sewerage", departmentId: "dept-water-sanitation", suggestedPriority: "HIGH", active: true },
    { id: "cat_electricity", name: "ELECTRICITY", code: "ELECTRICITY", description: "Power cuts, transformer and grid faults", departmentId: "dept-electricity", suggestedPriority: "HIGH", active: true },
    { id: "cat_garbage", name: "GARBAGE", code: "GARBAGE", description: "Waste collection, dumping and sanitation", departmentId: "dept-municipal", suggestedPriority: "LOW", active: true },
    { id: "cat_park", name: "PARK", code: "PARK", description: "Parks, playgrounds and public gardens", departmentId: "dept-municipal", suggestedPriority: "LOW", active: true },
    { id: "cat_health", name: "HEALTH", code: "HEALTH", description: "Public health and healthcare facilities", departmentId: "dept-health", suggestedPriority: "HIGH", active: true },
    { id: "cat_education", name: "EDUCATION", code: "EDUCATION", description: "Schools and education infrastructure", departmentId: "dept-education", suggestedPriority: "MEDIUM", active: true },
    { id: "cat_transport", name: "TRANSPORT", code: "TRANSPORT", description: "Public transport, traffic signals and zones", departmentId: "dept-transport", suggestedPriority: "MEDIUM", active: true },
    { id: "cat_emergency", name: "EMERGENCY", code: "EMERGENCY", description: "Fire, safety and civil protection hazards", departmentId: "dept-emergency", suggestedPriority: "CRITICAL", active: true },
    { id: "cat_building", name: "BUILDING", code: "BUILDING", description: "Buildings, structures and illegal construction", departmentId: "dept-municipal", suggestedPriority: "MEDIUM", active: true },
    { id: "cat_noise", name: "NOISE", code: "NOISE", description: "Noise and nuisance complaints", departmentId: "dept-municipal", suggestedPriority: "LOW", active: true },
    { id: "cat_other", name: "OTHER", code: "OTHER", description: "Anything else", departmentId: null, suggestedPriority: "MEDIUM", active: true },
];
exports.seedServices = [
    { id: "svc_garbage", name: "Garbage Collection", code: "GARB", description: "Schedule a waste collection", departmentId: "dept-municipal", category: "SANITATION", fee: 0, active: true },
    { id: "svc_water_conn", name: "New Water Connection", code: "WTR-C", description: "Apply for a new water connection", departmentId: "dept-water-sanitation", category: "WATER", fee: 25, active: true },
    { id: "svc_elec_conn", name: "New Electricity Connection", code: "ELC-C", description: "Apply for a new power connection", departmentId: "dept-electricity", category: "ELECTRICITY", fee: 30, active: true },
    { id: "svc_road_repair", name: "Road Repair Request", code: "RD-R", description: "Request a road repair", departmentId: "dept-public-works", category: "ROAD", fee: 0, active: true },
    { id: "svc_streetlight", name: "Street Light Repair", code: "SL-R", description: "Report a faulty street light", departmentId: "dept-electricity", category: "STREET_LIGHT", fee: 0, active: true },
    { id: "svc_building_permit", name: "Building Permit", code: "BLD-P", description: "Apply for a construction permit", departmentId: "dept-municipal", category: "BUILDING", fee: 120, active: true },
    { id: "svc_birth_cert", name: "Birth Certificate", code: "BIRTH", description: "Register a birth / obtain certificate", departmentId: "dept-health", category: "HEALTH", fee: 10, active: true },
    { id: "svc_school_adm", name: "School Admission", code: "SCH-A", description: "School admission application", departmentId: "dept-education", category: "EDUCATION", fee: 0, active: true },
    { id: "svc_bus_ticket", name: "Public Transport Card", code: "BUS-T", description: "Apply for a transit card", departmentId: "dept-transport", category: "TRANSPORT", fee: 15, active: true },
    { id: "svc_fire_inspect", name: "Fire Safety Inspection", code: "FIRE-I", description: "Schedule a fire safety inspection", departmentId: "dept-emergency", category: "EMERGENCY", fee: 0, active: true },
];
exports.seedTrafficZones = [
    { id: "tz_1", name: "Market Street", congestion: "HIGH", latitude: 31.52, longitude: 74.358, bounds: [74.355, 31.517, 74.361, 31.523] },
    { id: "tz_2", name: "Ring Road", congestion: "MEDIUM", latitude: 31.549, longitude: 74.35, bounds: [74.347, 31.546, 74.353, 31.552] },
    { id: "tz_3", name: "University Blvd", congestion: "LOW", latitude: 31.48, longitude: 74.3, bounds: [74.297, 31.477, 74.303, 31.483] },
    { id: "tz_4", name: "Old City Bazaar", congestion: "CRITICAL", latitude: 31.578, longitude: 74.323, bounds: [74.32, 31.575, 74.326, 31.581] },
];
exports.seedAnnouncements = [
    { id: "ann_1", title: "City water supply scheduled maintenance", content: "Water supply will be paused on Sunday 02:00-06:00 for pipeline flushing.", category: "WATER", status: "PUBLISHED", publishedAt: null },
    { id: "ann_2", title: "New digital complaint centre launched", content: "Citizens can now track complaints and SLA deadlines online.", category: "SYSTEM", status: "PUBLISHED", publishedAt: null },
    { id: "ann_3", title: "Road closure: Ring Road night works", content: "Ring Road will be partially closed 22:00-05:00 this week for resurfacing.", category: "TRANSPORT", status: "PUBLISHED", publishedAt: null },
];
//# sourceMappingURL=reference.js.map