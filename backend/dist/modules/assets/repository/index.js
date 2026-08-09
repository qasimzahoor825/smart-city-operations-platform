"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assetRepository = void 0;
const repository_1 = require("../../../core/database/repository");
const client_1 = require("@prisma/client");
const nowMs = Date.now();
const daysAgo = (d) => new Date(nowMs - d * 86_400_000).toISOString();
const daysFrom = (d) => new Date(nowMs + d * 86_400_000).toISOString();
const seedAssets = [
    {
        id: "ast_seed_001",
        name: "Main Street Bridge",
        category: client_1.AssetCategory.ROAD,
        status: client_1.AssetStatus.OPERATIONAL,
        latitude: 31.5525,
        longitude: 74.3498,
        address: "Main Street over Railway Line",
        imageUrl: null,
        department: "dept-public-works",
        lastInspectionAt: daysAgo(30),
        nextInspectionAt: daysFrom(60),
        maintainedBy: "Streetworks Crew A",
        lastStatusNote: null,
        createdBy: "usr_seed_officer1",
        updatedBy: "usr_seed_officer1",
        createdAt: daysAgo(120),
        updatedAt: daysAgo(30),
    },
    {
        id: "ast_seed_002",
        name: "Central Water Pump Station",
        category: client_1.AssetCategory.WATER,
        status: client_1.AssetStatus.UNDER_MAINTENANCE,
        latitude: 31.5601,
        longitude: 74.3399,
        address: "14 Industrial Zone",
        imageUrl: null,
        department: "dept-water",
        lastInspectionAt: daysAgo(10),
        nextInspectionAt: daysFrom(80),
        maintainedBy: "Water Works Dept",
        lastStatusNote: "Bearing replacement in progress",
        createdBy: "usr_seed_officer1",
        updatedBy: "usr_seed_officer1",
        createdAt: daysAgo(200),
        updatedAt: daysAgo(2),
    },
    {
        id: "ast_seed_003",
        name: "Substation 7 Transformer",
        category: client_1.AssetCategory.ELECTRICITY,
        status: client_1.AssetStatus.OPERATIONAL,
        address: "33kV Grid Line",
        imageUrl: null,
        department: "dept-electricity",
        lastInspectionAt: daysAgo(45),
        nextInspectionAt: daysFrom(45),
        maintainedBy: null,
        lastStatusNote: null,
        createdBy: "usr_seed_officer1",
        updatedBy: "usr_seed_officer1",
        createdAt: daysAgo(90),
        updatedAt: daysAgo(45),
    },
    {
        id: "ast_seed_004",
        name: "Riverside Park Lighting",
        category: client_1.AssetCategory.STREET_LIGHT,
        status: client_1.AssetStatus.OUT_OF_SERVICE,
        address: "Riverside Park walkways",
        imageUrl: null,
        department: "dept-public-works",
        lastInspectionAt: daysAgo(60),
        nextInspectionAt: daysFrom(30),
        maintainedBy: "Lighting Crew",
        lastStatusNote: "Vandalised controllers awaiting parts",
        createdBy: "usr_seed_officer1",
        updatedBy: "usr_seed_officer1",
        createdAt: daysAgo(150),
        updatedAt: daysAgo(12),
    },
    {
        id: "ast_seed_005",
        name: "City Hall Annex Building",
        category: client_1.AssetCategory.BUILDING,
        status: client_1.AssetStatus.OPERATIONAL,
        address: "Civic Centre, 1 Grand Avenue",
        imageUrl: null,
        department: "dept-public-works",
        lastInspectionAt: daysAgo(90),
        nextInspectionAt: daysFrom(5),
        maintainedBy: "Facilities Management",
        lastStatusNote: null,
        createdBy: "usr_seed_officer1",
        updatedBy: "usr_seed_officer1",
        createdAt: daysAgo(400),
        updatedAt: daysAgo(90),
    },
];
const seedInspections = [
    {
        id: "ain_seed_001",
        assetId: "ast_seed_001",
        inspectorId: "usr_seed_officer1",
        status: "PASSED",
        findings: "Structure sound, minor surface cracks noted.",
        inspectedBy: "Bilal Ahmed",
        createdAt: daysAgo(30),
    },
    {
        id: "ain_seed_002",
        assetId: "ast_seed_002",
        inspectorId: "usr_seed_officer1",
        status: "NEEDS_ATTENTION",
        findings: "Pump bearing worn, recommend servicing.",
        inspectedBy: "Bilal Ahmed",
        createdAt: daysAgo(10),
    },
];
exports.assetRepository = {
    assets: (0, repository_1.collection)("assets"),
    inspections: (0, repository_1.collection)("asset_inspections"),
    reset() {
        this.assets.seed(seedAssets);
        this.inspections.seed(seedInspections);
    },
};
exports.default = exports.assetRepository;
//# sourceMappingURL=index.js.map