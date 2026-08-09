import { TicketPriority, TicketStatus } from "@prisma/client";
import { UserRole } from "@smartcity/common";

export interface ComplaintAiSuggestion {
  category?: string | null;
  priority?: string | null;
  departmentId?: string | null;
  departmentName?: string | null;
  summary?: string | null;
  source?: string | null;
}

export interface CreateComplaintDto {
  title: string;
  description: string;
  category: string;
  priority?: TicketPriority;
  latitude?: number | null;
  longitude?: number | null;
  address?: string;
  imageUrls?: string[];
  departmentId?: string;
  autoReceived?: boolean;
  ai?: ComplaintAiSuggestion | null;
}

export interface UpdateComplaintDto {
  title?: string;
  description?: string;
  category?: string;
  priority?: TicketPriority;
  address?: string;
  imageUrls?: string[];
  latitude?: number | null;
  longitude?: number | null;
  departmentId?: string;
}

export interface FeedbackDto {
  rating: number;
  comment?: string;
}

export interface AssignComplaintDto {
  officerId: string;
  departmentId?: string;
}

export interface ComplaintStatusDto {
  status: TicketStatus;
  note?: string;
}

export interface CommentDto {
  body: string;
}

export interface ComplaintQuery {
  page?: number;
  limit?: number;
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: string;
  search?: string;
  citizenId?: string;
  departmentId?: string;
  assignedToId?: string;
}

export interface ComplaintStats {
  total: number;
  open: number;
  resolved: number;
  overdue: number;
  byStatus: Record<TicketStatus, number>;
  byPriority: Record<TicketPriority, number>;
  byCategory: Record<string, number>;
}

/** Authenticated caller captured from the JWT, passed into service methods. */
export interface Actor {
  id: string;
  email: string;
  role: UserRole;
  departmentId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
}