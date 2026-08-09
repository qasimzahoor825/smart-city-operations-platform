export interface HealthStatus {
  service: string;
  status: "UP" | "DOWN" | "DEGRADED";
  dbPing: boolean;
  uptimeSeconds: number;
  timestamp: string;
}

export interface SystemSettingsDto {
  id: string;
  platformName: string;
  maintenanceMode: boolean;
  allowRegistrations: boolean;
  allowPublicComplaints: boolean;
  notificationsEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSettingsDto {
  platformName?: string;
  maintenanceMode?: boolean;
  allowRegistrations?: boolean;
  allowPublicComplaints?: boolean;
  notificationsEnabled?: boolean;
}

export interface SystemMetricsDto {
  totalRequests: number;
  activeUsers: number;
  apiCalls: number;
  startedAt: string;
  recordedAt: string;
}