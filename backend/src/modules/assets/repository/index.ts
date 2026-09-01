import { collection } from "../../../core/database/repository";
import { AssetCategory, AssetStatus } from "@prisma/client";

export interface StoredAsset {
  id: string;
  name: string;
  category: AssetCategory;
  status: AssetStatus;
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  imageUrl?: string | null;
  department: string;
  lastInspectionAt: string | null;
  nextInspectionAt: string | null;
  maintainedBy?: string | null;
  lastStatusNote?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StoredAssetInspection {
  id: string;
  assetId: string;
  inspectorId?: string | null;
  status: string;
  findings: string;
  inspectedBy: string;
  createdAt: string;
}

const nowMs = Date.now();
const daysAgo = (d: number): string => new Date(nowMs - d * 86_400_000).toISOString();
const daysFrom = (d: number): string => new Date(nowMs + d * 86_400_000).toISOString();

const seedAssets: StoredAsset[] = [
  {
    id: "ast_seed_001",
    name: "Main Street Bridge",
    category: AssetCategory.ROAD,
    status: AssetStatus.OPERATIONAL,
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
    category: AssetCategory.WATER,
    status: AssetStatus.UNDER_MAINTENANCE,
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
    category: AssetCategory.ELECTRICITY,
    status: AssetStatus.OPERATIONAL,
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
    category: AssetCategory.STREET_LIGHT,
    status: AssetStatus.OUT_OF_SERVICE,
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
    category: AssetCategory.BUILDING,
    status: AssetStatus.OPERATIONAL,
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
  {
    id: "ast_seed_006",
    name: "Gulberg Water Treatment Plant",
    category: AssetCategory.WATER,
    status: AssetStatus.OPERATIONAL,
    latitude: 31.5234,
    longitude: 74.3612,
    address: "Gulberg III, Water Treatment Facility",
    imageUrl: null,
    department: "dept-water",
    lastInspectionAt: daysAgo(8),
    nextInspectionAt: daysFrom(50),
    maintainedBy: "Water Works Dept",
    lastStatusNote: null,
    createdBy: "usr_seed_officer2",
    updatedBy: "usr_seed_officer2",
    createdAt: daysAgo(300),
    updatedAt: daysAgo(8),
  },
  {
    id: "ast_seed_007",
    name: "Model Town Grid Substation",
    category: AssetCategory.ELECTRICITY,
    status: AssetStatus.OPERATIONAL,
    latitude: 31.4888,
    longitude: 74.3267,
    address: "Model Town Grid Station",
    imageUrl: null,
    department: "dept-electricity",
    lastInspectionAt: daysAgo(20),
    nextInspectionAt: daysFrom(70),
    maintainedBy: "Grid Operations",
    lastStatusNote: "Load balancing upgrade complete",
    createdBy: "usr_seed_officer2",
    updatedBy: "usr_seed_officer2",
    createdAt: daysAgo(260),
    updatedAt: daysAgo(20),
  },
  {
    id: "ast_seed_008",
    name: "Canal Road Drainage System",
    category: AssetCategory.ROAD,
    status: AssetStatus.MAINTENANCE,
    latitude: 31.5541,
    longitude: 74.3692,
    address: "Canal Road drainage network",
    imageUrl: null,
    department: "dept-water-sanitation",
    lastInspectionAt: daysAgo(15),
    nextInspectionAt: daysFrom(15),
    maintainedBy: "Sanitation Crew B",
    lastStatusNote: "Two drains reported blocked",
    createdBy: "usr_seed_officer2",
    updatedBy: "usr_seed_officer1",
    createdAt: daysAgo(180),
    updatedAt: daysAgo(15),
  },
  {
    id: "ast_seed_009",
    name: "Model Town Community Clinic",
    category: AssetCategory.BUILDING,
    status: AssetStatus.OPERATIONAL,
    latitude: 31.5001,
    longitude: 74.3422,
    address: "Block A, Model Town Health Complex",
    imageUrl: null,
    department: "dept-health",
    lastInspectionAt: daysAgo(25),
    nextInspectionAt: daysFrom(120),
    maintainedBy: "Facilities Management",
    lastStatusNote: null,
    createdBy: "usr_seed_officer1",
    updatedBy: "usr_seed_officer1",
    createdAt: daysAgo(220),
    updatedAt: daysAgo(25),
  },
];

const seedInspections: StoredAssetInspection[] = [
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

export const assetRepository = {
  assets: collection<StoredAsset>("assets"),

  inspections: collection<StoredAssetInspection>("asset_inspections"),
  reset(): void {
    this.assets.seed(seedAssets);
    this.inspections.seed(seedInspections);
  },
};

export default assetRepository;