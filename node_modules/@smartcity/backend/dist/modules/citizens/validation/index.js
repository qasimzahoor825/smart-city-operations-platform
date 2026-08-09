"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCitizensQuerySchema = exports.citizenIdParamSchema = exports.updateCitizenProfileSchema = void 0;
const zod_1 = require("zod");
exports.updateCitizenProfileSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2, "Full name is required").optional(),
    phoneNumber: zod_1.z.string().nullable().optional(),
    avatar: zod_1.z.string().nullable().optional(),
    ward: zod_1.z.string().nullable().optional(),
    district: zod_1.z.string().nullable().optional(),
});
exports.citizenIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, "Citizen id is required"),
});
exports.listCitizensQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().optional(),
    limit: zod_1.z.coerce.number().int().positive().max(100).optional(),
    search: zod_1.z.string().optional(),
    ward: zod_1.z.string().optional(),
});
//# sourceMappingURL=index.js.map