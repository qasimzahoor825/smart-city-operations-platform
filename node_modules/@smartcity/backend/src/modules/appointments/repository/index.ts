import { collection } from "../../../core/database/repository";
import { AppointmentStatus } from "@prisma/client";

export interface StoredAppointment {
  id: string;
  title: string;
  description: string | null;
  scheduledAt: string;
  status: AppointmentStatus;
  citizenId: string;
  citizenName: string;
  departmentId?: string | null;
  departmentName?: string | null;
  durationMinutes: number;
  createdAt: string;
  updatedAt: string;
}

const nowMs = Date.now();
const daysAgo = (d: number): string => new Date(nowMs - d * 86_400_000).toISOString();
const daysFrom = (d: number): string => new Date(nowMs + d * 86_400_000).toISOString();

const seedAppointments: StoredAppointment[] = [
  {
    id: "apt_seed_001",
    title: "Property tax consultation",
    description: "Discuss property tax reassessment with Public Works",
    scheduledAt: daysFrom(2),
    status: AppointmentStatus.PENDING,
    citizenId: "usr_seed_citizen1",
    citizenName: "Sarah Jenkins",
    departmentId: "dept-public-works",
    departmentName: "Public Works",
    durationMinutes: 30,
    createdAt: daysAgo(3),
    updatedAt: daysAgo(3),
  },
  {
    id: "apt_seed_002",
    title: "Community utility billing review",
    description: "Review monthly utility bill billing history.",
    scheduledAt: daysFrom(1),
    status: AppointmentStatus.CONFIRMED,
    citizenId: "usr_seed_citizen1",
    citizenName: "Sarah Jenkins",
    departmentId: "dept-public-works",
    departmentName: "Public Works",
    durationMinutes: 30,
    createdAt: daysAgo(2),
    updatedAt: daysAgo(1),
  },
  {
    id: "apt_seed_003",
    title: "Property inspection follow-up",
    description: "Follow-up on the pending property inspection.",
    scheduledAt: daysFrom(5),
    status: AppointmentStatus.PENDING,
    citizenId: "usr_seed_citizen2",
    citizenName: "James Carter",
    departmentId: "dept-public-works",
    departmentName: "Public Works",
    durationMinutes: 45,
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  },
  {
    id: "apt_seed_004",
    title: "Road maintenance consultation",
    description: "Discuss scheduled road maintenance on Elm Street.",
    scheduledAt: daysAgo(4),
    status: AppointmentStatus.COMPLETED,
    citizenId: "usr_seed_citizen1",
    citizenName: "Sarah Jenkins",
    departmentId: "dept-public-works",
    departmentName: "Public Works",
    durationMinutes: 30,
    createdAt: daysAgo(9),
    updatedAt: daysAgo(4),
  },
];

export const appointmentRepository = {
  appointments: collection<StoredAppointment>("appointments"),

  reset(): void {
    this.appointments.seed(seedAppointments);
  },
};

export default appointmentRepository;