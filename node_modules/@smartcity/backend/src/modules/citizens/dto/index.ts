import type { Pagination } from "@smartcity/common";

export interface CitizenProfile {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string | null;
  avatar?: string | null;
  ward?: string | null;
  district?: string | null;
  isEmailVerified: boolean;
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateCitizenProfileDto {
  fullName?: string;
  phoneNumber?: string | null;
  avatar?: string | null;
  ward?: string | null;
  district?: string | null;
}

export interface CitizenStats {
  totalComplaints: number;
  openComplaints: number;
  inProgressComplaints: number;
  resolvedComplaints: number;
  joinedAt: string;
  lastActivityAt?: string | null;
  satisfactionScore: number;
}

export interface CitizensOverview {
  totalCitizens: number;
  verifiedCitizens: number;
  activeCitizens: number;
  totalComplaints: number;
  openComplaints: number;
  resolvedComplaints: number;
}

export interface ListCitizensOptions {
  page?: number;
  limit?: number;
  search?: string;
  ward?: string;
}

export interface PaginatedCitizens {
  items: CitizenProfile[];
  pagination: Pagination;
}