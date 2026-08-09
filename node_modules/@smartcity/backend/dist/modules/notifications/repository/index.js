"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationRepository = void 0;
const repository_1 = require("../../../core/database/repository");
const client_1 = require("@prisma/client");
const nowMs = Date.now();
const hoursAgo = (h) => new Date(nowMs - h * 3_600_000).toISOString();
const daysAgo = (d) => new Date(nowMs - d * 86_400_000).toISOString();
const seedNotifications = [
    {
        id: "ntf_seed_001",
        type: client_1.NotificationType.IN_APP,
        userId: "usr_seed_citizen1",
        title: "Complaint received",
        message: "Your streetlight complaint CMP-24-8F3K2A has been received and assigned.",
        channel: "in_app",
        isRead: false,
        payload: { complaintId: "cmp_seed_001" },
        createdAt: hoursAgo(2),
    },
    {
        id: "ntf_seed_002",
        type: client_1.NotificationType.EMAIL,
        userId: "usr_seed_citizen1",
        title: "Payment due",
        message: "Your property tax bill of $450.00 is due in 5 days.",
        channel: "email",
        isRead: false,
        payload: { billType: "property_tax" },
        createdAt: hoursAgo(6),
    },
    {
        id: "ntf_seed_003",
        type: client_1.NotificationType.PUSH,
        userId: "usr_seed_citizen1",
        title: "Emergency alert",
        message: "Water leak reported near Garden Avenue. Crews have been dispatched.",
        channel: "push",
        isRead: true,
        payload: { emergencyId: "emg_seed_002" },
        createdAt: daysAgo(1),
    },
    {
        id: "ntf_seed_004",
        type: client_1.NotificationType.IN_APP,
        userId: "usr_seed_citizen2",
        title: "Complaint resolved",
        message: "Your pothole complaint has been marked as resolved. Thank you.",
        channel: "in_app",
        isRead: false,
        payload: { complaintId: "cmp_seed_002" },
        createdAt: daysAgo(2),
    },
    {
        id: "ntf_seed_005",
        type: client_1.NotificationType.SMS,
        userId: "usr_seed_citizen2",
        title: "Appointment reminder",
        message: "Reminder: Your property tax office visit is scheduled for tomorrow at 10:00.",
        channel: "sms",
        isRead: true,
        payload: null,
        createdAt: daysAgo(1),
    },
    {
        id: "ntf_seed_006",
        type: client_1.NotificationType.SYSTEM,
        userId: null,
        title: "System maintenance",
        message: "The citizen portal will be briefly unavailable on Sunday 02:00–04:00 for maintenance.",
        channel: "in_app",
        isRead: false,
        payload: null,
        createdAt: daysAgo(3),
    },
];
const seedPreferences = [
    {
        id: "npr_seed_001",
        userId: "usr_seed_citizen1",
        email: true,
        push: true,
        sms: false,
        categories: ["complaints", "payments", "emergencies", "appointments"],
        updatedAt: daysAgo(2),
    },
    {
        id: "npr_seed_002",
        userId: "usr_seed_citizen2",
        email: true,
        push: true,
        sms: true,
        categories: ["complaints", "emergencies"],
        updatedAt: daysAgo(6),
    },
];
exports.notificationRepository = {
    notifications: (0, repository_1.collection)("notifications"),
    preferences: (0, repository_1.collection)("notification_preferences"),
    findPreference(userId) {
        return this.preferences.all().find((p) => p.userId === userId);
    },
    reset() {
        this.notifications.seed(seedNotifications);
        this.preferences.seed(seedPreferences);
    },
};
exports.default = exports.notificationRepository;
//# sourceMappingURL=index.js.map