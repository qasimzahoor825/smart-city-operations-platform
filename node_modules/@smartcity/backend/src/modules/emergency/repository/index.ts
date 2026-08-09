import { collection } from "../../../core/database/repository";
import { EmergencyStatus, EmergencyType, TicketPriority } from "@prisma/client";

export interface StoredEmergency {
  id: string;
  ref: string;
  type: EmergencyType;
  title: string;
  description: string;
  severity: TicketPriority;
  status: EmergencyStatus;
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  reportedById?: string | null;
  reportedByName?: string | null;
  dispatchedUnit?: string | null;
  timeline: string[];
  createdAt: string;
  updatedAt: string;
}

const nowMs = Date.now();
const hoursAgo = (h: number): string => new Date(nowMs - h * 3_600_000).toISOString();
const daysAgo = (d: number): string => new Date(nowMs - d * 86_400_000).toISOString();

const seedEmergencies: StoredEmergency[] = [
  {
    id: "emg_seed_001",
    ref: "EMG-24-FIRE-01",
    type: EmergencyType.FIRE,
    title: "Warehouse fire on Industrial Road",
    description: "Structural fire reported at the corner warehouse, moderate smoke visible.",
    severity: TicketPriority.CRITICAL,
    status: EmergencyStatus.DISPATCHED,
    latitude: 31.5451,
    longitude: 74.3321,
    address: "18 Industrial Road",
    reportedById: "usr_seed_citizen1",
    reportedByName: "Sarah Jenkins",
    dispatchedUnit: "Engine 4",
    timeline: [
      "Reported by resident",
      "Dispatched Engine 4 to scene",
      "Crews arrived on Market Road",
    ],
    createdAt: hoursAgo(3),
    updatedAt: hoursAgo(2),
  },
  {
    id: "emg_seed_002",
    ref: "EMG-24-FLOOD-02",
    type: EmergencyType.FLOOD,
    title: "Flash flooding along Garden Avenue",
    description: "Heavy rains caused localized flooding in the residential corridor.",
    severity: TicketPriority.HIGH,
    status: EmergencyStatus.ON_SCENE,
    latitude: 31.5598,
    longitude: 74.3522,
    address: "Garden Avenue",
    reportedById: "usr_seed_citizen2",
    reportedByName: "James Carter",
    dispatchedUnit: "Swift Water Unit 2",
    timeline: [
      "Reported by James Carter",
      "Dispatch confirmed - Swift Water Unit 2",
      "Unit on scene, pumps deployed",
    ],
    createdAt: hoursAgo(6),
    updatedAt: hoursAgo(1),
  },
  {
    id: "emg_seed_003",
    ref: "EMG-24-MED-03",
    type: EmergencyType.MEDICAL,
    title: "Medical emergency at Central Park",
    description: "Unresponsive individual near the east entrance of Central Park.",
    severity: TicketPriority.MEDIUM,
    status: EmergencyStatus.REPORTED,
    latitude: 31.5204,
    longitude: 74.3587,
    address: "Central Park, east entrance",
    reportedById: "usr_seed_citizen1",
    reportedByName: "Sarah Jenkins",
    dispatchedUnit: null,
    timeline: [
      "Reported by Sarah Jenkins",
      "Waiting for dispatcher assignment",
    ],
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  },
];

export const emergencyRepository = {
  emergencies: collection<StoredEmergency>("emergencies"),

  // Test fixtures — used by `reset()` in the test runner only, never on boot.
  reset(): void {
    this.emergencies.seed(seedEmergencies);
  },
};

export default emergencyRepository;