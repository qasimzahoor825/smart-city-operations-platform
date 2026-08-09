import { UserRole } from "@smartcity/common";
import type { Pagination } from "@smartcity/common";

export interface PublicUser {
  id: string;
  fullName: string;
  email: string;
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

export interface UpdateUserDto {
  fullName?: string;
  email?: string;
  phoneNumber?: string | null;
  role?: UserRole;
  departmentId?: string | null;
  avatar?: string | null;
  isEmailVerified?: boolean;
}

export interface CreateUserDto {
  fullName: string;
  email: string;
  password?: string;
  phoneNumber?: string | null;
  role: UserRole;
  departmentId?: string | null;
  isEmailVerified?: boolean;
  active?: boolean;
}

export interface ListUsersOptions {
  page?: number;
  limit?: number;
  role?: UserRole;
  search?: string;
  departmentId?: string;
}

export interface PaginatedUsers {
  items: PublicUser[];
  pagination: Pagination;
}