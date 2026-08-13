import { UserRole } from "@smartcity/common";
import type { Pagination } from "@smartcity/common";

export interface DepartmentMember {
  userId: string;
  fullName: string;
  email: string;
  role: UserRole;
  joinedAt: string;
}

export interface DepartmentDto {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  managerId?: string | null;
  members: DepartmentMember[];
  createdAt: string;
  updatedAt: string;
}

/** Public-safe department summary — no member/officer emails exposed. */
export interface PublicDepartmentDto {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  createdAt: string;
}

export interface DepartmentStats {
  departmentId: string;
  departmentName: string;
  departmentCode: string;
  officerCount: number;
  totalComplaints: number;
  openComplaints: number;
  inProgressComplaints: number;
  resolvedComplaints: number;
  citizenCount: number;
  updatedAt: string;
}

export interface CreateDepartmentDto {
  name: string;
  code: string;
  description?: string;
}

export interface UpdateDepartmentDto {
  name?: string;
  code?: string;
  description?: string | null;
  managerId?: string | null;
}

export interface AssignOfficersDto {
  officerIds: string[];
}

export interface ListDepartmentsOptions {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedDepartments {
  items: DepartmentDto[];
  pagination: Pagination;
}