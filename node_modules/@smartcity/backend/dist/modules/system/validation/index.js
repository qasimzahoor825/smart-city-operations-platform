"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSettingsSchema = void 0;
const zod_1 = require("zod");
exports.updateSettingsSchema = zod_1.z.object({
    platformName: zod_1.z.string().min(1, "platformName is required").optional(),
    maintenanceMode: zod_1.z.boolean().optional(),
    allowRegistrations: zod_1.z.boolean().optional(),
    allowPublicComplaints: zod_1.z.boolean().optional(),
    notificationsEnabled: zod_1.z.boolean().optional(),
});
//# sourceMappingURL=index.js.map