import api from "@/services/api-client";
import type { ApiResponse, LiveSensorReading, MapMarker } from "@/types";

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
    const { data } = await api.get<ApiResponse<GisLayer[]>>("/layers");
    return data.data ?? [];
  },
  async markers(type?: string, status?: string): Promise<MapMarker[]> {
    const { data } = await api.get<ApiResponse<MapMarker[]>>("/markers", {
      params: { type: type || undefined, status: status || undefined, limit: 1000 },
    });
    return data.data ?? [];
  },
  async stats(): Promise<MarkerStats> {
    const { data } = await api.get<ApiResponse<MarkerStats>>("/markers/stats");
    return data.data as MarkerStats;
  },
  async search(q: string): Promise<MapMarker[]> {
    const { data } = await api.get<ApiResponse<MapMarker[]>>("/search", { params: { q } });
    return data.data ?? [];
  },
};

export const iotApi = {
  async live(): Promise<LiveSensorReading[]> {
    const { data } = await api.get<ApiResponse<LiveSensorReading[]>>("/readings/live");
    return data.data ?? [];
  },
};