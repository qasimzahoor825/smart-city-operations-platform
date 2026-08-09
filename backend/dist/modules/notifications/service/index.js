"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = void 0;
const client_1 = require("@prisma/client");
const common_1 = require("@smartcity/common");
const repository_1 = require("../../auth/repository");
const socket_1 = require("../../../core/socket");
const repository_2 = require("../repository");
const DEFAULT_CATEGORIES = ["complaints", "payments", "emergencies", "appointments", "system"];
function publishSocket(notification) {
    const userId = notification.userId ?? null;
    if (userId)
        (0, socket_1.emitToRoom)(`user:${userId}`, "notification:new", notification);
    (0, socket_1.emitToRoom)("staff", "notification:new", notification);
}
function dispatch(notification) {
    const results = [];
    const targets = new Set();
    if (notification.type === client_1.NotificationType.IN_APP || notification.channel === "in_app") {
        targets.add("in_app");
    }
    if (notification.type === client_1.NotificationType.EMAIL || notification.channel === "email") {
        targets.add("email");
    }
    if (notification.type === client_1.NotificationType.PUSH || notification.channel === "push") {
        targets.add("push");
    }
    if (notification.type === client_1.NotificationType.SMS || notification.channel === "sms") {
        targets.add("sms");
    }
    targets.forEach((channel) => {
        results.push({ channel, status: "SENT" });
    });
    if (results.length === 0)
        results.push({ channel: "in_app", status: "SENT" });
    return results;
}
exports.notificationService = {
    async list(query = {}) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const userId = query.userId ?? null;
        const items = repository_2.notificationRepository.notifications.query({
            filter: (n) => (userId === null || n.userId === userId) && (query.unread === undefined || n.isRead !== query.unread),
            sort: (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        });
        const { items: paged, pagination } = (0, common_1.paginate)(items, page, limit);
        return { items: paged, pagination };
    },
    async unreadCount(userId) {
        const count = repository_2.notificationRepository.notifications
            .all()
            .filter((n) => n.userId === userId && !n.isRead).length;
        return { count };
    },
    async markRead(id, userId) {
        const notification = repository_2.notificationRepository.notifications.findById(id);
        if (!notification)
            throw new common_1.NotFoundError("Notification not found");
        if (notification.userId !== null && notification.userId !== userId) {
            throw new common_1.ForbiddenError("Cannot modify another user's notification");
        }
        const updated = repository_2.notificationRepository.notifications.update(id, { isRead: true });
        if (!updated)
            throw new common_1.NotFoundError("Notification not found");
        return updated;
    },
    async readAll(userId) {
        let updated = 0;
        repository_2.notificationRepository.notifications
            .all()
            .filter((n) => n.userId === userId && !n.isRead)
            .forEach((n) => {
            repository_2.notificationRepository.notifications.update(n.id, { isRead: true });
            updated += 1;
        });
        return { updated };
    },
    async send(dto) {
        const title = (dto.title ?? "").trim();
        const message = (dto.message ?? "").trim();
        if (!title)
            throw new common_1.ValidationError({ title: "title is required" });
        if (!message)
            throw new common_1.ValidationError({ message: "message is required" });
        const user = repository_1.authRepository.users.findById(dto.userId);
        if (!user)
            throw new common_1.AppError("User not found", 404);
        const notification = repository_2.notificationRepository.notifications.create({
            type: dto.type ?? client_1.NotificationType.IN_APP,
            userId: dto.userId,
            title,
            message,
            channel: (dto.channel ?? "in_app").trim().toLowerCase() || "in_app",
            isRead: false,
            payload: dto.payload ?? null,
            createdAt: new Date().toISOString(),
        });
        publishSocket(notification);
        return {
            notification: {
                id: notification.id,
                type: notification.type,
                userId: notification.userId ?? dto.userId,
                title: notification.title,
                message: notification.message,
                channel: notification.channel,
                isRead: notification.isRead,
                createdAt: notification.createdAt,
            },
            delivery: dispatch(notification),
        };
    },
    /**
     * Programmatic notifications from business workflows (complaint assigned,
     * emergency reported, payment confirmed…). Persists the notification and
     * pushes it to the recipient's socket room in one step.
     */
    async notify(userId, title, message, options = {}) {
        const channel = (options.channel ?? "in_app").trim().toLowerCase() || "in_app";
        const notification = repository_2.notificationRepository.notifications.create({
            type: options.type ?? client_1.NotificationType.IN_APP,
            userId,
            title,
            message,
            channel,
            isRead: false,
            payload: options.payload ?? null,
            createdAt: new Date().toISOString(),
        });
        publishSocket(notification);
        return notification;
    },
    async getPreferences(userId) {
        const existing = repository_2.notificationRepository.findPreference(userId);
        if (existing)
            return existing;
        return repository_2.notificationRepository.preferences.create({
            userId,
            email: true,
            push: true,
            sms: true,
            categories: [...DEFAULT_CATEGORIES],
            updatedAt: new Date().toISOString(),
        });
    },
    async updatePreferences(userId, dto) {
        const now = new Date().toISOString();
        const existing = repository_2.notificationRepository.findPreference(userId);
        if (!existing) {
            return repository_2.notificationRepository.preferences.create({
                userId,
                email: dto.email ?? true,
                push: dto.push ?? true,
                sms: dto.sms ?? true,
                categories: dto.categories ?? [...DEFAULT_CATEGORIES],
                updatedAt: now,
            });
        }
        const patch = { updatedAt: now };
        if (dto.email !== undefined)
            patch.email = dto.email;
        if (dto.push !== undefined)
            patch.push = dto.push;
        if (dto.sms !== undefined)
            patch.sms = dto.sms;
        if (dto.categories !== undefined)
            patch.categories = dto.categories;
        const updated = repository_2.notificationRepository.preferences.update(existing.id, patch);
        if (!updated)
            throw new common_1.NotFoundError("Preferences not found");
        return updated;
    },
};
exports.default = exports.notificationService;
//# sourceMappingURL=index.js.map