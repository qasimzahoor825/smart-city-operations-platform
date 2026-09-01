import { collection } from "../../../core/database/repository";
import { UserRole } from "@smartcity/common";
import bcrypt from "bcryptjs";
import type { PublicUser } from "../dto";

export interface StoredUser {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  phoneNumber?: string | null;
  departmentId?: string | null;
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StoredSession {
  id: string;
  userId: string;
  refreshToken: string;
  userAgent?: string;
  ip?: string;
  expiresAt: string;
  createdAt: string;
}

export interface StoredPasswordReset {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: string;
  usedAt: string | null;
  createdAt: string;
}

export interface StoredEmailVerification {
  id: string;
  userId: string;
  email: string;
  otpHash: string;
  expiresAt: string;
  usedAt: string | null;
  createdAt: string;
}

/**
 * Test fixtures only. These are NEVER seeded into MongoDB — the repositories
 * start empty and hydate real records from the database on boot. Tests use
 * `seed()`/`reset()` against the in-memory cache.
 */
const now = new Date();
const hashOf = (s: string) => bcrypt.hashSync(s, 10);

export const seedUsers: StoredUser[] = [
  {
    id: "usr_seed_admin",
    fullName: "System Admin",
    email: "superadmin@smartcity.gov",
    passwordHash: hashOf("Admin@1234"),
    role: UserRole.SUPER_ADMIN,
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
    role: UserRole.DEPARTMENT_HEAD,
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
    role: UserRole.OFFICER,
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
    role: UserRole.OFFICER,
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
    role: UserRole.OFFICER,
    departmentId: "dept-health",
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
    role: UserRole.DEPARTMENT_HEAD,
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
    role: UserRole.OFFICER,
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
    role: UserRole.DEPARTMENT_HEAD,
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
    role: UserRole.DEPARTMENT_HEAD,
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
    role: UserRole.OFFICER,
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
    role: UserRole.DEPARTMENT_HEAD,
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
    role: UserRole.OFFICER,
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
    role: UserRole.DEPARTMENT_HEAD,
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
    role: UserRole.OFFICER,
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
    role: UserRole.DEPARTMENT_HEAD,
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
    role: UserRole.OFFICER,
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
    role: UserRole.CITIZEN,
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
    role: UserRole.CITIZEN,
    isEmailVerified: true,
    isActive: true,
    createdAt: new Date(now.getTime() - 10 * 86_400_000).toISOString(),
    updatedAt: now.toISOString(),
  },
];

// The user store is shared with the users/citizens modules via the same MongoDB
// "users" collection — one source of truth, no duplicated datasets.
const users = collection<StoredUser>("users");
const sessions = collection<StoredSession>("auth_sessions");
const passwordResets = collection<StoredPasswordReset>("password_resets");
const emailVerifications = collection<StoredEmailVerification>("email_verifications");

export const authRepository = {
  users,
  sessions,
  passwordResets,
  emailVerifications,

  findByEmail(email: string): StoredUser | undefined {
    return users.all().find((u) => u.email.toLowerCase() === email.toLowerCase());
  },
  toPublic(user: StoredUser): PublicUser {
    const { passwordHash: _ph, ...rest } = user;
    return rest as PublicUser;
  },
};

export default authRepository;