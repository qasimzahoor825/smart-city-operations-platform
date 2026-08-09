"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.payBillSchema = void 0;
const zod_1 = require("zod");
exports.payBillSchema = zod_1.z.object({
    billId: zod_1.z.string().min(1, "billId is required"),
    method: zod_1.z.string().min(1, "method is required").optional(),
});
//# sourceMappingURL=index.js.map