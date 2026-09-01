import api from "@/services/api-client";
import type { Anomaly, AnomalyOverview, ApiResponse, LiveSensorReading, MapMarker } from "@/types";

export interface GisLayer {
  id: string;
  name: string;
  visible: boolean;
  color: string;
  description?: string;
}

export interface MarkerStats {
  total: number;
  byType: Record<string, number>;
}

export const gisApi = {
  async layers(): Promise<GisLayer[]> {
    const { data } = await api.get<ApiResponse<GisLayer[]>>("/gis/layers");
    return data.data ?? [];
  },
  async markers(type?: string, status?: string): Promise<MapMarker[]> {
    const { data } = await api.get<ApiResponse<MapMarker[]>>("/gis/markers", {
      params: { type: type || undefined, status: status || undefined, limit: 1000 },
    });
    return data.data ?? [];
  },
  async stats(): Promise<MarkerStats> {
    const { data } = await api.get<ApiResponse<MarkerStats>>("/gis/markers/stats");
    return data.data as MarkerStats;
  },
  async search(q: string): Promise<MapMarker[]> {
    const { data } = await api.get<ApiResponse<MapMarker[]>>("/gis/search", { params: { q } });
    return data.data ?? [];
  },
};

export const iotApi = {
  async live(): Promise<LiveSensorReading[]> {
    const { data } = await api.get<ApiResponse<LiveSensorReading[]>>("/readings/live");
    return data.data ?? [];
  },
  async sensors(): Promise<LiveSensorReading[]> {
    const { data } = await api.get<ApiResponse<LiveSensorReading[]>>("/iot/sensors");
    return data.data ?? [];
  },
  async sensorReadings(sensorId: string, limit = 120): Promise<LiveSensorReading[]> {
    const { data } = await api.get<ApiResponse<LiveSensorReading[]>>(`/iot/readings/${sensorId}`, {
      params: { limit },
    });
    return data.data ?? [];
  },
  async anomalies(limit = 50): Promise<Anomaly[]> {
    const { data } = await api.get<ApiResponse<Anomaly[]>>("/iot/anomalies", { params: { limit } });
    return data.data ?? [];
  },
  async anomalyOverview(): Promise<AnomalyOverview | null> {
    const { data } = await api.get<ApiResponse<AnomalyOverview>>("/iot/anomalies/overview");
    return data.data ?? null;
  },
};