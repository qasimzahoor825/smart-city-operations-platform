import { collection } from "../../../core/database/repository";
import { UserRole } from "@smartcity/common";
import type { CitizenProfile } from "../dto";

export interface CitizenRecord {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string | null;
  avatar?: string | null;
  role?: UserRole;
  ward?: string | null;
  district?: string | null;
  isEmailVerified: boolean;
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SeedComplaint {
  id: string;
  citizenId: string;
  title: string;
  category: string;
  status: "SUBMITTED" | "ASSIGNED" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" | "REJECTED";
  createdAt: string;
}

const now = new Date();
const daysAgo = (d: number) => new Date(now.getTime() - d * 86_400_000).toISOString();

/**
 * Test fixtures only. The live stores hydrate from MongoDB on boot.
 */
export const seedCitizenRecords: CitizenRecord[] = [
  {
    id: "usr_seed_citizen1",
    fullName: "Sarah Jenkins",
    email: "citizen@smartcity.gov",
    phoneNumber: "+1 555-0100",
    ward: "Downtown",
    district: "Central",
    isEmailVerified: true,
    isActive: true,
    lastLoginAt: daysAgo(3),
    createdAt: daysAgo(30),
    updatedAt: daysAgo(5),
  },
  {
    id: "usr_seed_citizen2",
    fullName: "James Carter",
    email: "james@example.com",
    phoneNumber: "+1 555-0121",
    ward: "Riverside",
    district: "East",
    isEmailVerified: true,
    isActive: true,
    createdAt: daysAgo(10),
    updatedAt: daysAgo(10),
  },
  {
    id: "usr_seed_citizen3",
    fullName: "Priya Sharma",
    email: "priya@example.com",
    phoneNumber: "+1 555-0188",
    ward: "Old Town",
    district: "West",
    isEmailVerified: false,
    isActive: true,
    createdAt: daysAgo(6),
    updatedAt: daysAgo(6),
  },
];

export const seedCitizenComplaints: SeedComplaint[] = [
  {
    id: "cmp_seed_1",
    citizenId: "usr_seed_citizen1",
    title: "Pothole on Market Street",
    category: "ROAD",
    status: "RESOLVED",
    createdAt: daysAgo(28),
  },
  {
    id: "cmp_seed_2",
    citizenId: "usr_seed_citizen1",
    title: "Street light outage downtown",
    category: "STREET_LIGHT",
    status: "IN_PROGRESS",
    createdAt: daysAgo(9),
  },
  {
    id: "cmp_seed_3",
    citizenId: "usr_seed_citizen2",
    title: "Garbage collection missed",
    category: "GARBAGE",
    status: "SUBMITTED",
    createdAt: daysAgo(2),
  },
  {
    id: "cmp_seed_4",
    citizenId: "usr_seed_citizen1",
    title: "Public tap water leak",
    category: "WATER",
    status: "CLOSED",
    createdAt: daysAgo(18),
  },
];
// The citizen directory is backed by real users (role CITIZEN) and real
// complaints — the same MongoDB collections used by the auth/users and
// complaints modules.
const citizens = collection<CitizenRecord>("users");

const complaints = collection<SeedComplaint>("complaints");

export const citizenRepository = {
  citizens,
  complaints,

  findByEmail(email: string): CitizenRecord | undefined {
    return citizens.all().find((c) => c.email.toLowerCase() === email.toLowerCase());
  },

  toProfile(citizen: CitizenRecord): CitizenProfile {
    return {
      id: citizen.id,
      fullName: citizen.fullName,
      email: citizen.email,
      phoneNumber: citizen.phoneNumber ?? null,
      avatar: citizen.avatar ?? null,
      ward: citizen.ward ?? null,
      district: citizen.district ?? null,
      isEmailVerified: citizen.isEmailVerified,
      isActive: citizen.isActive,
      lastLoginAt: citizen.lastLoginAt ?? null,
      createdAt: citizen.createdAt,
      updatedAt: citizen.updatedAt,
    };
  },
};

export default citizenRepository;