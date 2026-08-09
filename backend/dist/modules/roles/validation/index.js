"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleParamSchema = void 0;
const zod_1 = require("zod");
const roleValues = ["CITIZEN", "OFFICER", "DEPARTMENT_HEAD", "SUPER_ADMIN"];
exports.roleParamSchema = zod_1.z.object({
    role: zod_1.z.enum(roleValues),
});
//# sourceMappingURL=index.js.map