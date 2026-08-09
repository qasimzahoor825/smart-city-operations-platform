import { NotFoundError } from "@smartcity/common";
import { systemRepository, type SystemMetrics, type SystemSettings } from "../repository";
import type {
  HealthStatus,
  SystemMetricsDto,
  SystemSettingsDto,
  UpdateSettingsDto,
} from "../dto";

function toSettingsDto(settings: SystemSettings): SystemSettingsDto {
  return {
    id: settings.id,
    platformName: settings.platformName,
    maintenanceMode: settings.maintenanceMode,
    allowRegistrations: settings.allowRegistrations,
    allowPublicComplaints: settings.allowPublicComplaints,
    notificationsEnabled: settings.notificationsEnabled,
    createdAt: settings.createdAt,
    updatedAt: settings.updatedAt,
  };
}

function toMetricsDto(metrics: SystemMetrics): SystemMetricsDto {
  return {
    totalRequests: metrics.totalRequests,
    activeUsers: metrics.activeUsers,
    apiCalls: metrics.apiCalls,
    startedAt: metrics.startedAt,
    recordedAt: new Date().toISOString(),
  };
}

async function pingDatabase(): Promise<boolean> {
  return true;
}

export const systemService = {
  async health(): Promise<HealthStatus> {
    const dbPing = await pingDatabase();
    return {
      service: "SmartCity OS Backend",
      status: dbPing ? "UP" : "DOWN",
      dbPing,
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  },

  async getSettings(): Promise<SystemSettingsDto> {
    const settings = systemRepository.settings.all()[0];
    if (!settings) throw new NotFoundError("Platform settings not found");
    return toSettingsDto(settings);
  },

  async updateSettings(dto: UpdateSettingsDto): Promise<SystemSettingsDto> {
    const settings = systemRepository.settings.all()[0];
    if (!settings) throw new NotFoundError("Platform settings not found");
    const patch: Partial<SystemSettings> = { updatedAt: new Date().toISOString() };
    if (dto.platformName !== undefined) patch.platformName = dto.platformName.trim();
    if (dto.maintenanceMode !== undefined) patch.maintenanceMode = dto.maintenanceMode;
    if (dto.allowRegistrations !== undefined) patch.allowRegistrations = dto.allowRegistrations;
    if (dto.allowPublicComplaints !== undefined) patch.allowPublicComplaints = dto.allowPublicComplaints;
    if (dto.notificationsEnabled !== undefined) patch.notificationsEnabled = dto.notificationsEnabled;
    const updated = systemRepository.settings.update(settings.id, patch);
    if (!updated) throw new NotFoundError("Platform settings not found");
    return toSettingsDto(updated);
  },

  async getMetrics(): Promise<SystemMetricsDto> {
    const metrics = systemRepository.metrics.all()[0];
    if (!metrics) throw new NotFoundError("Metrics not available");
    return toMetricsDto(metrics);
  },
};

export default systemService;