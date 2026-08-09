"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appointmentRepository = void 0;
const repository_1 = require("../../../core/database/repository");
const client_1 = require("@prisma/client");
const nowMs = Date.now();
const daysAgo = (d) => new Date(nowMs - d * 86_400_000).toISOString();
const daysFrom = (d) => new Date(nowMs + d * 86_400_000).toISOString();
const seedAppointments = [
    {
        id: "apt_seed_001",
        title: "Property tax consultation",
        description: "Discuss property tax reassessment with Public Works",
        scheduledAt: daysFrom(2),
        status: client_1.AppointmentStatus.PENDING,
        citizenId: "usr_seed_citizen1",
        citizenName: "Sarah Jenkins",
        departmentId: "dept-public-works",
        departmentName: "Public Works",
        durationMinutes: 30,
        createdAt: daysAgo(3),
        updatedAt: daysAgo(3),
    },
    {
        id: "apt_seed_002",
        title: "Community utility billing review",
        description: "Review monthly utility bill billing history.",
        scheduledAt: daysFrom(1),
        status: client_1.AppointmentStatus.CONFIRMED,
        citizenId: "usr_seed_citizen1",
        citizenName: "Sarah Jenkins",
        departmentId: "dept-public-works",
        departmentName: "Public Works",
        durationMinutes: 30,
        createdAt: daysAgo(2),
        updatedAt: daysAgo(1),
    },
    {
        id: "apt_seed_003",
        title: "Property inspection follow-up",
        description: "Follow-up on the pending property inspection.",
        scheduledAt: daysFrom(5),
        status: client_1.AppointmentStatus.PENDING,
        citizenId: "usr_seed_citizen2",
        citizenName: "James Carter",
        departmentId: "dept-public-works",
        departmentName: "Public Works",
        durationMinutes: 45,
        createdAt: daysAgo(1),
        updatedAt: daysAgo(1),
    },
    {
        id: "apt_seed_004",
        title: "Road maintenance consultation",
        description: "Discuss scheduled road maintenance on Elm Street.",
        scheduledAt: daysAgo(4),
        status: client_1.AppointmentStatus.COMPLETED,
        citizenId: "usr_seed_citizen1",
        citizenName: "Sarah Jenkins",
        departmentId: "dept-public-works",
        departmentName: "Public Works",
        durationMinutes: 30,
        createdAt: daysAgo(9),
        updatedAt: daysAgo(4),
    },
];
exports.appointmentRepository = {
    appointments: (0, repository_1.collection)("appointments"),
    reset() {
        this.appointments.seed(seedAppointments);
    },
};
exports.default = exports.appointmentRepository;
//# sourceMappingURL=index.js.map