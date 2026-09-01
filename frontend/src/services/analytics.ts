import api from "@/services/api-client";
import type { ApiResponse, ForecastResult } from "@/types";

export const analyticsApi = {
  async forecast(days = 30): Promise<ForecastResult | null> {
    const { data } = await api.get<ApiResponse<ForecastResult>>("/analytics/forecast", {
      params: { days },
    });
    return data.data ?? null;
  },
};