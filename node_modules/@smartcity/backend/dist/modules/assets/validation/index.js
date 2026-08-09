"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInspectionSchema = exports.updateAssetStatusSchema = exports.createAssetSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createAssetSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "name is required"),
    category: zod_1.z.nativeEnum(client_1.AssetCategory).optional(),
    status: zod_1.z.nativeEnum(client_1.AssetStatus).optional(),
    latitude: zod_1.z.number().nullable().optional(),
    longitude: zod_1.z.number().nullable().optional(),
    address: zod_1.z.string().optional(),
    imageUrl: zod_1.z.string().optional(),
    department: zod_1.z.string().min(1, "department is required"),
    maintainedBy: zod_1.z.string().optional(),
});
exports.updateAssetStatusSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(client_1.AssetStatus),
    note: zod_1.z.string().optional(),
});
exports.createInspectionSchema = zod_1.z.object({
    status: zod_1.z.string().min(1, "status is required"),
    findings: zod_1.z.string().min(1, "findings is required"),
});
//# sourceMappingURL=index.js.map