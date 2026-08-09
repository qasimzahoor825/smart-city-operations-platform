import { collection } from "../../../core/database/repository";
import type { MarkerType, CityLayer } from "../dto";

export interface StoredGisMarker {
  id: string;
  type: MarkerType;
  title: string;
  latitude: number;
  longitude: number;
  status?: string | null;
  severity?: string | null;
  address?: string | null;
  sourceId?: string | null;
  createdAt: string;
  updatedAt: string;
}

const nowMs = Date.now();
const hoursAgo = (h: number): string => new Date(nowMs - h * 3_600_000).toISOString();
const daysAgo = (d: number): string => new Date(nowMs - d * 86_400_000).toISOString();

export const seedLayers: CityLayer[] = [
  {
    id: "layer-traffic",
    name: "Traffic",
    visible: true,
    color: "#3b82f6",
    description: "Real-time traffic flow and congestion zones.",
  },
  {
    id: "layer-water",
    name: "Water",
    visible: true,
    color: "#22c55e",
    description: "Water supply network and pressure zones.",
  },
  {
    id: "layer-zoning",
    name: "Zoning",
    visible: false,
    color: "#a855f7",
    description: "Land use and zoning districts.",
  },
];

const seedMarkers: StoredGisMarker[] = [
  {
    id: "gmk_seed_001",
    type: "hospital",
    title: "City Central Hospital",
    latitude: 31.5204,
    longitude: 74.3587,
    status: "OPEN",
    address: "1 Hospital Road",
    sourceId: "hos_seed_1",
    createdAt: daysAgo(60),
    updatedAt: daysAgo(10),
  },
  {
    id: "gmk_seed_002",
    type: "police",
    title: "Central Police Station",
    latitude: 31.5497,
    longitude: 74.3436,
    status: "OPEN",
    address: "12 Law & Order Road",
    sourceId: "pol_seed_1",
    createdAt: daysAgo(55),
    updatedAt: daysAgo(8),
  },
  {
    id: "gmk_seed_003",
    type: "asset",
    title: "Streetlight Maint Depot",
    latitude: 31.5598,
    longitude: 74.3522,
    status: "OPERATIONAL",
    address: "9 Depot Avenue",
    sourceId: "ast_seed_1",
    createdAt: daysAgo(40),
    updatedAt: daysAgo(5),
  },
  {
    id: "gmk_seed_004",
    type: "complaint",
    title: "Streetlight out on Main Street",
    latitude: 31.5497,
    longitude: 74.3436,
    status: "IN_PROGRESS",
    address: "Main St & 5th Ave",
    sourceId: "cmp_seed_001",
    createdAt: daysAgo(3),
    updatedAt: hoursAgo(6),
  },
  {
    id: "gmk_seed_005",
    type: "emergency",
    title: "Warehouse fire on Market Road",
    latitude: 31.5451,
    longitude: 74.3321,
    status: "DISPATCHED",
    severity: "CRITICAL",
    address: "182 Industrial Road",
    sourceId: "emg_seed_001",
    createdAt: hoursAgo(3),
    updatedAt: hoursAgo(2),
  },
];

export const gisRepository = {
  layers: collection<CityLayer>("gis_layers"),

  markers: collection<StoredGisMarker>("gis_markers"),
  reset(): void {
    this.layers.seed(seedLayers);
    this.markers.seed(seedMarkers);
  },
};

export default gisRepository;