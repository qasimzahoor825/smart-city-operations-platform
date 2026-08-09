"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRepository = exports.seedUsers = void 0;
const repository_1 = require("../../../core/database/repository");
const common_1 = require("@smartcity/common");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
/**
 * Test fixtures only. These are NEVER seeded into MongoDB — the repositories
 * start empty and hydate real records from the database on boot. Tests use
 * `seed()`/`reset()` against the in-memory cache.
 */
const now = new Date();
const hashOf = (s) => bcryptjs_1.default.hashSync(s, 10);
exports.seedUsers = [
    {
        id: "usr_seed_admin",
        fullName: "System Admin",
        email: "superadmin@smartcity.gov",
        passwordHash: hashOf("Admin@1234"),
        role: common_1.UserRole.SUPER_ADMIN,
        isEmailVerified: true,
        isActive: true,
        createdAt: new Date(now.getTime() - 90 * 86_400_000).toISOString(),
        updatedAt: now.toISOString(),
    },
    {
        id: "usr_head-pw",
        fullName: "Ayesha Khan",
        email: "head@publicworks.gov",
        passwordHash: hashOf("Officer@1234"),
        role: common_1.UserRole.DEPARTMENT_HEAD,
        departmentId: "dept-public-works",
        isEmailVerified: true,
        isActive: true,
        createdAt: new Date(now.getTime() - 60 * 86_400_000).toISOString(),
        updatedAt: now.toISOString(),
    },
    {
        id: "usr_seed_officer1",
        fullName: "Bilal Ahmed",
        email: "officer@publicworks.gov",
        passwordHash: hashOf("Officer@1234"),
        role: common_1.UserRole.OFFICER,
        departmentId: "dept-public-works",
        isEmailVerified: true,
        isActive: true,
        createdAt: new Date(now.getTime() - 45 * 86_400_000).toISOString(),
        updatedAt: now.toISOString(),
    },
    {
        id: "usr_seed_officer2",
        fullName: "Mana Patel",
        email: "mana@water.gov",
        passwordHash: hashOf("Officer@1234"),
        role: common_1.UserRole.OFFICER,
        departmentId: "dept-water-sanitation",
        isEmailVerified: true,
        isActive: true,
        createdAt: new Date(now.getTime() - 20 * 86_400_000).toISOString(),
        updatedAt: now.toISOString(),
    },
    {
        id: "usr_seed_officer3",
        fullName: "Omar Farouk",
        email: "omar@health.gov",
        passwordHash: hashOf("Officer@1234"),
        role: common_1.UserRole.OFFICER,
        departmentId: "dept-health-transport",
        isEmailVerified: true,
        isActive: true,
        createdAt: new Date(now.getTime() - 15 * 86_400_000).toISOString(),
        updatedAt: now.toISOString(),
    },
    {
        id: "usr_head_health",
        fullName: "Dr. Naila Rehman",
        email: "health.head@smartcity.gov",
        passwordHash: hashOf("Officer@1234"),
        role: common_1.UserRole.DEPARTMENT_HEAD,
        departmentId: "dept-health",
        isEmailVerified: true,
        isActive: true,
        createdAt: new Date(now.getTime() - 50 * 86_400_000).toISOString(),
        updatedAt: now.toISOString(),
    },
    {
        id: "usr_officer_health",
        fullName: "Hassan Malik",
        email: "health.officer@smartcity.gov",
        passwordHash: hashOf("Officer@1234"),
        role: common_1.UserRole.OFFICER,
        departmentId: "dept-health",
        isEmailVerified: true,
        isActive: true,
        createdAt: new Date(now.getTime() - 25 * 86_400_000).toISOString(),
        updatedAt: now.toISOString(),
    },
    {
        id: "usr_head_education",
        fullName: "Prof. Sana Tariq",
        email: "education.head@smartcity.gov",
        passwordHash: hashOf("Officer@1234"),
        role: common_1.UserRole.DEPARTMENT_HEAD,
        departmentId: "dept-education",
        isEmailVerified: true,
        isActive: true,
        createdAt: new Date(now.getTime() - 42 * 86_400_000).toISOString(),
        updatedAt: now.toISOString(),
    },
    {
        id: "usr_head_transport",
        fullName: "Arif Mehmood",
        email: "transport.head@smartcity.gov",
        passwordHash: hashOf("Officer@1234"),
        role: common_1.UserRole.DEPARTMENT_HEAD,
        departmentId: "dept-transport",
        isEmailVerified: true,
        isActive: true,
        createdAt: new Date(now.getTime() - 38 * 86_400_000).toISOString(),
        updatedAt: now.toISOString(),
    },
    {
        id: "usr_officer_transport",
        fullName: "Zainab Ali",
        email: "transport.officer@smartcity.gov",
        passwordHash: hashOf("Officer@1234"),
        role: common_1.UserRole.OFFICER,
        departmentId: "dept-transport",
        isEmailVerified: true,
        isActive: true,
        createdAt: new Date(now.getTime() - 18 * 86_400_000).toISOString(),
        updatedAt: now.toISOString(),
    },
    {
        id: "usr_head_electricity",
        fullName: "Eng. Kashif Javed",
        email: "electricity.head@smartcity.gov",
        passwordHash: hashOf("Officer@1234"),
        role: common_1.UserRole.DEPARTMENT_HEAD,
        departmentId: "dept-electricity",
        isEmailVerified: true,
        isActive: true,
        createdAt: new Date(now.getTime() - 44 * 86_400_000).toISOString(),
        updatedAt: now.toISOString(),
    },
    {
        id: "usr_officer_electricity",
        fullName: "Adnan Raza",
        email: "electricity.officer@smartcity.gov",
        passwordHash: hashOf("Officer@1234"),
        role: common_1.UserRole.OFFICER,
        departmentId: "dept-electricity",
        isEmailVerified: true,
        isActive: true,
        createdAt: new Date(now.getTime() - 22 * 86_400_000).toISOString(),
        updatedAt: now.toISOString(),
    },
    {
        id: "usr_head_municipal",
        fullName: "Rabia Sultana",
        email: "municipal.head@smartcity.gov",
        passwordHash: hashOf("Officer@1234"),
        role: common_1.UserRole.DEPARTMENT_HEAD,
        departmentId: "dept-municipal",
        isEmailVerified: true,
        isActive: true,
        createdAt: new Date(now.getTime() - 36 * 86_400_000).toISOString(),
        updatedAt: now.toISOString(),
    },
    {
        id: "usr_officer_municipal",
        fullName: "Imran Baig",
        email: "municipal.officer@smartcity.gov",
        passwordHash: hashOf("Officer@1234"),
        role: common_1.UserRole.OFFICER,
        departmentId: "dept-municipal",
        isEmailVerified: true,
        isActive: true,
        createdAt: new Date(now.getTime() - 16 * 86_400_000).toISOString(),
        updatedAt: now.toISOString(),
    },
    {
        id: "usr_head_emergency",
        fullName: "Capt. Faisal Anwar",
        email: "emergency.head@smartcity.gov",
        passwordHash: hashOf("Officer@1234"),
        role: common_1.UserRole.DEPARTMENT_HEAD,
        departmentId: "dept-emergency",
        isEmailVerified: true,
        isActive: true,
        createdAt: new Date(now.getTime() - 33 * 86_400_000).toISOString(),
        updatedAt: now.toISOString(),
    },
    {
        id: "usr_officer_emergency",
        fullName: "Daniyal Qureshi",
        email: "emergency.officer@smartcity.gov",
        passwordHash: hashOf("Officer@1234"),
        role: common_1.UserRole.OFFICER,
        departmentId: "dept-emergency",
        isEmailVerified: true,
        isActive: true,
        createdAt: new Date(now.getTime() - 14 * 86_400_000).toISOString(),
        updatedAt: now.toISOString(),
    },
    {
        id: "usr_seed_citizen1",
        fullName: "Sarah Jenkins",
        email: "citizen@smartcity.gov",
        passwordHash: hashOf("Citizen@1234"),
        role: common_1.UserRole.CITIZEN,
        phoneNumber: "+1 555-0100",
        isEmailVerified: true,
        isActive: true,
        createdAt: new Date(now.getTime() - 30 * 86_400_000).toISOString(),
        updatedAt: now.toISOString(),
    },
    {
        id: "usr_seed_citizen2",
        fullName: "James Carter",
        email: "james@example.com",
        passwordHash: hashOf("Citizen@1234"),
        role: common_1.UserRole.CITIZEN,
        isEmailVerified: true,
        isActive: true,
        createdAt: new Date(now.getTime() - 10 * 86_400_000).toISOString(),
        updatedAt: now.toISOString(),
    },
];
// The user store is shared with the users/citizens modules via the same MongoDB
// "users" collection — one source of truth, no duplicated datasets.
const users = (0, repository_1.collection)("users");
const sessions = (0, repository_1.collection)("auth_sessions");
const passwordResets = (0, repository_1.collection)("password_resets");
exports.authRepository = {
    users,
    sessions,
    passwordResets,
    findByEmail(email) {
        return users.all().find((u) => u.email.toLowerCase() === email.toLowerCase());
    },
    toPublic(user) {
        const { passwordHash: _ph, ...rest } = user;
        return rest;
    },
};
exports.default = exports.authRepository;
//# sourceMappingURL=index.js.map