"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentSchema = exports.feedbackSchema = exports.complaintStatusSchema = exports.assignComplaintSchema = exports.updateComplaintSchema = exports.createComplaintSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createComplaintSchema = zod_1.z.object({
    title: zod_1.z.string().min(3, "title must be at least 3 characters"),
    description: zod_1.z.string().min(5, "description must be at least 5 characters"),
    category: zod_1.z.string().min(2, "category is required"),
    priority: zod_1.z.nativeEnum(client_1.TicketPriority).optional(),
    latitude: zod_1.z.number().nullable().optional(),
    longitude: zod_1.z.number().nullable().optional(),
    address: zod_1.z.string().optional(),
    imageUrls: zod_1.z.array(zod_1.z.string()).optional(),
    departmentId: zod_1.z.string().optional(),
    autoReceived: zod_1.z.boolean().optional(),
    ai: zod_1.z
        .object({
        category: zod_1.z.string().nullable().optional(),
        priority: zod_1.z.string().nullable().optional(),
        departmentId: zod_1.z.string().nullable().optional(),
        departmentName: zod_1.z.string().nullable().optional(),
        summary: zod_1.z.string().nullable().optional(),
        source: zod_1.z.string().nullable().optional(),
    })
        .nullable()
        .optional(),
});
exports.updateComplaintSchema = zod_1.z.object({
    title: zod_1.z.string().min(3).optional(),
    description: zod_1.z.string().min(5).optional(),
    category: zod_1.z.string().min(2).optional(),
    priority: zod_1.z.nativeEnum(client_1.TicketPriority).optional(),
    address: zod_1.z.string().optional(),
    imageUrls: zod_1.z.array(zod_1.z.string()).optional(),
    latitude: zod_1.z.number().nullable().optional(),
    longitude: zod_1.z.number().nullable().optional(),
    departmentId: zod_1.z.string().optional(),
});
exports.assignComplaintSchema = zod_1.z.object({
    officerId: zod_1.z.string().min(1, "officerId is required"),
    departmentId: zod_1.z.string().optional(),
});
exports.complaintStatusSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(client_1.TicketStatus),
    note: zod_1.z.string().optional(),
});
exports.feedbackSchema = zod_1.z.object({
    rating: zod_1.z.number().int().min(1).max(5, "rating must be between 1 and 5"),
    comment: zod_1.z.string().optional(),
});
exports.commentSchema = zod_1.z.object({
    body: zod_1.z.string().min(1, "body is required"),
});
//# sourceMappingURL=index.js.map