"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleRepository = exports.seedRoles = void 0;
const repository_1 = require("../../../core/database/repository");
const common_1 = require("@smartcity/common");
exports.seedRoles = [
    {
        role: common_1.UserRole.CITIZEN,
        name: "Citizen",
        description: "Residents who submit complaints, book appointments and access public services.",
        permissions: [
            "complaints:create",
            "complaints:read:own",
            "complaints:update:own",
            "payments:initiate",
            "appointments:book",
            "emergencies:report",
            "profile:view:own",
            "notifications:read",
        ],
        claims: [
            { resource: "complaints", action: "create", scope: "self" },
            { resource: "complaints", action: "read", scope: "self" },
            { resource: "payments", action: "create", scope: "self" },
            { resource: "appointments", action: "create", scope: "self" },
            { resource: "emergencies", action: "create", scope: "public" },
        ],
    },
    {
        role: common_1.UserRole.OFFICER,
        name: "Municipal Officer",
        description: "Department staff who resolve assigned complaints and update their status.",
        permissions: [
            "complaints:read:assigned",
            "complaints:update:assigned",
            "complaints:comment",
            "assets:read",
            "news:create",
            "events:create",
        ],
        claims: [
            { resource: "complaints", action: "read", scope: "department" },
            { resource: "complaints", action: "update", scope: "department" },
            { resource: "complaints", action: "create", scope: "department" },
            { resource: "assets", action: "read", scope: "department" },
        ],
    },
    {
        role: common_1.UserRole.DEPARTMENT_HEAD,
        name: "Department Head",
        description: "Manages a department, assigns officers and reviews department performance.",
        permissions: [
            "complaints:manage",
            "complaints:read:department",
            "complaints:assign",
            "members:manage",
            "reports:read",
            "assets:manage",
            "statistics:read",
        ],
        claims: [
            { resource: "complaints", action: "manage", scope: "department" },
            { resource: "complaints", action: "assign", scope: "department" },
            { resource: "members", action: "manage", scope: "department" },
            { resource: "reports", action: "read", scope: "department" },
            { resource: "assets", action: "manage", scope: "department" },
        ],
    },
    {
        role: common_1.UserRole.SUPER_ADMIN,
        name: "Super Admin",
        description: "Platform administrator with full access across all tenants and departments.",
        permissions: ["*"],
        claims: [
            { resource: "*", action: "manage", scope: "global" },
            { resource: "users", action: "manage", scope: "global" },
            { resource: "departments", action: "manage", scope: "global" },
            { resource: "roles", action: "manage", scope: "global" },
            { resource: "system", action: "manage", scope: "global" },
        ],
    },
];
const roles = (0, repository_1.collection)("roles");
exports.roleRepository = {
    roles,
    findByRole(role) {
        return roles.all().find((r) => r.role === role);
    },
};
exports.default = exports.roleRepository;
//# sourceMappingURL=index.js.map