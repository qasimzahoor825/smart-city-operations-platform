import { collection } from "../../../core/database/repository";

export interface SystemSettings {
  id: string;
  platformName: string;
  maintenanceMode: boolean;
  allowRegistrations: boolean;
  allowPublicComplaints: boolean;
  notificationsEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SystemMetrics {
  id: string;
  totalRequests: number;
  activeUsers: number;
  apiCalls: number;
  startedAt: string;
}

const now = new Date();
const seededStartedAt = new Date(now.getTime() - 12 * 3_600_000).toISOString();

export const seedSettings: SystemSettings[] = [
  {
    id: "settings_platform",
    platformName: "SmartCity OS",
    maintenanceMode: false,
    allowRegistrations: true,
    allowPublicComplaints: true,
    notificationsEnabled: true,
    createdAt: new Date(now.getTime() - 90 * 86_400_000).toISOString(),
    updatedAt: now.toISOString(),
  },
];

export const seedMetrics: SystemMetrics[] = [
  {
    id: "metrics_platform",
    totalRequests: 128_940,
    activeUsers: 1_547,
    apiCalls: 1_310_872,
    startedAt: seededStartedAt,
  },
];

export const systemRepository = {
  settings: collection<SystemSettings>("system_settings"),

  metrics: collection<SystemMetrics>("system_metrics"),
  recordRequest(): void {
    const current = this.metrics.all()[0];
    if (!current) return;
    this.metrics.update(current.id, {
      totalRequests: current.totalRequests + 1,
      apiCalls: current.apiCalls + 1,
    });
  },

  reset(): void {
    this.settings.seed(seedSettings);
    this.metrics.seed(seedMetrics);
  },
};

export default systemRepository;