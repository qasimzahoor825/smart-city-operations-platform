import api from "@/services/api-client";
import type {
  ApiResponse,
  AppNotification,
  Department,
  Officer,
  Asset,
  Emergency,
  Appointment,
  PaginatedResponse,
} from "@/types";

export interface PermissionClaim {
  resource: string;
  action: "create" | "read" | "update" | "delete" | "assign" | "manage";
  scope: string;
}

export interface RoleInfo {
  role: string;
  name: string;
  description: string;
  permissions: string[];
  claims: PermissionClaim[];
}

interface Paged<T> extends ApiResponse<T[]> {
  pagination?: { page: number; limit: number; total: number; totalPages: number };
}

// ---------- Departments ----------
export const departmentsApi = {
  async list(): Promise<Department[]> {
    const { data } = await api.get<ApiResponse<Department[]>>("/departments");
    return data.data ?? [];
  },
  async create(payload: { name: string; code: string; description?: string }): Promise<Department> {
    const { data } = await api.post<ApiResponse<Department>>("/departments", payload);
    return data.data as Department;
  },
  async stats(id: string): Promise<unknown> {
    const { data } = await api.get<ApiResponse<unknown>>(`/departments/${id}/stats`);
    return data.data;
  },
};

// ---------- Roles / Permissions ----------
export const rolesApi = {
  async list(): Promise<RoleInfo[]> {
    const { data } = await api.get<ApiResponse<RoleInfo[]>>("/roles");
    return data.data ?? [];
  },
};

// ---------- Officers / Users ----------
export const usersApi = {
  async list(params: Record<string, unknown> = {}): Promise<PaginatedResponse<Officer>> {
    const { data } = await api.get<Paged<Officer>>("/users", { params });
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
  async toggleActive(id: string, active: boolean): Promise<Officer> {
    const { data } = await api.patch<ApiResponse<Officer>>(
      active ? `/users/${id}/activate` : `/users/${id}/deactivate`,
    );
    return data.data as Officer;
  },
  async provision(payload: { fullName: string; email: string; role: string; departmentId?: string; active?: boolean }): Promise<Officer> {
    const { data } = await api.post<ApiResponse<Officer>>("/users", payload);
    return data.data as Officer;
  },
};

export interface AssetStats {
  total: number;
  byStatus: { status: string; count: number }[];
  byCategory: { category: string; count: number }[];
}

// ---------- Assets ----------
export const assetsApi = {
  async list(params: Record<string, unknown> = {}): Promise<Asset[]> {
    const { data } = await api.get<ApiResponse<Asset[]>>("/assets", { params });
    return data.data ?? [];
  },
  async stats(): Promise<AssetStats> {
    const { data } = await api.get<ApiResponse<AssetStats>>("/assets/stats");
    return data.data as AssetStats;
  },
  async create(payload: Record<string, unknown>): Promise<Asset> {
    const { data } = await api.post<ApiResponse<Asset>>("/assets", payload);
    return data.data as Asset;
  },
  async updateStatus(id: string, status: string): Promise<Asset> {
    const { data } = await api.patch<ApiResponse<Asset>>(`/assets/${id}/status`, { status });
    return data.data as Asset;
  },
};

// ---------- Emergencies ----------
export const emergenciesApi = {
  async list(): Promise<Emergency[]> {
    const { data } = await api.get<ApiResponse<Emergency[]>>("/emergencies");
    return data.data ?? [];
  },
  async create(payload: Record<string, unknown>): Promise<Emergency> {
    const { data } = await api.post<ApiResponse<Emergency>>("/emergencies", payload);
    return data.data as Emergency;
  },
  async dispatch(id: string, payload: Record<string, unknown>): Promise<Emergency> {
    const { data } = await api.patch<ApiResponse<Emergency>>(`/emergencies/${id}/dispatch`, payload);
    return data.data as Emergency;
  },
  async stats(): Promise<{ status: string; count: number }[]> {
    const { data } = await api.get<ApiResponse<{ status: string; count: number }[]>>("/emergencies/stats");
    return data.data ?? [];
  },
};

// ---------- Appointments ----------
export const appointmentsApi = {
  async list(citizenId?: string): Promise<Appointment[]> {
    const { data } = await api.get<ApiResponse<Appointment[]>>("/appointments", { params: { citizenId } });
    return data.data ?? [];
  },
  async create(payload: Record<string, unknown>): Promise<Appointment> {
    const { data } = await api.post<ApiResponse<Appointment>>("/appointments", payload);
    return data.data as Appointment;
  },
};

// ---------- Platform Settings (admin) ----------
export const systemApi = {
  async get(): Promise<Record<string, boolean>> {
    const { data } = await api.get<ApiResponse<Record<string, boolean>>>("/settings");
    return data.data ?? {};
  },
  async update(patch: Record<string, boolean>): Promise<Record<string, boolean>> {
    const { data } = await api.put<ApiResponse<Record<string, boolean>>>("/settings", patch);
    return data.data ?? {};
  },
};

// ---------- Reports / Overview ----------
export interface ReportOverview {
  departments: number;
  officers: number;
  assets: number;
  complaints: number;
  emergencies: number;
  appointments: number;
  generatedAt: string;
}

export interface DepartmentBreakdown {
  departmentId: string | null;
  departmentName: string | null;
  total: number;
  open: number;
  resolved: number;
  avgResolutionHours: number;
}

export interface ReportAnalytics {
  totalComplaints: number;
  resolvedComplaints: number;
  resolutionRate: number;
  avgResolutionHours: number;
  slaBreachCount: number;
  byDepartment: DepartmentBreakdown[];
  generatedAt: string;
}

export const reportsApi = {
  async overview(): Promise<ReportOverview> {
    const { data } = await api.get<ApiResponse<ReportOverview>>("/reports/overview");
    return data.data as ReportOverview;
  },
  async analytics(): Promise<ReportAnalytics> {
    const { data } = await api.get<ApiResponse<ReportAnalytics>>("/reports/analytics");
    return data.data as ReportAnalytics;
  },
};

// ---------- Notifications ----------
export const notificationsApi = {
  async list(params: Record<string, unknown> = {}): Promise<AppNotification[]> {
    const { data } = await api.get<ApiResponse<AppNotification[]>>("/notifications", { params });
    return data.data ?? [];
  },
  async unreadCount(userId?: string): Promise<number> {
    const { data } = await api.get<ApiResponse<{ unread: number }>>("/notifications/unread-count", { params: { userId } });
    return data.data?.unread ?? 0;
  },
  async markRead(id: string): Promise<AppNotification> {
    const { data } = await api.patch<ApiResponse<AppNotification>>(`/notifications/${id}/read`);
    return data.data as AppNotification;
  },
  async markAllRead(userId?: string): Promise<void> {
    await api.post("/notifications/read-all", { userId });
  },
  async preferences(userId?: string): Promise<Record<string, boolean> | null> {
    const { data } = await api.get<ApiResponse<Record<string, boolean>>>("/notifications/preferences", { params: { userId } });
    return data.data ?? null;
  },
  async updatePreferences(payload: Record<string, unknown>): Promise<Record<string, boolean> | null> {
    const { data } = await api.put<ApiResponse<Record<string, boolean>>>("/notifications/preferences", payload);
    return data.data ?? null;
  },
  async send(payload: { userId?: string; title: string; message: string; type?: string; channel?: string }): Promise<AppNotification> {
    const { data } = await api.post<ApiResponse<AppNotification>>("/notifications/send", payload);
    return data.data as AppNotification;
  },
};