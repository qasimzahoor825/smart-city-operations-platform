"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appointmentStatusSchema = exports.createAppointmentSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createAppointmentSchema = zod_1.z.object({
    title: zod_1.z.string().min(3, "title must be at least 3 characters"),
    description: zod_1.z.string().optional(),
    scheduledAt: zod_1.z.string().min(1, "scheduledAt must be an ISO datetime string"),
    departmentId: zod_1.z.string().optional(),
    durationMinutes: zod_1.z.number().int().positive().max(480).optional(),
});
exports.appointmentStatusSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(client_1.AppointmentStatus),
    note: zod_1.z.string().optional(),
});
//# sourceMappingURL=index.js.map