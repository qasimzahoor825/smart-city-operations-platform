"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.departmentRepository = exports.seedDepartmentComplaints = exports.seedDepartments = void 0;
const repository_1 = require("../../../core/database/repository");
const common_1 = require("@smartcity/common");
const now = new Date();
const daysAgo = (d) => new Date(now.getTime() - d * 86_400_000).toISOString();
const membersOf = (userId, fullName, email, role) => ({
    userId,
    fullName,
    email,
    role,
    joinedAt: daysAgo(40),
});
exports.seedDepartments = [
    {
        id: "dept-public-works",
        name: "Public Works",
        code: "PW",
        description: "Roads, street lighting and public infrastructure maintenance.",
        managerId: "usr_head-pw",
        members: [
            membersOf("usr_head-pw", "Ayesha Khan", "head@publicworks.gov", common_1.UserRole.DEPARTMENT_HEAD),
            membersOf("usr_seed_officer1", "Bilal Ahmed", "officer@publicworks.gov", common_1.UserRole.OFFICER),
        ],
        createdAt: daysAgo(90),
        updatedAt: daysAgo(4),
    },
    {
        id: "dept-water-sanitation",
        name: "Water & Sanitation",
        code: "WS",
        description: "Clean water supply, drainage and sanitation services.",
        managerId: "usr_seed_officer2",
        members: [membersOf("usr_seed_officer2", "Mana Patel", "mana@water.gov", common_1.UserRole.OFFICER)],
        createdAt: daysAgo(85),
        updatedAt: daysAgo(2),
    },
    {
        id: "dept-health-transport",
        name: "Public Health & Transport",
        code: "HT",
        description: "Sanitation enforcement and public transport operations.",
        managerId: null,
        members: [membersOf("usr_seed_officer3", "Omar Farouk", "omar@health.gov", common_1.UserRole.OFFICER)],
        createdAt: daysAgo(70),
        updatedAt: daysAgo(10),
    },
    {
        id: "dept-health",
        name: "Health Department",
        code: "HD",
        description: "Public health, hospitals and sanitation enforcement.",
        managerId: "usr_head_health",
        members: [
            membersOf("usr_head_health", "Dr. Naila Rehman", "health.head@smartcity.gov", common_1.UserRole.DEPARTMENT_HEAD),
            membersOf("usr_officer_health", "Hassan Malik", "health.officer@smartcity.gov", common_1.UserRole.OFFICER),
        ],
        createdAt: daysAgo(66),
        updatedAt: daysAgo(3),
    },
    {
        id: "dept-education",
        name: "Education Department",
        code: "ED",
        description: "Schools, colleges and education infrastructure.",
        managerId: "usr_head_education",
        members: [
            membersOf("usr_head_education", "Prof. Sana Tariq", "education.head@smartcity.gov", common_1.UserRole.DEPARTMENT_HEAD),
        ],
        createdAt: daysAgo(62),
        updatedAt: daysAgo(5),
    },
    {
        id: "dept-transport",
        name: "Transport Department",
        code: "TR",
        description: "Public transport, traffic zones and road safety.",
        managerId: "usr_head_transport",
        members: [
            membersOf("usr_head_transport", "Arif Mehmood", "transport.head@smartcity.gov", common_1.UserRole.DEPARTMENT_HEAD),
            membersOf("usr_officer_transport", "Zainab Ali", "transport.officer@smartcity.gov", common_1.UserRole.OFFICER),
        ],
        createdAt: daysAgo(58),
        updatedAt: daysAgo(6),
    },
    {
        id: "dept-electricity",
        name: "Electricity Authority",
        code: "EA",
        description: "Power grid, street lighting and electricity supply.",
        managerId: "usr_head_electricity",
        members: [
            membersOf("usr_head_electricity", "Eng. Kashif Javed", "electricity.head@smartcity.gov", common_1.UserRole.DEPARTMENT_HEAD),
            membersOf("usr_officer_electricity", "Adnan Raza", "electricity.officer@smartcity.gov", common_1.UserRole.OFFICER),
        ],
        createdAt: daysAgo(54),
        updatedAt: daysAgo(4),
    },
    {
        id: "dept-municipal",
        name: "Municipal Services",
        code: "MS",
        description: "Waste collection, parks and public spaces.",
        managerId: "usr_head_municipal",
        members: [
            membersOf("usr_head_municipal", "Rabia Sultana", "municipal.head@smartcity.gov", common_1.UserRole.DEPARTMENT_HEAD),
            membersOf("usr_officer_municipal", "Imran Baig", "municipal.officer@smartcity.gov", common_1.UserRole.OFFICER),
        ],
        createdAt: daysAgo(48),
        updatedAt: daysAgo(8),
    },
    {
        id: "dept-emergency",
        name: "Emergency Services",
        code: "ES",
        description: "Fire, rescue, medical and civil protection response.",
        managerId: "usr_head_emergency",
        members: [
            membersOf("usr_head_emergency", "Capt. Faisal Anwar", "emergency.head@smartcity.gov", common_1.UserRole.DEPARTMENT_HEAD),
            membersOf("usr_officer_emergency", "Daniyal Qureshi", "emergency.officer@smartcity.gov", common_1.UserRole.OFFICER),
        ],
        createdAt: daysAgo(44),
        updatedAt: daysAgo(2),
    },
];
exports.seedDepartmentComplaints = [
    {
        id: "cmp_dept_1",
        departmentId: "dept-public-works",
        citizenId: "usr_seed_citizen1",
        title: "Pothole on Market Street",
        category: "ROAD",
        status: "RESOLVED",
        createdAt: daysAgo(28),
    },
    {
        id: "cmp_dept_2",
        departmentId: "dept-public-works",
        citizenId: "usr_seed_citizen1",
        title: "Street light outage downtown",
        category: "STREET_LIGHT",
        status: "IN_PROGRESS",
        createdAt: daysAgo(9),
    },
    {
        id: "cmp_dept_3",
        departmentId: "dept-water-sanitation",
        citizenId: "usr_seed_citizen2",
        title: "Public tap water leak",
        category: "WATER",
        status: "SUBMITTED",
        createdAt: daysAgo(3),
    },
    {
        id: "cmp_dept_4",
        departmentId: "dept-water-sanitation",
        citizenId: "usr_seed_citizen1",
        title: "Residential pipe burst",
        category: "WATER",
        status: "CLOSED",
        createdAt: daysAgo(15),
    },
];
const departments = (0, repository_1.collection)("departments");
// Shared with the complaints module — department stats reflect real complaints.
const complaints = (0, repository_1.collection)("complaints");
// Live eligibility: every active user with staff access is assignable.
const users = (0, repository_1.collection)("users");
exports.departmentRepository = {
    departments,
    complaints,
    get officerPool() {
        return users
            .all()
            .filter((u) => u.isActive !== false &&
            (u.role === common_1.UserRole.OFFICER || u.role === common_1.UserRole.DEPARTMENT_HEAD))
            .map((u) => ({
            userId: u.id,
            fullName: u.fullName,
            email: u.email,
            role: u.role,
        }));
    },
    findByCode(code) {
        return departments.all().find((d) => d.code.toLowerCase() === code.toLowerCase());
    },
    findByName(name) {
        return departments.all().find((d) => d.name.toLowerCase() === name.toLowerCase());
    },
};
exports.default = exports.departmentRepository;
//# sourceMappingURL=index.js.map