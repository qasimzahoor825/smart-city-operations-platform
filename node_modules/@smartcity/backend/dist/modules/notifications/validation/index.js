"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationParamsSchema = exports.updatePreferencesSchema = exports.sendNotificationSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.sendNotificationSchema = zod_1.z.object({
    userId: zod_1.z.string().min(1, "userId is required"),
    title: zod_1.z.string().min(1, "title is required"),
    message: zod_1.z.string().min(1, "message is required"),
    type: zod_1.z.nativeEnum(client_1.NotificationType).optional(),
    channel: zod_1.z.string().optional(),
    payload: zod_1.z.record(zod_1.z.unknown()).optional(),
});
exports.updatePreferencesSchema = zod_1.z.object({
    email: zod_1.z.boolean().optional(),
    push: zod_1.z.boolean().optional(),
    sms: zod_1.z.boolean().optional(),
    categories: zod_1.z.array(zod_1.z.string()).min(1, "At least one category is required").optional(),
});
exports.notificationParamsSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, "id is required"),
});
//# sourceMappingURL=index.js.map