import { collection } from "../../../core/database/repository";
import { UserRole } from "@smartcity/common";
import bcrypt from "bcryptjs";
import type { PublicUser } from "../dto";

export interface UserRecord {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  phoneNumber?: string | null;
  role: UserRole;
  departmentId?: string | null;
  avatar?: string | null;
  isEmailVerified: boolean;
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

const now = new Date();
const hashOf = (secret: string) => bcrypt.hashSync(secret, 10);

/**
 * Test fixtures only. The live "users" collection is never seeded at boot —
 * it hydrates from MongoDB. Tests reuse these via `seed()`/`reset()`.
 */
export const seedUserRecords: UserRecord[] = [
  {
    id: "usr_seed_admin",
    fullName: "System Admin",
    email: "superadmin@smartcity.gov",
    passwordHash: hashOf("Admin@1234"),
    role: UserRole.SUPER_ADMIN,
    isEmailVerified: true,
    isActive: true,
    lastLoginAt: new Date(now.getTime() - 60_000).toISOString(),
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
    id: "usr_seed_citizen1",
    fullName: "Sarah Jenkins",
    email: "citizen@smartcity.gov",
    passwordHash: hashOf("Citizen@1234"),
    role: UserRole.CITIZEN,
    phoneNumber: "+1 555-0100",
    isEmailVerified: true,
    isActive: true,
    lastLoginAt: new Date(now.getTime() - 3 * 86_400_000).toISOString(),
    createdAt: new Date(now.getTime() - 30 * 86_400_000).toISOString(),
    updatedAt: now.toISOString(),
  },
  {
    id: "usr_seed_citizen2",
    fullName: "James Carter",
    email: "james@example.com",
    passwordHash: hashOf("Citizen@1234"),
    role: UserRole.CITIZEN,
    phoneNumber: "+1 555-0121",
    isEmailVerified: true,
    isActive: true,
    createdAt: new Date(now.getTime() - 10 * 86_400_000).toISOString(),
    updatedAt: now.toISOString(),
  },
];

// Shared with auth (login) and citizens modules via the "users" collection.
const users = collection<UserRecord>("users");

export const userRepository = {
  users,

  findByEmail(email: string): UserRecord | undefined {
    return users.all().find((u) => u.email.toLowerCase() === email.toLowerCase());
  },

  toPublic(user: UserRecord): PublicUser {
    const { passwordHash: _ph, ...rest } = user;
    return rest as PublicUser;
  },
};

export default userRepository;