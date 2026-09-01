import { collection } from "../../../core/database/repository";
import { AppointmentStatus, EmergencyStatus, EmergencyType } from "@prisma/client";

export interface StoredEmergency {
  id: string;
  type: EmergencyType;
  title: string;
  status: EmergencyStatus;
  departmentId: string | null;
  createdAt: string;
  resolvedAt: string | null;
}

export interface StoredAppointment {
  id: string;
  title: string;
  status: AppointmentStatus;
  departmentId: string;
  citizenId: string;
  scheduledAt: string;
  createdAt: string;
}

const nowMs = Date.now();
const hoursAgo = (h: number): string => new Date(nowMs - h * 3_600_000).toISOString();
const daysAgo = (d: number): string => new Date(nowMs - d * 86_400_000).toISOString();
const daysFrom = (d: number): string => new Date(nowMs + d * 86_400_000).toISOString();

const seedEmergencies: StoredEmergency[] = [
  {
    id: "emg_seed_001",
    type: EmergencyType.PUBLIC_ALERT,
    title: "Smoke reported near industrial zone",
    status: EmergencyStatus.RESOLVED,
    departmentId: "dept-public-works",
    createdAt: daysAgo(4),
    resolvedAt: daysAgo(3),
  },
  {
    id: "emg_seed_002",
    type: EmergencyType.FLOOD,
    title: "Water leak flooding sidewalk",
    status: EmergencyStatus.DISPATCHED,
    departmentId: "dept-water-sanitation",
    createdAt: hoursAgo(2),
    resolvedAt: null,
  },
  {
    id: "emg_seed_003",
    type: EmergencyType.MEDICAL,
    title: "Medical assistance at City Market",
    status: EmergencyStatus.RESOLVED,
    departmentId: null,
    createdAt: daysAgo(7),
    resolvedAt: daysAgo(7),
  },
  {
    id: "emg_seed_004",
    type: EmergencyType.FIRE,
    title: "Small fire near transformer yard",
    status: EmergencyStatus.ON_SCENE,
    departmentId: "dept-public-works",
    createdAt: daysAgo(1),
    resolvedAt: null,
  },
];

const seedAppointments: StoredAppointment[] = [
  {
    id: "app_seed_001",
    title: "Property tax review",
    status: AppointmentStatus.CONFIRMED,
    departmentId: "dept-public-works",
    citizenId: "usr_seed_citizen1",
    scheduledAt: daysFrom(2),
    createdAt: daysAgo(3),
  },
  {
    id: "app_seed_002",
    title: "Building permit consultation",
    status: AppointmentStatus.PENDING,
    departmentId: "dept-public-works",
    citizenId: "usr_seed_citizen2",
    scheduledAt: daysFrom(5),
    createdAt: daysAgo(1),
  },
  {
    id: "app_seed_003",
    title: "Water meter inspection",
    status: AppointmentStatus.COMPLETED,
    departmentId: "dept-water-sanitation",
    citizenId: "usr_seed_citizen1",
    scheduledAt: daysAgo(6),
    createdAt: daysAgo(9),
  },
  {
    id: "app_seed_004",
    title: "Sanitation appeal hearing",
    status: AppointmentStatus.CANCELLED,
    departmentId: "dept-health",
    citizenId: "usr_seed_citizen2",
    scheduledAt: daysAgo(2),
    createdAt: daysAgo(8),
  },
];

// Aliased to the emergency/appointments singletons so reports reflect the
// live dataset instead of a separate copy.
export const reportRepository = {
  emergencies: collection<StoredEmergency>("emergencies"),

  appointments: collection<StoredAppointment>("appointments"),
  reset(): void {
    this.emergencies.seed(seedEmergencies);
    this.appointments.seed(seedAppointments);
  },
};

export default reportRepository;