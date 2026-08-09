"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dispatchEmergencySchema = exports.createEmergencySchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createEmergencySchema = zod_1.z.object({
    type: zod_1.z.nativeEnum(client_1.EmergencyType),
    title: zod_1.z.string().min(3, "title must be at least 3 characters"),
    description: zod_1.z.string().min(5, "description must be at least 5 characters"),
    severity: zod_1.z.nativeEnum(client_1.TicketPriority).optional(),
    latitude: zod_1.z.number().nullable().optional(),
    longitude: zod_1.z.number().nullable().optional(),
    address: zod_1.z.string().optional(),
});
exports.dispatchEmergencySchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(client_1.EmergencyStatus),
    note: zod_1.z.string().optional(),
    unit: zod_1.z.string().optional(),
});
//# sourceMappingURL=index.js.map