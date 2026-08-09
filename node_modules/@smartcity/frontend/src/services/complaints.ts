import api from "@/services/api-client";
import type { ApiResponse, Complaint, PaginatedResponse } from "@/types";

interface Paged<T> extends ApiResponse<T[]> {
  pagination?: { page: number; limit: number; total: number; totalPages: number };
}

export interface CreateComplaintPayload {
  title: string;
  description: string;
  category: string;
  priority?: string;
  latitude?: number | null;
  longitude?: number | null;
  address?: string;
  imageUrls?: string[];
}

export interface ComplaintQuery {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  category?: string;
  search?: string;
  citizenId?: string;
}

export interface ComplaintStats {
  total: number;
  open: number;
  resolved: number;
  overdue: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  byCategory: Record<string, number>;
}

export const complaintsApi = {
  async list(query: ComplaintQuery = {}): Promise<PaginatedResponse<Complaint>> {
    const { data } = await api.get<Paged<Complaint>>("/complaints", { params: query });
    const pagination = data.pagination;
    const rows = data.data ?? [];
    return {
      data: rows,
      page: pagination?.page ?? 1,
      limit: pagination?.limit ?? 20,
      total: pagination?.total ?? rows.length,
      totalPages: pagination?.totalPages ?? 1,
    };
  },

  async get(id: string): Promise<Complaint> {
    const { data } = await api.get<ApiResponse<Complaint>>(`/complaints/${id}`);
    return data.data as Complaint;
  },

  async create(payload: CreateComplaintPayload): Promise<Complaint> {
    const { data } = await api.post<ApiResponse<Complaint>>("/complaints", payload);
    return data.data as Complaint;
  },

  async update(id: string, payload: Partial<CreateComplaintPayload>): Promise<Complaint> {
    const { data } = await api.patch<ApiResponse<Complaint>>(`/complaints/${id}`, payload);
    return data.data as Complaint;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/complaints/${id}`);
  },

  async assign(id: string, payload: { officerId?: string; departmentId?: string; departmentName?: string }): Promise<Complaint> {
    const { data } = await api.post<ApiResponse<Complaint>>(`/complaints/${id}/assign`, payload);
    return data.data as Complaint;
  },

  async updateStatus(id: string, status: string, note?: string): Promise<Complaint> {
    const { data } = await api.post<ApiResponse<Complaint>>(`/complaints/${id}/status`, { status, note });
    return data.data as Complaint;
  },

  async addComment(id: string, body: string): Promise<Complaint> {
    const { data } = await api.post<ApiResponse<Complaint>>(`/complaints/${id}/comments`, { body });
    return data.data as Complaint;
  },

  async stats(): Promise<ComplaintStats> {
    const { data } = await api.get<ApiResponse<ComplaintStats>>("/complaints/stats");
    return data.data as ComplaintStats;
  },
};