"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMarkerSchema = void 0;
const zod_1 = require("zod");
const dto_1 = require("../dto");
exports.createMarkerSchema = zod_1.z.object({
    type: zod_1.z.enum(dto_1.MARKER_TYPES),
    title: zod_1.z.string().min(2, "title must be at least 2 characters"),
    latitude: zod_1.z.number().min(-90).max(90),
    longitude: zod_1.z.number().min(-180).max(180),
    status: zod_1.z.string().optional(),
    severity: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
});
//# sourceMappingURL=index.js.map