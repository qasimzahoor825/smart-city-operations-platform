"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditRepository = void 0;
const repository_1 = require("../../../core/database/repository");
exports.auditRepository = {
    logs: (0, repository_1.collection)("audit_logs"),
};
exports.default = exports.auditRepository;
//# sourceMappingURL=index.js.map