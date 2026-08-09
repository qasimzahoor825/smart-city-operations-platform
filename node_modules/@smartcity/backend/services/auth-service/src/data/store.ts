import { hashPassword } from "../utils/password";
import { UserRole } from "@smartcity/shared";
import { uid } from "@smartcity/common";

export interface StoredUser {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  phoneNumber?: string | null;
  role: UserRole;
  isActive: boolean;
  isEmailVerified: boolean;
  departmentId?: string | null;
  avatar?: string | null;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StoredSession {
  id: string;
  userId: string;
  token: string;
  userAgent?: string;
  ip?: string;
  rememberMe: boolean;
  expiresAt: string;
  revoked: boolean;
  createdAt: string;
}

export interface StoredReset {
  token: string;
  userId: string;
  expiresAt: string;
  used: boolean;
}

const DEPARTMENTS: Record<string, string> = {
  PUBLIC_WORKS: "isPublicWorks",
  WATER: "water",
  ELECTRICITY: "electricity",
};

/** In-memory store with realistic seed data. Swappable for Prisma later. */
class Store {
  users: StoredUser[] = [];
  sessions: StoredSession[] = [];
  resets: StoredReset[] = [];

  async seed(): Promise<void> {
    if (this.users.length > 0) return;
    const now = new Date().toISOString();
    const mk = async (
      fullName: string,
      email: string,
      password: string,
      role: UserRole,
      departmentId?: string | null,
    ): Promise<StoredUser> => {
      const passwordHash = await hashPassword(password);
      return {
        id: uid("usr"),
        fullName,
        email,
        passwordHash,
        phoneNumber: null,
        role,
        isActive: true,
        isEmailVerified: true,
        departmentId: departmentId ?? null,
        avatar: null,
        lastLoginAt: null,
        createdAt: now,
        updatedAt: now,
      };
    };

    this.users.push(
      await mk("System Super Admin", "superadmin@smartcity.gov", "Admin@1234", UserRole.SUPER_ADMIN),
      await mk(
        "Public Works Head",
        "head@publicworks.gov",
        "Officer@1234",
        UserRole.DEPARTMENT_HEAD,
        DEPARTMENTS.PUBLIC_WORKS,
      ),
      await mk(
        "Maya Officer",
        "officer@publicworks.gov",
        "Officer@1234",
        UserRole.OFFICER,
        DEPARTMENTS.PUBLIC_WORKS,
      ),
      await mk("Resident Sarah",
        "citizen@smartcity.gov",
        "Citizen@1234",
        UserRole.CITIZEN),
    );
  }

  findByEmail(email: string): StoredUser | undefined {
    const normalized = email.trim().toLowerCase();
    return this.users.find((u) => u.email.toLowerCase() === normalized);
  }

  findById(id: string): StoredUser | undefined {
    return this.users.find((u) => u.id === id);
  }

  toPublic(user: StoredUser) {
    const { passwordHash: _pw, ...rest } = user;
    return rest;
  }
}

export const store = new Store();