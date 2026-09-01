"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportRepository = void 0;
const repository_1 = require("../../../core/database/repository");
const client_1 = require("@prisma/client");
const nowMs = Date.now();
const hoursAgo = (h) => new Date(nowMs - h * 3_600_000).toISOString();
const daysAgo = (d) => new Date(nowMs - d * 86_400_000).toISOString();
const daysFrom = (d) => new Date(nowMs + d * 86_400_000).toISOString();
const seedEmergencies = [
    {
        id: "emg_seed_001",
        type: client_1.EmergencyType.PUBLIC_ALERT,
        title: "Smoke reported near industrial zone",
        status: client_1.EmergencyStatus.RESOLVED,
        departmentId: "dept-public-works",
        createdAt: daysAgo(4),
        resolvedAt: daysAgo(3),
    },
    {
        id: "emg_seed_002",
        type: client_1.EmergencyType.FLOOD,
        title: "Water leak flooding sidewalk",
        status: client_1.EmergencyStatus.DISPATCHED,
        departmentId: "dept-water-sanitation",
        createdAt: hoursAgo(2),
        resolvedAt: null,
    },
    {
        id: "emg_seed_003",
        type: client_1.EmergencyType.MEDICAL,
        title: "Medical assistance at City Market",
        status: client_1.EmergencyStatus.RESOLVED,
        departmentId: null,
        createdAt: daysAgo(7),
        resolvedAt: daysAgo(7),
    },
    {
        id: "emg_seed_004",
        type: client_1.EmergencyType.FIRE,
        title: "Small fire near transformer yard",
        status: client_1.EmergencyStatus.ON_SCENE,
        departmentId: "dept-public-works",
        createdAt: daysAgo(1),
        resolvedAt: null,
    },
];
const seedAppointments = [
    {
        id: "app_seed_001",
        title: "Property tax review",
        status: client_1.AppointmentStatus.CONFIRMED,
        departmentId: "dept-public-works",
        citizenId: "usr_seed_citizen1",
        scheduledAt: daysFrom(2),
        createdAt: daysAgo(3),
    },
    {
        id: "app_seed_002",
        title: "Building permit consultation",
        status: client_1.AppointmentStatus.PENDING,
        departmentId: "dept-public-works",
        citizenId: "usr_seed_citizen2",
        scheduledAt: daysFrom(5),
        createdAt: daysAgo(1),
    },
    {
        id: "app_seed_003",
        title: "Water meter inspection",
        status: client_1.AppointmentStatus.COMPLETED,
        departmentId: "dept-water-sanitation",
        citizenId: "usr_seed_citizen1",
        scheduledAt: daysAgo(6),
        createdAt: daysAgo(9),
    },
    {
        id: "app_seed_004",
        title: "Sanitation appeal hearing",
        status: client_1.AppointmentStatus.CANCELLED,
        departmentId: "dept-health",
        citizenId: "usr_seed_citizen2",
        scheduledAt: daysAgo(2),
        createdAt: daysAgo(8),
    },
];
// Aliased to the emergency/appointments singletons so reports reflect the
// live dataset instead of a separate copy.
exports.reportRepository = {
    emergencies: (0, repository_1.collection)("emergencies"),
    appointments: (0, repository_1.collection)("appointments"),
    reset() {
        this.emergencies.seed(seedEmergencies);
        this.appointments.seed(seedAppointments);
    },
};
exports.default = exports.reportRepository;
//# sourceMappingURL=index.js.map