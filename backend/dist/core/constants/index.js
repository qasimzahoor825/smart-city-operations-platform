"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SLA_HOURS_BY_STATUS = exports.COMPLAINT_CATEGORIES = exports.MAX_PAGE_SIZE = exports.DEFAULT_PAGE_SIZE = exports.ROLE_LABELS = exports.API_VERSION = exports.APP_NAME = void 0;
exports.APP_NAME = "SmartCity OS";
exports.API_VERSION = "v1";
exports.ROLE_LABELS = {
    CITIZEN: "Citizen",
    OFFICER: "Municipal Officer",
    DEPARTMENT_HEAD: "Department Head",
    SUPER_ADMIN: "Super Admin",
};
exports.DEFAULT_PAGE_SIZE = 20;
exports.MAX_PAGE_SIZE = 100;
exports.COMPLAINT_CATEGORIES = [
    "ROAD",
    "WATER",
    "ELECTRICITY",
    "STREET_LIGHT",
    "GARBAGE",
    "PARKS",
    "NOISE",
    "OTHER",
];
exports.SLA_HOURS_BY_STATUS = {
    SUBMITTED: 72,
    ASSIGNED: 48,
    IN_PROGRESS: 24,
};
//# sourceMappingURL=index.js.map